import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Camera, AlertTriangle } from 'lucide-react';

const ObjectDetectionDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [detections, setDetections] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Simulated detection data
  const sampleDetections = [
    { id: 1, x: 150, y: 100, width: 80, height: 60, class: 'person', confidence: 0.95 },
    { id: 2, x: 300, y: 150, width: 60, height: 40, class: 'phone', confidence: 0.87 },
    { id: 3, x: 450, y: 200, width: 70, height: 50, class: 'book', confidence: 0.92 }
  ];

  const suspiciousDetections = [
    { id: 4, x: 200, y: 80, width: 40, height: 30, class: 'paper', confidence: 0.89, suspicious: true },
    { id: 5, x: 380, y: 120, width: 35, height: 25, class: 'note', confidence: 0.76, suspicious: true }
  ];

  useEffect(() => {
    if (isPlaying) {
      let frame = 0;
      const animate = () => {
        frame++;
        
        // Simulate detection updates
        if (frame % 60 === 0) { // Every 60 frames (~1 second)
          const shouldShowSuspicious = Math.random() > 0.7;
          if (shouldShowSuspicious) {
            setDetections([...sampleDetections, ...suspiciousDetections]);
            setAlertCount(prev => prev + 1);
          } else {
            setDetections(sampleDetections);
          }
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setDetections(sampleDetections);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setDetections([]);
    setAlertCount(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Live Object Detection Demo</h2>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          Experience real-time object detection with bounding boxes and confidence scores
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePlay}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? 'Pause' : 'Start'} Detection</span>
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Demo Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Feed Simulation */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-xl overflow-hidden border border-purple-500/20">
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Live Feed</span>
                {isPlaying && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
              </div>
              <span className="text-gray-400 text-sm">640x480 • 30 FPS</span>
            </div>
            
            <div className="relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 aspect-video">
              {/* Simulated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50"></div>
              
              {/* Detection boxes */}
              {detections.map((detection) => (
                <div
                  key={detection.id}
                  className={`absolute border-2 ${
                    detection.suspicious ? 'border-red-500' : 'border-green-500'
                  } transition-all duration-300`}
                  style={{
                    left: `${detection.x}px`,
                    top: `${detection.y}px`,
                    width: `${detection.width}px`,
                    height: `${detection.height}px`
                  }}
                >
                  <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded ${
                    detection.suspicious 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {detection.class} {(detection.confidence * 100).toFixed(0)}%
                  </div>
                  
                  {detection.suspicious && (
                    <div className="absolute top-1 right-1">
                      <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Alert overlay */}
              {detections.some(d => d.suspicious) && (
                <div className="absolute top-4 left-4 bg-red-600/90 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
                  ⚠️ SUSPICIOUS OBJECT DETECTED!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detection Panel */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Detection Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Objects Detected:</span>
                <span className="text-white font-medium">{detections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Alerts Triggered:</span>
                <span className="text-red-400 font-medium">{alertCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Processing FPS:</span>
                <span className="text-green-400 font-medium">{isPlaying ? '30' : '0'}</span>
              </div>
            </div>
          </div>

          {/* Detection Log */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Live Detections</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {detections.map((detection) => (
                <div
                  key={detection.id}
                  className={`p-3 rounded-lg border ${
                    detection.suspicious
                      ? 'bg-red-900/20 border-red-500/30'
                      : 'bg-green-900/20 border-green-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{detection.class}</span>
                    <span className="text-sm text-gray-300">
                      {(detection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Position: ({detection.x}, {detection.y})
                  </div>
                </div>
              ))}
              
              {detections.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No detections yet. Start the demo to see live results.
                </div>
              )}
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Model Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Model:</span>
                <span className="text-purple-300">YOLOv8n</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Input Size:</span>
                <span className="text-purple-300">640x640</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Classes:</span>
                <span className="text-purple-300">80 COCO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Confidence:</span>
                <span className="text-purple-300">0.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetectionDemo;