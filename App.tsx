import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NetworkGraph } from './components/NetworkGraph';
import { SecurityMonitor } from './components/SecurityMonitor';
import { Terminal } from './components/Terminal';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { ProjectDeepDive } from './components/ProjectDeepDive';
import { ViewState } from './types';

function App() {
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.NETWORK:
        return (
          <div className="h-full flex flex-col gap-4">
             <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-mono text-white mb-2">Skill Topology</h3>
                <p className="text-sm text-slate-400">Interactive visualization of technical competencies and their relationships.</p>
             </div>
             <div className="flex-1 min-h-[500px]">
                <NetworkGraph />
             </div>
          </div>
        );
      case ViewState.ARCHITECTURE:
        return <ArchitectureViewer />;
      case ViewState.SECURITY:
        return (
          <div className="h-full flex flex-col gap-4">
             <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-mono text-white">Security Operations Center</h3>
                  <p className="text-sm text-slate-400">Real-time threat analysis and bandwidth monitoring (Mock Data based on Fortinet Reports).</p>
                </div>
                <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded text-xs font-mono border border-red-500/20 animate-pulse">
                   DEFCON 4
                </div>
             </div>
             <div className="flex-1">
                <SecurityMonitor />
             </div>
          </div>
        );
      case ViewState.TERMINAL:
        return (
          <div className="h-[80vh] flex flex-col gap-4">
             <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-mono text-white">Command Line Interface</h3>
                <p className="text-sm text-slate-400">Interact with the system using natural language or standard commands. Powered by Gemini AI.</p>
             </div>
             <div className="flex-1">
                <Terminal />
             </div>
          </div>
        );
      case ViewState.PROJECTS:
        return (
           <div className="pb-10">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Project Logs</h2>
                <p className="text-slate-400">Select a project module below to access classified operational details.</p>
             </div>
             <ProjectDeepDive />
           </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderContent()}
    </Layout>
  );
}

export default App;
