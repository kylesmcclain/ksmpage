#Requires -Version 7.2
<#
.SYNOPSIS
    Reports identity-posture gaps across a Microsoft 365 tenant.

.DESCRIPTION
    Produces the evidence an auditor actually asks for: who can sign in without MFA, which
    privileged roles are permanently assigned, which accounts are stale, and which legacy
    authentication protocols are still reachable.

    The output is deliberately machine-readable. A posture report that only renders in a
    console cannot be diffed between quarters, and "we improved" is not an auditable claim
    unless you can show the previous file.

    Read-only. This script never writes to the tenant — remediation is a separate, reviewed
    change, because a script that can both find and fix problems will eventually be run by
    someone who only meant to look.

.PARAMETER StaleAfterDays
    An account with no interactive sign-in in this many days is reported as stale.

.PARAMETER OutputPath
    Destination for the JSON report. Defaults to a timestamped file in the working directory.

.EXAMPLE
    ./Get-M365IdentityPosture.ps1 -StaleAfterDays 60 -OutputPath ./q3-posture.json

.NOTES
    Requires Microsoft.Graph with, at minimum, the following delegated scopes:
        Directory.Read.All, AuditLog.Read.All, Policy.Read.All, RoleManagement.Read.Directory
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 365)]
    [int]$StaleAfterDays = 90,

    [string]$OutputPath = "m365-identity-posture-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RequiredScopes = @(
    'Directory.Read.All'
    'AuditLog.Read.All'
    'Policy.Read.All'
    'RoleManagement.Read.Directory'
)

# Roles whose permanent assignment is worth flagging regardless of headcount.
$HighPrivilegeRoles = @(
    'Global Administrator'
    'Privileged Role Administrator'
    'Security Administrator'
    'Exchange Administrator'
    'SharePoint Administrator'
    'User Administrator'
)

function Assert-GraphConnection {
    <#
        Fail early and specifically. A missing scope surfaces 200 lines later as an opaque
        403, and the person running this at 8am before an audit call does not need that.
    #>
    $context = Get-MgContext
    if ($null -eq $context) {
        throw "Not connected to Microsoft Graph. Run: Connect-MgGraph -Scopes $($RequiredScopes -join ',')"
    }

    $missing = $RequiredScopes | Where-Object { $_ -notin $context.Scopes }
    if ($missing) {
        throw "Connected, but missing required scope(s): $($missing -join ', ')"
    }

    Write-Verbose "Connected to tenant $($context.TenantId) as $($context.Account)"
}

function Get-UsersWithoutStrongAuth {
    <#
        Registration is not enforcement: a user can be registered for MFA and still be exempt
        from every Conditional Access policy that would demand it. Both are reported.
    #>
    Write-Verbose 'Evaluating authentication-method registration...'

    Get-MgReportAuthenticationMethodUserRegistrationDetail -All |
        Where-Object { -not $_.IsMfaCapable } |
        ForEach-Object {
            [pscustomobject]@{
                UserPrincipalName = $_.UserPrincipalName
                DisplayName       = $_.UserDisplayName
                IsAdmin           = $_.IsAdmin
                MfaCapable        = $_.IsMfaCapable
                MfaRegistered     = $_.IsMfaRegistered
                Finding           = 'No MFA-capable authentication method registered'
                Severity          = if ($_.IsAdmin) { 'critical' } else { 'high' }
            }
        }
}

function Get-PermanentPrivilegedAssignments {
    Write-Verbose 'Enumerating privileged role assignments...'

    $roles = Get-MgDirectoryRole -All | Where-Object { $_.DisplayName -in $HighPrivilegeRoles }

    foreach ($role in $roles) {
        $members = Get-MgDirectoryRoleMember -DirectoryRoleId $role.Id -All
        foreach ($member in $members) {
            [pscustomobject]@{
                Role      = $role.DisplayName
                PrincipalId = $member.Id
                Finding   = 'Standing assignment to a high-privilege role'
                Severity  = if ($role.DisplayName -eq 'Global Administrator') { 'critical' } else { 'high' }
                Guidance  = 'Prefer eligible (just-in-time) assignment over permanent membership.'
            }
        }
    }
}

