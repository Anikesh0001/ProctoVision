import React from "react";
import { Eye, Brain, Target, Layers, Zap, Camera } from "lucide-react";

const ConceptsOverview = () => {
  const concepts = [
    {
      icon: Eye,
      title: "Computer Vision",
      description:
        "The field of AI that enables computers to interpret and understand visual information from the world.",
      details: [
        "Image processing",
        "Pattern recognition",
        "Feature extraction",
        "Visual understanding",
      ],
    },
    {
      icon: Target,
      title: "Object Detection",
      description:
        "Identifying and locating objects within images or video streams in real-time.",
      details: [
        "Bounding box prediction",
        "Class classification",
        "Confidence scoring",
        "Multi-object detection",
      ],
    },
    {
      icon: Brain,
      title: "Neural Networks",
      description:
        "Deep learning models that mimic the human brain to process visual information.",
      details: [
        "Convolutional layers",
        "Feature maps",
        "Backpropagation",
        "Weight optimization",
      ],
    },
    {
      icon: Layers,
      title: "YOLO Algorithm",
      description:
        "You Only Look Once - A real-time object detection system that processes entire images.",
      details: [
        "Single neural network",
        "Grid-based detection",
        "Anchor boxes",
        "Non-max suppression",
      ],
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Processing video frames fast enough to provide immediate feedback and responses.",
      details: [
        "Frame rate optimization",
        "GPU acceleration",
        "Model compression",
        "Edge computing",
      ],
    },
    {
      icon: Camera,
      title: "Applications",
      description:
        "Real-world uses of computer vision technology across various industries.",
      details: [
        "Autonomous vehicles",
        "Medical imaging",
        "Security systems",
        "Quality control",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Computer Vision Fundamentals
        </h2>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          Explore the core concepts behind modern object detection and computer
          vision systems
        </p>
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept, index) => {
          const Icon = concept.icon;
          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {concept.title}
                </h3>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                {concept.description}
              </p>

              <div className="space-y-2">
                {concept.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-purple-200">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Demo Preview */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Interactive Learning Modules
          </h3>
          <p className="text-purple-300">
            Navigate through the tabs above to explore hands-on demonstrations
            of each concept
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-sm">YOLO Architecture Visualization</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm">Live Object Detection Demo</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-300">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">Bounding Box Playground</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptsOverview;
