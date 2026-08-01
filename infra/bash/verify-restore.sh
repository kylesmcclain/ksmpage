#!/usr/bin/env bash
#
# Restore verification drill.
#
# A backup that has never been restored is a hypothesis. This script converts it into a
# measurement: it takes the most recent backup, restores it into a disposable database,
# asserts the data is actually there and internally consistent, records how long the whole
# thing took, and destroys the copy.
#
# The recovery time it prints is the only honest RTO figure an organisation has. Everything
# else is an estimate made by someone who has not tried it.
#
# Designed to run unattended on a schedule and to page loudly on failure — a drill that only
# runs when someone remembers to run it tells you nothing about the quarter you did not.
#
# Usage:
#   ./verify-restore.sh --backup-dir /var/backups/pg --min-rows 1000
#   ./verify-restore.sh --backup-dir ./dumps --dry-run

set -Eeuo pipefail
shopt -s inherit_errexit 2>/dev/null || true

readonly SCRIPT_NAME="${0##*/}"
readonly START_EPOCH="$(date +%s)"

BACKUP_DIR=""
MIN_ROWS=1
MAX_AGE_HOURS=26          # A daily backup older than this has silently stopped running.
SCRATCH_DB=""
DRY_RUN=false
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"

# --------------------------------------------------------------------------- output

log()  { printf '%s [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "${*:2}" >&2; }
info() { log INFO "$@"; }
warn() { log WARN "$@"; }
fail() { log ERROR "$@"; exit 1; }

usage() {
    cat <<EOF
$SCRIPT_NAME — restore a backup into a disposable database and prove it is usable.

Options:
  --backup-dir PATH     Directory containing *.dump files (required)
  --min-rows N          Fail if the largest restored table has fewer than N rows (default: $MIN_ROWS)
  --max-age-hours N     Fail if the newest backup is older than this (default: $MAX_AGE_HOURS)
  --dry-run             Check preconditions and the backup file, but do not restore
  -h, --help            Show this message

Exit codes:
  0  restore verified
  1  verification failed — the backup cannot be relied on
  2  usage or precondition error
EOF
}

# --------------------------------------------------------------------------- cleanup

cleanup() {
    local exit_code=$?

    # The scratch database must go even if the restore exploded, or the next run collides
    # with the wreckage of this one.
    if [[ -n "$SCRATCH_DB" ]] && ! $DRY_RUN; then
        info "Dropping scratch database $SCRATCH_DB"
        dropdb --if-exists --force "$SCRATCH_DB" 2>/dev/null \
            || warn "Could not drop $SCRATCH_DB — clean this up manually"
    fi

    local elapsed=$(( $(date +%s) - START_EPOCH ))
    if [[ $exit_code -eq 0 ]]; then
        info "Drill completed in ${elapsed}s"
    else
        warn "Drill FAILED after ${elapsed}s (exit $exit_code)"
    fi

    exit "$exit_code"
}
trap cleanup EXIT
trap 'fail "Interrupted"' INT TERM

# --------------------------------------------------------------------------- args

while [[ $# -gt 0 ]]; do
    case "$1" in
        --backup-dir)    BACKUP_DIR="${2:?--backup-dir requires a value}"; shift 2 ;;
        --min-rows)      MIN_ROWS="${2:?--min-rows requires a value}"; shift 2 ;;
        --max-age-hours) MAX_AGE_HOURS="${2:?--max-age-hours requires a value}"; shift 2 ;;
        --dry-run)       DRY_RUN=true; shift ;;
        -h|--help)       usage; exit 0 ;;
        *)               usage >&2; fail "Unknown argument: $1" ;;
    esac
done

[[ -n "$BACKUP_DIR" ]] || { usage >&2; exit 2; }
[[ -d "$BACKUP_DIR" ]] || fail "Backup directory does not exist: $BACKUP_DIR"

for binary in pg_restore psql createdb dropdb; do
    command -v "$binary" >/dev/null 2>&1 || fail "Required binary not found: $binary"
done

# --------------------------------------------------------------------------- select

