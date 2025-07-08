import React, { useState } from "react";
import {
  AlertTriangle,
  Download,
  Trash2,
  Filter,
  Calendar,
} from "lucide-react";

const DetectionLogs = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState("all"); // 'all', 'suspicious', 'normal'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'confidence'

  const filteredLogs = logs.filter((log) => {
    if (filter === "suspicious") return log.suspicious;
    if (filter === "normal") return !log.suspicious;
    return true;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.id - b.id;
      case "confidence":
        return b.confidence - a.confidence;
      case "newest":
      default:
        return b.id - a.id;
    }
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `detection-logs-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const suspiciousCount = logs.filter((log) => log.suspicious).length;
  const totalCount = logs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Detection Logs</h2>
        <p className="text-xl text-red-300 max-w-3xl mx-auto">
          Review all detection events and suspicious activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {totalCount}
            </div>
            <div className="text-gray-300">Total Detections</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {suspiciousCount}
            </div>
            <div className="text-gray-300">Suspicious Objects</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {totalCount - suspiciousCount}
            </div>
            <div className="text-gray-300">Normal Objects</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {totalCount > 0
                ? Math.round((suspiciousCount / totalCount) * 100)
                : 0}
              %
            </div>
            <div className="text-gray-300">Alert Rate</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Detections</option>
              <option value="suspicious">Suspicious Only</option>
              <option value="normal">Normal Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confidence">Highest Confidence</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-red-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Object
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.suspicious ? (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-medium">
                          Suspicious
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 font-medium">
                          Normal
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium capitalize">
                      {log.object}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            log.confidence > 0.8
                              ? "bg-green-400"
                              : log.confidence > 0.6
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${log.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm">
                        {Math.round(log.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedLogs.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No detection logs found</p>
            <p className="text-gray-500 text-sm">
              {filter === "all"
                ? "Start the detection system to see logs here"
                : `No ${filter} detections found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionLogs;
