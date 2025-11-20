import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SKILL_NODES, SKILL_LINKS } from '../constants';
import { SkillNode, SkillLink } from '../types';

export const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Types for D3 simulation
    const nodes: any[] = SKILL_NODES.map(d => ({ ...d }));
    const links: any[] = SKILL_LINKS.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => {
        switch (d.group) {
          case 0: return "#fff";
          case 1: return "#0ea5e9"; // Cloud - Blue
          case 2: return "#10b981"; // Network - Green
          case 3: return "#ef4444"; // Security - Red
          case 4: return "#eab308"; // Tools - Yellow
          default: return "#94a3b8";
        }
      })
      .call(drag(simulation) as any);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.label)
      .attr("font-size", "12px")
      .attr("fill", "#cbd5e1")
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .style("font-family", "monospace");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden relative">
       <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">
        SKILL_TOPOLOGY_V1.0
      </div>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};