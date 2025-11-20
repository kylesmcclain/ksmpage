
import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Move, Network, Server, Globe } from 'lucide-react';
import { ROCHE_NODES, ROCHE_LINKS, HEINZ_NODES, HEINZ_LINKS } from '../constants';
import { ArchNode } from '../types';
import { playRetroSound } from '../utils/soundEffects';

export const ArchitectureViewer: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeNetwork, setActiveNetwork] = useState<'roche' | 'heinz'>('roche');
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<ArchNode | null>(null);

  const activeNodes = activeNetwork === 'roche' ? ROCHE_NODES : HEINZ_NODES;
  const activeLinks = activeNetwork === 'roche' ? ROCHE_LINKS : HEINZ_LINKS;

  const handleSwitchNetwork = (net: 'roche' | 'heinz') => {
     playRetroSound('click');
     setActiveNetwork(net);
     // Reset view
     setScale(1);
     setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleZoom = (delta: number) => {
     playRetroSound('hover'); // subtle click for zoom
     setScale(s => Math.max(0.5, Math.min(2, s + delta)));
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'firewall': return '#ff6700'; // Orange
      case 'server': return '#0ea5e9'; // Blue
      case 'cloud': return '#c4d600'; // Green
      case 'device': return '#facc15'; // Yellow
      default: return '#fff';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'firewall': return 'FW';
      case 'server': return 'SRV';
      case 'cloud': return 'NET';
      case 'device': return 'DEV';
      default: return '???';
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Control Panel */}
      <div className="bg-white p-4 border-2 border-black shadow-hard flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-display">NETWORK_TOPOLOGY_VIEWER</h3>
          <p className="text-xs font-bold text-gray-500">SELECT A DIAGRAM TO INSPECT</p>
        </div>
        
        <div className="flex bg-gray-100 border-2 border-black p-1 gap-1">
           <button 
             onClick={() => handleSwitchNetwork('roche')}
             className={`px-4 py-1 font-bold text-sm border-2 transition-all ${activeNetwork === 'roche' ? 'bg-y2k-green border-black shadow-hard-sm' : 'border-transparent text-gray-500'}`}
           >
             ROCHE INTEGRATION
           </button>
           <button 
             onClick={() => handleSwitchNetwork('heinz')}
             className={`px-4 py-1 font-bold text-sm border-2 transition-all ${activeNetwork === 'heinz' ? 'bg-y2k-green border-black shadow-hard-sm' : 'border-transparent text-gray-500'}`}
           >
             OFFICE NETWORK
           </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleZoom(-0.1)} className="p-2 bg-white border-2 border-black hover:bg-gray-100"><ZoomOut size={16} /></button>
          <button onClick={() => { playRetroSound('click'); setPosition({ x: 0, y: 0 }); setScale(1); }} className="p-2 bg-white border-2 border-black hover:bg-gray-100"><Move size={16} /></button>
          <button onClick={() => handleZoom(0.1)} className="p-2 bg-white border-2 border-black hover:bg-gray-100"><ZoomIn size={16} /></button>
        </div>
      </div>

      <div 
        className="flex-1 bg-[#e2e8f0] border-2 border-black shadow-hard overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {/* Info Overlay */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 z-20 w-64 bg-white border-2 border-black p-4 shadow-hard animate-in fade-in duration-200 pointer-events-none">
            <h4 className="font-display text-lg mb-1">{hoveredNode.label}</h4>
            <span className="text-xs font-bold bg-black text-white px-1">{hoveredNode.type.toUpperCase()}</span>
            <p className="text-sm font-medium mt-2 border-t-2 border-gray-100 pt-2">{hoveredNode.details}</p>
          </div>
        )}

        <div 
          className="w-full h-full transition-transform duration-75 ease-linear origin-top-left"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        >
          <svg className="w-full h-full min-w-[800px] min-h-[600px]" viewBox="0 0 800 600">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
              </marker>
            </defs>

            {/* Links */}
            {activeLinks.map((link, i) => {
              const start = activeNodes.find(n => n.id === link.source);
              const end = activeNodes.find(n => n.id === link.target);
              if (!start || !end) return null;

              return (
                <g key={i}>
                  <line 
                    x1={start.x} y1={start.y} 
                    x2={end.x} y2={end.y} 
                    stroke={link.type === 'encrypted' ? '#ff6700' : '#000'} 
                    strokeWidth={link.type === 'encrypted' ? 4 : 2}
                    strokeDasharray={link.type === 'encrypted' ? '5,5' : ''}
                    markerEnd="url(#arrowhead)"
                  />
                  {link.label && (
                    <g>
                      <rect 
                        x={(start.x + end.x) / 2 - 40} 
                        y={(start.y + end.y) / 2 - 10} 
                        width="80" height="16" 
                        fill="white" stroke="black" strokeWidth="1" 
                      />
                      <text 
                        x={(start.x + end.x) / 2} 
                        y={(start.y + end.y) / 2 + 2} 
                        textAnchor="middle" 
                        fill="black" 
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {link.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {activeNodes.map((node) => (
              <g 
                key={node.id} 
                transform={`translate(${node.x},${node.y})`}
                onMouseEnter={() => { setHoveredNode(node); playRetroSound('hover'); }}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer hover:scale-110 transition-transform"
              >
                <circle r="26" fill="black" />
                <circle r="24" fill={getNodeColor(node.type)} stroke="black" strokeWidth="2" />
                <text 
                  textAnchor="middle" 
                  dy="5" 
                  fill="black" 
                  fontSize="10" 
                  fontWeight="900"
                  fontFamily="Inter"
                >
                  {getNodeIcon(node.type)}
                </text>
                
                <rect 
                  x="-50" y="30" width="100" height="20" 
                  fill="white" stroke="black" strokeWidth="2" 
                />
                <text 
                  textAnchor="middle" 
                  dy="44" 
                  fill="black" 
                  fontSize="11" 
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
