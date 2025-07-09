import React, { useState, useEffect } from "react";
import {
  Camera,
  Shield,
  AlertTriangle,
  Settings,
  BrainCircuit,
} from "lucide-react";
import RealTimeDetection from "./components/RealTimeDetection";
import DetectionSettings from "./components/DetectionSettings";
import DetectionLogs from "./components/DetectionLogs";
import PoseDetection from "./components/PoseDetection";
import ConceptsOverview from "./components/ConceptsOverview";
import YOLOArchitecture from "./components/YOLOArchitecture";

const playAlertSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.3
    );
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (error) {
    console.warn("⚠️ Alert sound error:", error);
  }
};

function App() {
  const [activeTab, setActiveTab] = useState("detection");
  const [detectionSettings, setDetectionSettings] = useState({
    sensitivity: 0.6,
    alertSound: true,
    logEvents: true,
    suspiciousClasses: [
      "book",
      "cell phone",
      "remote",
      "scissors",
      "teddy bear",
      "hair drier",
      "toothbrush",
    ],
  });
  const [detectionLogs, setDetectionLogs] = useState([]);
  const [poseAlerts, setPoseAlerts] = useState([]);
  const [lastSuspiciousTime, setLastSuspiciousTime] = useState(0);
  const [lastPoseMessage, setLastPoseMessage] = useState("");
  const [poseExplanation, setPoseExplanation] = useState("");
  const [riskScore, setRiskScore] = useState(0);

  const tabs = [
    { id: "detection", label: "Live Detection", icon: Camera },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logs", label: "Detection Logs", icon: AlertTriangle },
    { id: "learning", label: "YOLO Learning", icon: BrainCircuit }, // ✅ CP7
  ];

  const updateRiskScore = (type) => {
    setRiskScore((prev) => {
      let newScore = prev;
      if (["Looking Away", "Head Tilt Detected"].includes(type)) {
        newScore += 15;
      } else if (detectionSettings.suspiciousClasses.includes(type)) {
        newScore += 10;
      }
      return Math.min(newScore, 100);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore((prev) => Math.max(prev - 1, 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addDetectionLog = (detection) => {
    if (detectionSettings.logEvents && detection?.class) {
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        object: detection.class,
        confidence: detection.score,
        suspicious: detectionSettings.suspiciousClasses.includes(
          detection.class
        ),
      };
      setDetectionLogs((prev) => [logEntry, ...prev.slice(0, 99)]);
      if (logEntry.suspicious) {
        updateRiskScore(detection.class);
      }
    }
  };

  const handleCheatingPose = (alertType) => {
    const now = Date.now();
    if (!alertType || alertType === "Pose Normal") {
      setLastPoseMessage("");
      setLastSuspiciousTime(0);
      setPoseExplanation("");
      addDetectionLog(alertType);
      return;
    }

    if (detectionSettings.alertSound) {
      playAlertSound();
    }

    setLastSuspiciousTime(now);
    setLastPoseMessage(alertType);
    setPoseExplanation(getExplanationForPose(alertType));
    updateRiskScore(alertType);

    const logEntry = {
      id: now,
      timestamp: new Date().toLocaleString(),
      object: alertType,
      confidence: 1.0,
      suspicious: true,
    };

    setPoseAlerts((prev) => [logEntry, ...prev.slice(0, 99)]);
    setDetectionLogs((prev) => [logEntry, ...prev.slice(0, 99)]);
  };

  const getExplanationForPose = (alertType) => {
    switch (alertType) {
      case "Looking Away":
        return "The student is looking away from the screen — could be distracted or cheating.";
      case "Head Tilt Detected":
        return "The student tilted their head, possibly checking surroundings or notes.";
      default:
        return "Unusual posture or movement detected.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Exam Monitoring System
                </h1>
                <p className="text-red-300 text-sm">
                  Real-time Cheat Detection with AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-red-300">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Monitoring</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black/10 backdrop-blur-sm border-b border-red-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "text-red-300 border-red-400 bg-red-500/10"
                      : "text-gray-400 border-transparent hover:text-red-300 hover:border-red-500/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "detection" && (
          <>
            <PoseDetection onCheatingPose={handleCheatingPose} />
            <div className="mb-4 text-center">
              <div className="text-sm text-gray-300">
                🧪 Cheating Risk Score:{" "}
                <span
                  className={`font-bold ${
                    riskScore >= 70
                      ? "text-red-500"
                      : riskScore >= 40
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {riskScore}%
                </span>
              </div>
            </div>
            {Date.now() - lastSuspiciousTime < 5000 && (
              <div className="bg-red-600/90 text-white font-bold text-center py-2 rounded mb-4 animate-pulse">
                🚨 Suspicious Behavior Detected: {lastPoseMessage}
              </div>
            )}
            {!lastPoseMessage && (
              <div className="text-green-400 text-sm text-center mb-4">
                ✅ Student is in proper posture
              </div>
            )}
            <RealTimeDetection
              settings={detectionSettings}
              onDetection={addDetectionLog}
            />
          </>
        )}
        {activeTab === "settings" && (
          <DetectionSettings
            settings={detectionSettings}
            onSettingsChange={setDetectionSettings}
          />
        )}
        {activeTab === "logs" && (
          <DetectionLogs
            logs={detectionLogs}
            onClearLogs={() => setDetectionLogs([])}
          />
        )}
        {activeTab === "learning" && (
          <div className="space-y-12">
            <ConceptsOverview />
            <YOLOArchitecture />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-red-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              Real-time AI-powered Exam Monitoring System
            </p>
            <p className="text-xs mt-2 text-red-400">
              Educational demonstration • Use responsibly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