function Get-StaleAccounts {
    param([int]$Days)

    Write-Verbose "Identifying accounts with no interactive sign-in in $Days days..."
    $cutoff = (Get-Date).AddDays(-$Days)

    Get-MgUser -All -Property 'id,userPrincipalName,displayName,accountEnabled,signInActivity' |
        Where-Object {
            $_.AccountEnabled -and
            $null -ne $_.SignInActivity -and
            $_.SignInActivity.LastSignInDateTime -lt $cutoff
        } |
        ForEach-Object {
            [pscustomobject]@{
                UserPrincipalName = $_.UserPrincipalName
                DisplayName       = $_.DisplayName
                LastSignIn        = $_.SignInActivity.LastSignInDateTime
                DaysSinceSignIn   = [int]((Get-Date) - $_.SignInActivity.LastSignInDateTime).TotalDays
                Finding           = 'Enabled account with no recent interactive sign-in'
                Severity          = 'medium'
                Guidance          = 'Disable before deleting — deletion destroys the audit trail.'
            }
        }
}

function Get-ConditionalAccessGaps {
    Write-Verbose 'Reviewing Conditional Access policies...'

    $policies = Get-MgIdentityConditionalAccessPolicy -All
    $enabled = @($policies | Where-Object { $_.State -eq 'enabled' })
    $reportOnly = @($policies | Where-Object { $_.State -eq 'enabledForReportingButNotEnforced' })

    $findings = [System.Collections.Generic.List[object]]::new()

    if ($enabled.Count -eq 0) {
        $findings.Add([pscustomobject]@{
            Finding  = 'No Conditional Access policy is enforced'
            Severity = 'critical'
            Guidance = 'MFA registration without an enforcing policy provides no assurance.'
        })
    }

    $blocksLegacyAuth = $enabled | Where-Object {
        $_.Conditions.ClientAppTypes -contains 'exchangeActiveSync' -or
        $_.Conditions.ClientAppTypes -contains 'other'
    }
    if (-not $blocksLegacyAuth) {
        $findings.Add([pscustomobject]@{
            Finding  = 'No policy targets legacy authentication clients'
            Severity = 'critical'
            Guidance = 'Legacy auth bypasses MFA entirely. Block it before anything else.'
        })
    }

    foreach ($policy in $reportOnly) {
        $findings.Add([pscustomobject]@{
            Finding  = "Policy '$($policy.DisplayName)' is report-only and enforces nothing"
            Severity = 'medium'
            Guidance = 'Report-only is a staging state, not a destination.'
        })
    }

    $findings
}

Assert-GraphConnection

$report = [ordered]@{
    generatedAt     = (Get-Date).ToUniversalTime().ToString('o')
    tenantId        = (Get-MgContext).TenantId
    staleAfterDays  = $StaleAfterDays
    findings        = [ordered]@{
        usersWithoutStrongAuth   = @(Get-UsersWithoutStrongAuth)
        permanentPrivilegedRoles = @(Get-PermanentPrivilegedAssignments)
        staleAccounts            = @(Get-StaleAccounts -Days $StaleAfterDays)
        conditionalAccessGaps    = @(Get-ConditionalAccessGaps)
    }
}

$counts = $report.findings.GetEnumerator() | ForEach-Object { $_.Value.Count }
$report['totalFindings'] = ($counts | Measure-Object -Sum).Sum

$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $OutputPath -Encoding utf8

Write-Host ''
Write-Host "Identity posture report written to $OutputPath"
foreach ($category in $report.findings.Keys) {
    '{0,-28} {1,4}' -f $category, $report.findings[$category].Count | Write-Host
}
Write-Host ''
Write-Host "Total findings: $($report.totalFindings)"

# Non-zero exit on a critical finding so this can gate a pipeline rather than only inform a human.
$critical = $report.findings.Values |
    ForEach-Object { $_ } |
    Where-Object { $_.PSObject.Properties.Name -contains 'Severity' -and $_.Severity -eq 'critical' }

if ($critical) {
    Write-Warning "$($critical.Count) critical finding(s) present."
    exit 1
}
exit 0
