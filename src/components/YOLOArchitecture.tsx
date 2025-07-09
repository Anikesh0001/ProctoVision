import React, { useState } from "react";
import { Layers, ArrowRight, Cpu, Target, Grid3X3 } from "lucide-react";

const YOLOArchitecture = () => {
  const [selectedLayer, setSelectedLayer] = useState(0);

  const layers = [
    {
      name: "Input Image",
      description: "Original image resized to 416x416 pixels",
      details: "YOLO requires fixed input dimensions for consistent processing",
      color: "bg-blue-500",
      width: "w-16",
    },
    {
      name: "Convolutional Layers",
      description: "Feature extraction using multiple conv layers",
      details: "Extracts low-level features like edges, textures, and patterns",
      color: "bg-green-500",
      width: "w-14",
    },
    {
      name: "Darknet Backbone",
      description: "Deep feature extraction network",
      details: "Pre-trained backbone network for robust feature representation",
      color: "bg-purple-500",
      width: "w-12",
    },
    {
      name: "Feature Maps",
      description: "Multi-scale feature representations",
      details: "Different scales capture objects of various sizes",
      color: "bg-yellow-500",
      width: "w-10",
    },
    {
      name: "Detection Head",
      description: "Final prediction layers",
      details:
        "Outputs bounding boxes, confidence scores, and class probabilities",
      color: "bg-red-500",
      width: "w-8",
    },
  ];

  const gridCells = Array.from({ length: 49 }, (_, i) => i);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          YOLO Architecture Deep Dive
        </h2>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          Understanding how "You Only Look Once" revolutionized real-time object
          detection
        </p>
      </div>

      {/* Architecture Visualization */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Layers className="w-6 h-6 mr-2 text-purple-400" />
          Network Architecture Flow
        </h3>

        <div className="flex items-center justify-between space-x-4 mb-8">
          {layers.map((layer, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className={`${layer.color} ${
                  layer.width
                } h-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedLayer === index ? "ring-4 ring-white/50" : ""
                }`}
                onClick={() => setSelectedLayer(index)}
              />
              <span className="text-sm text-white font-medium text-center">
                {layer.name}
              </span>
              {index < layers.length - 1 && (
                <ArrowRight className="w-4 h-4 text-purple-400 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* Layer Details */}
        <div className="bg-black/20 rounded-lg p-6">
          <h4 className="text-xl font-bold text-white mb-2">
            {layers[selectedLayer].name}
          </h4>
          <p className="text-purple-300 mb-2">
            {layers[selectedLayer].description}
          </p>
          <p className="text-gray-400 text-sm">
            {layers[selectedLayer].details}
          </p>
        </div>
      </div>

      {/* Grid Detection Concept */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Grid3X3 className="w-5 h-5 mr-2 text-purple-400" />
            Grid-Based Detection
          </h3>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {gridCells.map((cell) => (
              <div
                key={cell}
                className={`aspect-square rounded border border-purple-500/30 cursor-pointer transition-all duration-200 ${
                  cell === 24 || cell === 25 || cell === 31 || cell === 32
                    ? "bg-red-500/60 border-red-400"
                    : "bg-purple-500/10 hover:bg-purple-500/20"
                }`}
              />
            ))}
          </div>

          <p className="text-gray-300 text-sm">
            YOLO divides the input image into a 7×7 grid. Each cell is
            responsible for detecting objects whose center falls within it.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Key Innovations
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-white font-medium">
                  Single Pass Detection
                </h4>
                <p className="text-gray-400 text-sm">
                  Unlike R-CNN, YOLO processes the entire image in one forward
                  pass
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-white font-medium">
                  Real-time Performance
                </h4>
                <p className="text-gray-400 text-sm">
                  Achieves 45+ FPS on modern GPUs for real-time applications
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-white font-medium">Global Context</h4>
                <p className="text-gray-400 text-sm">
                  Sees the entire image during training and testing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-purple-400" />
          Performance Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">45 FPS</div>
            <div className="text-white font-medium">YOLOv1</div>
            <div className="text-gray-400 text-sm">Real-time detection</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">65 FPS</div>
            <div className="text-white font-medium">YOLOv5</div>
            <div className="text-gray-400 text-sm">Improved accuracy</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              80 FPS
            </div>
            <div className="text-white font-medium">YOLOv8</div>
            <div className="text-gray-400 text-sm">State-of-the-art</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YOLOArchitecture;
