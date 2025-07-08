import React from "react";

interface AlertBannerProps {
  message: string;
  visible: boolean;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <div className="bg-red-600/90 text-white font-bold text-center py-2 rounded mb-4 animate-pulse shadow-lg border border-red-400/30">
      🚨 Suspicious Behavior Detected: {message}
    </div>
  );
};

export default AlertBanner;
