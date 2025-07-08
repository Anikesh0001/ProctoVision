import React, { useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // must be imported to run in browser

const RealTimeDetection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access webcam", err);
      }
    };

    const loadModel = async () => {
      modelRef.current = await cocoSsd.load();
      console.log("✅ COCO-SSD model loaded");
    };

    startCamera();
    loadModel();
  }, []);

  // Detect loop
  useEffect(() => {
    const detectFrame = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        modelRef.current &&
        canvasRef.current
      ) {
        const predictions = await modelRef.current.detect(videoRef.current);
        const ctx = canvasRef.current.getContext("2d");

        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        predictions.forEach((prediction) => {
          if (!ctx) return;

          const [x, y, width, height] = prediction.bbox;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          ctx.font = "14px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 5 : y + 15
          );
        });
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video rounded overflow-hidden shadow-lg border border-red-500">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default RealTimeDetection;
