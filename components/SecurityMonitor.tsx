import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { SECURITY_STATS, RISK_APPS } from '../constants';

const COLORS = ['#ff6700', '#c4d600', '#0ea5e9', '#facc15'];

export const SecurityMonitor: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Traffic Analysis */}
      <div className="bg-white p-4 border-2 border-black shadow-hard flex flex-col">
        <h3 className="text-xl font-display mb-4 bg-black text-white p-2 inline-block w-fit">
          TRAFFIC_ANALYSIS (GB)
        </h3>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SECURITY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#000" fontSize={10} fontWeight={700} />
              <YAxis stroke="#000" fontSize={10} fontWeight={700} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="value" fill="#0ea5e9" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white p-4 border-2 border-black shadow-hard flex flex-col">
        <h3 className="text-xl font-display mb-4 bg-y2k-orange text-white p-2 inline-block w-fit border-2 border-black">
          RISK_ASSESSMENT
        </h3>
        <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={RISK_APPS}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                dataKey="value"
                stroke="#000"
                strokeWidth={2}
              >
                {RISK_APPS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0px #000' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="square"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Firewall Logs */}
      <div className="lg:col-span-2 bg-black p-4 border-2 border-black shadow-hard font-mono text-xs">
         <h3 className="text-y2k-lime text-lg mb-2 border-b border-y2k-lime pb-1">>> LIVE_PACKET_STREAM_V1.LOG</h3>
         <div className="h-48 overflow-y-auto space-y-1 text-gray-300 bg-gray-900 p-2 border border-gray-700">
            <div className="flex gap-4"><span className="text-gray-500">10:42:01</span> <span className="text-green-400">ALLOW</span> TCP 192.168.0.54 -{'>'} 108.237.42.37 (443)</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:03</span> <span className="text-red-500">BLOCK</span> UDP 148.64.122.194 -{'>'} Internal (Malicious IP)</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:05</span> <span className="text-green-400">ALLOW</span> HTTPS Tunnel Established (Fortinet)</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:08</span> <span className="text-yellow-500">WARN</span>  High Latency Detected on VLAN 20 (WiFi)</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:12</span> <span className="text-green-400">ALLOW</span> SSH Session Opened: root@renegade-lab-srv01</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:15</span> <span className="text-cyan-400">INFO</span>  Daily Backup Completed: 2.4TB Transferred</div>
            <div className="flex gap-4"><span className="text-gray-500">10:42:22</span> <span className="text-green-400">ALLOW</span> TCP 192.168.10.100 -{'>'} Printer_01 (9100)</div>
         </div>
      </div>
    </div>
  );
};