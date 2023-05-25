import React from "react";
import { Results } from "@mediapipe/pose";
import { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";

interface Props {
  results: Results;
  webcamRef: React.MutableRefObject<Webcam | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

const Canvas = ({ results, webcamRef, canvasRef }: Props) => {
  console.log(results);
  console.log(webcamRef);
  console.log(canvasRef);

  useEffect(() => {
    if (!webcamRef || !canvasRef) return;
    const video = webcamRef.current?.video;
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;
    //if (!results) return;
    const videoWidth = video?.videoWidth;
    const videoHeight = video?.videoHeight;
    if (!videoWidth || !videoHeight) return;

    // Set canvas width
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    canvasCtx.translate(videoWidth, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    console.log(results);

    if (results.poseLandmarks) {
      const landmarksArray = [results.poseLandmarks];
      for (const landmarks of landmarksArray) {
        console.log(landmarks);
        drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    } else {
    }
    canvasCtx.restore();
  }, [results, webcamRef, canvasRef]);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: "0",
        right: "0",
        textAlign: "center",
        zIndex: 9,
        width: 1280,
        height: 720,
      }}
    ></canvas>
  );
};

export default Canvas;
