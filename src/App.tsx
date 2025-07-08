import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white font-sans">
      {/* Header */}
      <header className="text-center py-6 border-b border-red-600">
        <h1 className="text-3xl font-bold text-red-400">VisionSentinel</h1>
        <p className="text-sm text-red-200">Real-time Cheat Detection System</p>
      </header>

      <main className="max-w-5xl mx-auto py-10 space-y-8 px-6">
        {/* Detection Section */}
        <section className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📷 Live Detection</h2>
          <div className="border border-dashed border-red-400 rounded h-64 flex items-center justify-center text-gray-400">
            Video Feed Placeholder
          </div>
        </section>

        {/* Settings Section */}
        <section className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">⚙️ Detection Settings</h2>
          <div className="text-gray-400 italic">
            Settings panel coming soon…
          </div>
        </section>

        {/* Logs Section */}
        <section className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📝 Detection Logs</h2>
          <div className="text-gray-400 italic">No logs yet.</div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-red-600 text-xs text-red-300">
        Built with React + Tailwind • CP1 Layout Complete
      </footer>
    </div>
  );
}

export default App;
