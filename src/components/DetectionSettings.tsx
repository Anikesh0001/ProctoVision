import React from "react";
import { Settings, Volume2, VolumeX, AlertTriangle, Save } from "lucide-react";

const DetectionSettings = ({ settings, onSettingsChange }) => {
  const updateSetting = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const toggleSuspiciousClass = (className) => {
    const updatedClasses = settings.suspiciousClasses.includes(className)
      ? settings.suspiciousClasses.filter((c) => c !== className)
      : [...settings.suspiciousClasses, className];

    updateSetting("suspiciousClasses", updatedClasses);
  };

  const commonObjects = [
    "book",
    "cell phone",
    "remote",
    "scissors",
    "teddy bear",
    "hair drier",
    "toothbrush",
    "bottle",
    "cup",
    "knife",
    "spoon",
    "bowl",
    "banana",
    "apple",
    "sandwich",
    "laptop",
    "mouse",
    "keyboard",
    "clock",
    "vase",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Detection Settings</h2>
        <p className="text-xl text-red-300 max-w-3xl mx-auto">
          Configure the AI detection system for optimal monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detection Parameters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-red-400" />
            Detection Parameters
          </h3>

          <div className="space-y-6">
            {/* Sensitivity Slider */}
            <div>
              <label className="block text-white font-medium mb-3">
                Detection Sensitivity: {Math.round(settings.sensitivity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.sensitivity}
                onChange={(e) =>
                  updateSetting("sensitivity", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Low (10%)</span>
                <span>High (90%)</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Higher sensitivity detects more objects but may increase false
                positives
              </p>
            </div>

            {/* Alert Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Alert Settings</h4>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.alertSound ? (
                    <Volume2 className="w-5 h-5 text-red-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <span className="text-white font-medium">Audio Alerts</span>
                    <p className="text-sm text-gray-400">
                      Play sound when suspicious objects detected
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateSetting("alertSound", !settings.alertSound)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.alertSound ? "bg-red-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.alertSound ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      settings.logEvents ? "text-red-400" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <span className="text-white font-medium">
                      Event Logging
                    </span>
                    <p className="text-sm text-gray-400">
                      Save detection events with timestamps
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateSetting("logEvents", !settings.logEvents)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.logEvents ? "bg-red-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.logEvents ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suspicious Objects */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Suspicious Objects
          </h3>

          <p className="text-gray-300 mb-4">
            Select which objects should trigger cheating alerts when detected
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {commonObjects.map((object) => (
              <button
                key={object}
                onClick={() => toggleSuspiciousClass(object)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  settings.suspiciousClasses.includes(object)
                    ? "bg-red-600/30 border border-red-400 text-white"
                    : "bg-gray-800/50 border border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize text-sm">{object}</span>
                  {settings.suspiciousClasses.includes(object) && (
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>Selected:</strong> {settings.suspiciousClasses.length}{" "}
              objects will trigger alerts
            </p>
          </div>
        </div>
      </div>

      {/* Preset Configurations */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
        <h3 className="text-xl font-bold text-white mb-6">Quick Presets</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              onSettingsChange({
                ...settings,
                sensitivity: 0.7,
                suspiciousClasses: ["book", "cell phone", "remote"],
              })
            }
            className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            <h4 className="text-white font-medium mb-2">Basic Monitoring</h4>
            <p className="text-blue-300 text-sm">Common cheat items only</p>
          </button>

          <button
            onClick={() =>
              onSettingsChange({
                ...settings,
                sensitivity: 0.6,
                suspiciousClasses: [
                  "book",
                  "cell phone",
                  "remote",
                  "scissors",
                  "bottle",
                  "cup",
                ],
              })
            }
            className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/30 transition-colors"
          >
            <h4 className="text-white font-medium mb-2">Standard Exam</h4>
            <p className="text-yellow-300 text-sm">Moderate detection level</p>
          </button>

          <button
            onClick={() =>
              onSettingsChange({
                ...settings,
                sensitivity: 0.5,
                suspiciousClasses: commonObjects.slice(0, 10),
              })
            }
            className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            <h4 className="text-white font-medium mb-2">High Security</h4>
            <p className="text-red-300 text-sm">Maximum detection coverage</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetectionSettings;