info "Selecting most recent backup from $BACKUP_DIR"

# NUL-delimited so filenames with spaces cannot split a path.
latest=""
while IFS= read -r -d '' candidate; do
    if [[ -z "$latest" || "$candidate" -nt "$latest" ]]; then
        latest="$candidate"
    fi
done < <(find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.dump' -print0)

[[ -n "$latest" ]] || fail "No *.dump files found in $BACKUP_DIR"

backup_epoch="$(stat -c %Y "$latest" 2>/dev/null || stat -f %m "$latest")"
age_hours=$(( ( $(date +%s) - backup_epoch ) / 3600 ))
size_bytes="$(stat -c %s "$latest" 2>/dev/null || stat -f %z "$latest")"

info "Selected: $latest"
info "Age: ${age_hours}h, size: $(numfmt --to=iec-i --suffix=B "$size_bytes" 2>/dev/null || echo "${size_bytes}B")"

# An empty or truncated dump restores "successfully" and proves nothing.
(( size_bytes > 1024 )) || fail "Backup is implausibly small (${size_bytes} bytes) — treat as corrupt"

if (( age_hours > MAX_AGE_HOURS )); then
    fail "Newest backup is ${age_hours}h old (limit ${MAX_AGE_HOURS}h) — the backup job has stopped running"
fi

# Verify the archive's own table of contents before spending time on a restore.
if ! pg_restore --list "$latest" >/dev/null 2>&1; then
    fail "pg_restore cannot read the archive — the backup is corrupt"
fi
info "Archive table of contents is readable"

if $DRY_RUN; then
    info "Dry run requested — stopping before restore"
    exit 0
fi

# --------------------------------------------------------------------------- restore

SCRATCH_DB="restore_drill_$(date +%Y%m%d_%H%M%S)_$$"
info "Creating scratch database $SCRATCH_DB"
createdb "$SCRATCH_DB" || fail "Could not create scratch database"

restore_start="$(date +%s)"
info "Restoring (this is the number that matters)"

# --exit-on-error turns a partial restore into a failure. A half-restored database that
# reports success is the worst possible outcome of this script.
if ! pg_restore --dbname "$SCRATCH_DB" --no-owner --no-privileges --exit-on-error --jobs 4 "$latest"; then
    fail "Restore failed — this backup is not usable"
fi

restore_seconds=$(( $(date +%s) - restore_start ))
info "Restore completed in ${restore_seconds}s"

# --------------------------------------------------------------------------- assert

info "Verifying restored contents"

table_count="$(psql --dbname "$SCRATCH_DB" --tuples-only --no-align --command \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');")"

(( table_count > 0 )) || fail "Restored database contains no user tables"
info "Tables restored: $table_count"

# Live row estimates from the planner: exact counts on a large database would dominate the
# drill's runtime and the point here is presence, not precision.
largest_rows="$(psql --dbname "$SCRATCH_DB" --tuples-only --no-align --command \
    "SELECT COALESCE(max(n_live_tup), 0) FROM pg_stat_user_tables;")"

if (( largest_rows < MIN_ROWS )); then
    fail "Largest table holds ${largest_rows} rows, below the ${MIN_ROWS} threshold — the backup restored but appears empty"
fi
info "Largest table holds approximately ${largest_rows} rows"

# Constraint validation catches a dump that restored structurally but lost referential
# integrity — a failure mode that a row count alone will happily miss.
invalid_constraints="$(psql --dbname "$SCRATCH_DB" --tuples-only --no-align --command \
    "SELECT count(*) FROM pg_constraint WHERE NOT convalidated;")"

(( invalid_constraints == 0 )) || fail "${invalid_constraints} constraint(s) failed validation after restore"
info "All constraints validated"

cat <<EOF

  RESTORE DRILL PASSED
  ────────────────────────────────────────────
  Backup file      $latest
  Backup age       ${age_hours}h
  Restore time     ${restore_seconds}s   <- measured RTO
  Tables           $table_count
  Largest table    ~${largest_rows} rows
  Constraints      all validated

EOF
