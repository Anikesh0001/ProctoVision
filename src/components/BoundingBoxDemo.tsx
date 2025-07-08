import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Square, Trash2, Download, Settings } from 'lucide-react';

const BoundingBoxDemo = () => {
  const [boxes, setBoxes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedClass, setSelectedClass] = useState('person');
  const [confidence, setConfidence] = useState(0.85);
  const canvasRef = useRef(null);

  const classes = [
    { name: 'person', color: 'rgb(34, 197, 94)' },
    { name: 'phone', color: 'rgb(59, 130, 246)' },
    { name: 'book', color: 'rgb(168, 85, 247)' },
    { name: 'paper', color: 'rgb(239, 68, 68)' },
    { name: 'laptop', color: 'rgb(245, 158, 11)' },
    { name: 'cup', color: 'rgb(236, 72, 153)' }
  ];

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      class: selectedClass,
      confidence: confidence,
      color: classes.find(c => c.name === selectedClass)?.color || 'rgb(34, 197, 94)'
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentBox) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentBox(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
  };

  const handleMouseUp = () => {
    if (currentBox && isDrawing) {
      const width = Math.abs(currentBox.endX - currentBox.startX);
      const height = Math.abs(currentBox.endY - currentBox.startY);
      
      if (width > 10 && height > 10) { // Minimum box size
        setBoxes(prev => [...prev, {
          ...currentBox,
          id: Date.now(),
          x: Math.min(currentBox.startX, currentBox.endX),
          y: Math.min(currentBox.startY, currentBox.endY),
          width,
          height
        }]);
      }
    }
    
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const deleteBox = (id) => {
    setBoxes(prev => prev.filter(box => box.id !== id));
  };

  const clearAll = () => {
    setBoxes([]);
  };

  const exportAnnotations = () => {
    const annotations = boxes.map(box => ({
      class: box.class,
      confidence: box.confidence,
      bbox: [box.x, box.y, box.width, box.height]
    }));
    
    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Interactive Bounding Box Playground</h2>
        <p className="text-xl text-purple-300 max-w-3xl mx-auto">
          Draw bounding boxes, assign classes, and understand how object detection annotations work
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointer className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Annotation Canvas</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearAll}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={exportAnnotations}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full bg-gradient-to-br from-slate-800 to-slate-900 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {/* Render boxes */}
              {boxes.map((box) => (
                <div
                  key={box.id}
                  className="absolute border-2 group"
                  style={{
                    left: `${(box.x / 640) * 100}%`,
                    top: `${(box.y / 480) * 100}%`,
                    width: `${(box.width / 640) * 100}%`,
                    height: `${(box.height / 480) * 100}%`,
                    borderColor: box.color
                  }}
                >
                  <div
                    className="absolute -top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded"
                    style={{ backgroundColor: box.color }}
                  >
                    {box.class} {(box.confidence * 100).toFixed(0)}%
                  </div>
                  <button
                    onClick={() => deleteBox(box.id)}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Current drawing box */}
              {currentBox && isDrawing && (
                <div
                  className="absolute border-2 border-dashed"
                  style={{
                    left: `${(Math.min(currentBox.startX, currentBox.endX) / 640) * 100}%`,
                    top: `${(Math.min(currentBox.startY, currentBox.endY) / 480) * 100}%`,
                    width: `${(Math.abs(currentBox.endX - currentBox.startX) / 640) * 100}%`,
                    height: `${(Math.abs(currentBox.endY - currentBox.startY) / 480) * 100}%`,
                    borderColor: currentBox.color
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Class Selection */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Square className="w-5 h-5 mr-2 text-purple-400" />
              Object Class
            </h3>
            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.name}
                  onClick={() => setSelectedClass(cls.name)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    selectedClass === cls.name
                      ? 'bg-purple-600/30 border border-purple-400'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-white capitalize">{cls.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Confidence
            </h3>
            <div className="space-y-3">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-white font-medium">
                {(confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Boxes:</span>
                <span className="text-white font-medium">{boxes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Confidence:</span>
                <span className="text-white font-medium">
                  {boxes.length > 0 
                    ? `${((boxes.reduce((sum, box) => sum + box.confidence, 0) / boxes.length) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-3">How to Use</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>1. Select an object class</p>
              <p>2. Adjust confidence level</p>
              <p>3. Click and drag to draw boxes</p>
              <p>4. Hover over boxes to delete</p>
              <p>5. Export annotations as JSON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundingBoxDemo;