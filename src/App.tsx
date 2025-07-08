import React, { useState, useEffect } from "react";
import RealTimeDetection from "./components/RealTimeDetection";
import PoseDetection from "./components/PoseDetection";
import AlertBanner from "./components/AlertBanner";
import DetectionLogs from "./components/DetectionLogs";

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
  const [riskScore, setRiskScore] = useState(0);
  const [lastSuspiciousTime, setLastSuspiciousTime] = useState(0);
  const [lastPoseMessage, setLastPoseMessage] = useState("");
  const [poseExplanation, setPoseExplanation] = useState("");
  const [detectionLogs, setDetectionLogs] = useState([]);

  const [detectionSettings] = useState({
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

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore((prev) => Math.max(prev - 1, 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateRiskScore = (type: string) => {
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

  const getExplanationForPose = (alertType: string) => {
    switch (alertType) {
      case "Looking Away":
        return "The student is looking away from the screen.";
      case "Head Tilt Detected":
        return "Head tilt might indicate checking surroundings.";
      default:
        return "Unusual movement detected.";
    }
  };

  const handleCheatingPose = (alertType: string) => {
    const now = Date.now();

    if (!alertType || alertType === "Pose Normal") {
      setLastPoseMessage("");
      setLastSuspiciousTime(0);
      setPoseExplanation("");
      return;
    }

    if (detectionSettings.alertSound) {
      playAlertSound();
    }

    setLastSuspiciousTime(now);
    setLastPoseMessage(alertType);
    setPoseExplanation(getExplanationForPose(alertType));
    updateRiskScore(alertType);

    // Also log this pose
    const logEntry = {
      id: now,
      timestamp: new Date().toLocaleString(),
      object: alertType,
      confidence: 1.0,
      suspicious: true,
    };

    setDetectionLogs((prev) => [logEntry, ...prev.slice(0, 99)]);
  };

  const addDetectionLog = (detection) => {
    if (
      detectionSettings.logEvents &&
      detection &&
      detection.class &&
      detection.score !== undefined
    ) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white font-sans">
      {/* Header */}
      <header className="text-center py-6 border-b border-red-600">
        <h1 className="text-3xl font-bold text-red-400">VisionSentinel</h1>
        <p className="text-sm text-red-200">Real-time Cheat Detection System</p>
      </header>

      <main className="max-w-5xl mx-auto py-10 space-y-8 px-6">
        {/* Pose Detection */}
        <PoseDetection onCheatingPose={handleCheatingPose} />

        {/* Risk Score + Alert */}
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

        <AlertBanner
          message={lastPoseMessage}
          visible={Date.now() - lastSuspiciousTime < 5000}
        />

        {!lastPoseMessage && (
          <div className="text-green-400 text-sm text-center mb-4">
            ✅ Student is in proper posture
          </div>
        )}

        {/* Live Detection */}
        <section className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📷 Live Detection</h2>
          <RealTimeDetection
            settings={detectionSettings}
            onDetection={addDetectionLog}
          />
        </section>

        {/* Logs Section */}
        <section className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📝 Detection Logs</h2>
          <DetectionLogs
            logs={detectionLogs}
            onClearLogs={() => setDetectionLogs([])}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-red-600 text-xs text-red-300">
        Built with React + Tailwind • CP5 Complete
      </footer>
    </div>
  );
}

export default App;
