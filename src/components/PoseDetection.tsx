import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";

const PoseDetection = ({ onCheatingPose }) => {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const intervalRef = useRef(null);

  const [leftEyeY, setLeftEyeY] = useState(null);
  const [rightEyeY, setRightEyeY] = useState(null);
  const [noseX, setNoseX] = useState(null);
  const [message, setMessage] = useState("📡 Initializing pose detection...");

  useEffect(() => {
    const setup = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      const detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        {
          modelType: "SinglePose.Lightning",
          enableSmoothing: true,
        }
      );
      detectorRef.current = detector;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !detectorRef.current) return;

        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const leftEye = keypoints[1]; // index for left eye
          const rightEye = keypoints[2]; // index for right eye
          const nose = keypoints[0]; // index for nose

          setLeftEyeY(leftEye?.y);
          setRightEyeY(rightEye?.y);
          setNoseX(nose?.x);
          let suspicious = false;

          if (leftEye && rightEye && Math.abs(leftEye.y - rightEye.y) > 25) {
            onCheatingPose("Head Tilt Detected");
            setMessage("⚠️ Head tilt detected");
            suspicious = true;
          } else if (nose && (nose.x < 180 || nose.x > 460)) {
            onCheatingPose("Looking Away");
            setMessage("⚠️ Looking away from screen");
            suspicious = true;
          }

          if (!suspicious) {
            setMessage("✅ Pose Normal");
            onCheatingPose("Pose Normal");
            onCheatingPose(""); // 🧼 tell App it's normal again
          }
        }
      }, 1000);
    };

    setup();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onCheatingPose]);

  return (
    <div className="text-sm bg-black/20 rounded p-3 text-gray-300 font-mono space-y-1 shadow-md border border-red-500/30">
      <p>👁️ Left Eye Y: {leftEyeY?.toFixed(2) || "–"}</p>
      <p>👁️ Right Eye Y: {rightEyeY?.toFixed(2) || "–"}</p>
      <p>👃 Nose X: {noseX?.toFixed(2) || "–"}</p>
      <p className="text-red-400 font-semibold">{message}</p>
    </div>
  );
};

export default PoseDetection;
