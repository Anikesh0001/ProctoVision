import React, { useRef, useEffect, useState } from "react";
import {
  Camera,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const RealTimeDetection = ({ settings, onDetection }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [model, setModel] = useState(null);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [alertActive, setAlertActive] = useState(false);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [multiplePersonWarning, setMultiplePersonWarning] = useState(false);

  const [stats, setStats] = useState({
    totalDetections: 0,
    suspiciousDetections: 0,
    fps: 0,
  });
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const isDetectingRef = useRef(false);

  // Audio context for alert sound
  const audioContextRef = useRef(null);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);

  const [splitScreenWarning, setSplitScreenWarning] = useState(false);
  useEffect(() => {
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.warn("⚠️ Tab switch detected!");
        setTabSwitchWarning(true);
        playAlertSound();

        setTimeout(() => setTabSwitchWarning(false), 3000);
      }
    };

    const handleResize = () => {
      const widthRatio = window.innerWidth / initialWidth;
      const heightRatio = window.innerHeight / initialHeight;

      if (widthRatio < 0.7 || heightRatio < 0.7) {
        console.warn("⚠️ Split screen or minimized window detected!");
        setSplitScreenWarning(true);
        playAlertSound();

        setTimeout(() => setSplitScreenWarning(false), 3000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);

    initializeSystem();

    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const cleanup = () => {
    console.log("🧹 Cleaning up...");
    isDetectingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const initializeSystem = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🚀 Initializing TensorFlow.js...");
      await tf.ready();
      console.log("✅ TensorFlow.js ready, backend:", tf.getBackend());

      console.log("📦 Loading COCO-SSD model...");
      const loadedModel = await cocoSsd.load({ base: "mobilenet_v2" });
      setModel(loadedModel);
      console.log("✅ Model loaded successfully");

      await setupCamera(); // Important: Wait for camera setup
      setCameraReady(true);

      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error initializing system:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const setupCamera = async () => {
    try {
      console.log("📹 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded");
          videoRef.current
            .play()
            .then(() => {
              console.log("▶️ Video playing");
              setCameraReady(true);
            })
            .catch((err) => {
              console.error("❌ Error playing video:", err);
              setError("Failed to start video playbook");
            });
        };
      }
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
      setError(
        "Camera access denied. Please allow camera permissions and refresh."
      );
    }
  };

  const playAlertSound = () => {
    if (!settings.alertSound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(
        800,
        audioContextRef.current.currentTime
      );
      oscillator.frequency.setValueAtTime(
        600,
        audioContextRef.current.currentTime + 0.1
      );
      oscillator.frequency.setValueAtTime(
        800,
        audioContextRef.current.currentTime + 0.2
      );

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContextRef.current.currentTime + 0.3
      );

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.error("❌ Error playing alert sound:", error);
    }
  };

  const detectObjects = async () => {
    if (
      !model ||
      !videoRef.current ||
      !canvasRef.current ||
      !cameraReady ||
      !isDetectingRef.current
    ) {
      console.log("⚠️ Detection skipped - missing requirements");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure video is playing and has dimensions
    if (video.readyState !== 4 || video.videoWidth === 0) {
      console.log("⚠️ Video not ready for detection");
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      console.log("🔍 Running detection...");

      // Run detection with very low confidence threshold
      const predictions = await model.detect(video, undefined, 0.2);

      console.log(
        `📊 Raw predictions: ${predictions.length}`,
        predictions.map((p) => `${p.class}:${(p.score * 100).toFixed(1)}%`)
      );

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter predictions - use lower threshold for better detection
      const validPredictions = predictions.filter(
        (prediction) => prediction.score >= 0.25 // Very low threshold
      );

      // Check for multiple persons
      // Check how many people are detected
      const persons = validPredictions.filter((p) => p.class === "person");
      const multiplePersonsDetected = persons.length > 1;

      if (multiplePersonsDetected && !multiplePersonWarning) {
        console.warn("🚨 More than one person detected!");
        setMultiplePersonWarning(true);
        playAlertSound();

        setTimeout(() => setMultiplePersonWarning(false), 3000);
      }

      console.log(`✅ Valid detections: ${validPredictions.length}`);

      let hasSuspiciousObject = false;
      const detections = [];

      validPredictions.forEach((prediction, index) => {
        const [x, y, width, height] = prediction.bbox;
        const isSuspicious = settings.suspiciousClasses.includes(
          prediction.class
        );

        console.log(
          `${index + 1}. ${prediction.class} (${(
            prediction.score * 100
          ).toFixed(1)}%) - ${isSuspicious ? "🚨 SUSPICIOUS" : "✅ Normal"}`
        );

        if (isSuspicious) {
          hasSuspiciousObject = true;
        }

        // Draw bounding box - make it very visible
        // Use red box if multiple persons are detected
        if (prediction.class === "person" && multiplePersonsDetected) {
          ctx.strokeStyle = "#ff0000"; // red for multiple persons
          ctx.lineWidth = 8;
        } else {
          ctx.strokeStyle = isSuspicious ? "#ff0000" : "#00ff00";
          ctx.lineWidth = isSuspicious ? 8 : 6;
        }

        ctx.strokeRect(x, y, width, height);

        // Draw label background - larger and more visible
        const label = `${prediction.class.toUpperCase()} ${Math.round(
          prediction.score * 100
        )}%`;
        ctx.font = "bold 20px Arial"; // Even larger font
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = isSuspicious ? "#ff0000" : "#00ff00";
        ctx.fillRect(x, y - 35, textWidth + 20, 35); // Larger background

        // Draw label text
        ctx.fillStyle = "white";
        ctx.fillText(label, x + 10, y - 10);

        // Add confidence bar
        const barWidth = Math.max(100, width);
        const barHeight = 8;
        const barX = x;
        const barY = y + height + 10;

        // Background bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Confidence bar
        ctx.fillStyle = isSuspicious ? "#ff0000" : "#00ff00";
        ctx.fillRect(barX, barY, barWidth * prediction.score, barHeight);

        detections.push({
          ...prediction,
          suspicious: isSuspicious,
        });

        // Log detection for the parent component
        onDetection(prediction);
      });

      setCurrentDetections(detections);

      // Handle suspicious object alert
      if (hasSuspiciousObject && !alertActive) {
        console.log("🚨🚨🚨 SUSPICIOUS OBJECT DETECTED! 🚨🚨🚨");
        setAlertActive(true);
        playAlertSound();
        setStats((prev) => ({
          ...prev,
          suspiciousDetections: prev.suspiciousDetections + 1,
        }));

        // Reset alert after 3 seconds
        setTimeout(() => setAlertActive(false), 3000);
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalDetections: prev.totalDetections + validPredictions.length,
      }));

      // Calculate FPS
      frameCountRef.current++;
      const currentTime = performance.now();
      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = frameCountRef.current;
        console.log(`📈 FPS: ${fps}`);
        setStats((prev) => ({
          ...prev,
          fps: fps,
        }));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
    } catch (error) {
      console.error("❌ Error during detection:", error);
    }
  };

  const startDetection = () => {
    if (!model || !cameraReady) {
      console.log("⚠️ Cannot start detection - model or camera not ready");
      console.log("Model loaded:", !!model);
      console.log("Camera ready:", cameraReady);
      return;
    }

    console.log("🎯 Starting detection loop...");
    setIsDetecting(true);
    isDetectingRef.current = true;

    // Reset FPS counter
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();

    const detect = async () => {
      if (isDetectingRef.current) {
        await detectObjects();
        animationRef.current = requestAnimationFrame(detect);
      }
    };

    detect();
  };

  const stopDetection = () => {
    console.log("⏹️ Stopping detection...");
    setIsDetecting(false);
    isDetectingRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setCurrentDetections([]);
    setStats((prev) => ({ ...prev, fps: 0 }));
  };

  const toggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const restartSystem = () => {
    cleanup();
    setModel(null);
    setCameraReady(false);
    setError(null);
    setCurrentDetections([]);
    setStats({ totalDetections: 0, suspiciousDetections: 0, fps: 0 });
    initializeSystem();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">System Error</h3>
          <p className="text-red-400">{error}</p>
          <button
            onClick={restartSystem}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Restart System</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white text-lg">Loading AI Model...</p>
          <p className="text-gray-400 text-sm">This may take a few moments</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              TensorFlow.js: {tf.ready() ? "✅ Ready" : "⏳ Loading..."}
            </div>
            <div>Model: {model ? "✅ Loaded" : "⏳ Loading..."}</div>
            <div>Camera: {cameraReady ? "✅ Ready" : "⏳ Initializing..."}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertActive && (
        <div className="bg-red-600/90 border border-red-500 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">
              🚨 CHEATING DETECTED! 🚨
            </span>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      {/* Tab Switch Warning */}
      {tabSwitchWarning && (
        <div className="bg-yellow-600/90 border border-yellow-400 rounded-lg p-4 animate-pulse mb-4">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">
              ⚠️ Tab Switching Detected!
            </span>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      {multiplePersonWarning && (
        <div className="bg-red-700/90 border border-red-400 rounded-lg p-4 animate-pulse mb-4">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">
              🚨 More Than One Person Detected!
            </span>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {splitScreenWarning && (
        <div className="bg-orange-600/90 border border-orange-400 rounded-lg p-4 animate-pulse mb-4">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">
              ⚠️ Split-Screen or Minimized Window Detected!
            </span>
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleDetection}
          disabled={!model || !cameraReady}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isDetecting
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isDetecting ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>{isDetecting ? "Stop" : "Start"} Detection</span>
        </button>

        <button
          onClick={() => (settings.alertSound = !settings.alertSound)}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          {settings.alertSound ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={restartSystem}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Test Instructions */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-300 font-bold mb-2">
          🧪 Test Detection with These Objects:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="text-yellow-200">📱 Cell Phone</div>
          <div className="text-yellow-200">📖 Book</div>
          <div className="text-yellow-200">🍎 Apple</div>
          <div className="text-yellow-200">☕ Cup</div>
          <div className="text-yellow-200">✂️ Scissors</div>
          <div className="text-yellow-200">🖱️ Mouse</div>
          <div className="text-yellow-200">⌨️ Keyboard</div>
          <div className="text-yellow-200">🍌 Banana</div>
        </div>
        <p className="text-yellow-300 text-xs mt-2">
          Hold objects clearly in front of the camera. Detection threshold set
          to 25% for maximum sensitivity!
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>Model: {model ? "✅ Loaded" : "❌ Not loaded"}</div>
          <div>Camera: {cameraReady ? "✅ Ready" : "❌ Not ready"}</div>
          <div>Backend: {tf.getBackend()}</div>
          <div>Detection: {isDetecting ? "🟢 Running" : "🔴 Stopped"}</div>
          <div>Threshold: 25% (Ultra Low)</div>
        </div>
      </div>

      {/* Main Detection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-3">
          <div className="bg-black rounded-xl overflow-hidden border border-red-500/20 relative">
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">
                  Live Camera Feed
                </span>
                {isDetecting && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-gray-400 text-sm">
                {videoRef.current
                  ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
                  : "640x480"}{" "}
                • {stats.fps} FPS
              </span>
            </div>

            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-auto"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          {/* Detection Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold text-white mb-4">
              Detection Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span
                  className={`font-medium ${
                    isDetecting ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {isDetecting ? "🟢 Active" : "🔴 Stopped"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">FPS:</span>
                <span className="text-white font-medium">{stats.fps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Objects Detected:</span>
                <span className="text-white font-medium">
                  {currentDetections.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Suspicious Objects:</span>
                <span className="text-red-400 font-medium">
                  {currentDetections.filter((d) => d.suspicious).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Alerts:</span>
                <span className="text-red-400 font-medium">
                  {stats.suspiciousDetections}
                </span>
              </div>
            </div>
          </div>

          {/* Current Detections */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold text-white mb-4">
              Live Detections
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentDetections.map((detection, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    detection.suspicious
                      ? "bg-red-900/20 border-red-500/30"
                      : "bg-green-900/20 border-green-500/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">
                      {detection.class}
                    </span>
                    <span className="text-sm text-gray-300">
                      {Math.round(detection.score * 100)}%
                    </span>
                  </div>
                  {detection.suspicious && (
                    <div className="text-xs text-red-400 mt-1 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      🚨 Suspicious Object
                    </div>
                  )}
                </div>
              ))}

              {currentDetections.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  {isDetecting
                    ? "👀 Scanning for objects..."
                    : "Start detection to see results"}
                </div>
              )}
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Model Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Model:</span>
                <span className="text-red-300">COCO-SSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Backend:</span>
                <span className="text-red-300">{tf.getBackend()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Threshold:</span>
                <span className="text-red-300">25% (Ultra Sensitive)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Classes:</span>
                <span className="text-red-300">
                  {settings.suspiciousClasses.length} suspicious
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDetection;
