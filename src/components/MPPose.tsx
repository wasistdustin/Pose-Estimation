import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";
import Reps from "./Reps";

let cnt = 0;
const MPPose = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let pushUp = true;

  const [angleText, setAngleText] = useState("");
  const [angleText1, setAngleText1] = useState("");
  const [diffY, setDiffY] = useState("");
  const [direction, setDirection] = useState("");
  const [counter, setCounter] = useState(0);
  const [text, setText] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });
    pose.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          const video = webcamRef.current?.video;
          if (video) {
            await pose.send({ image: video });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);

  const onResults = (results: Results) => {
    const video = webcamRef.current?.video;
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;

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
    if (results.poseLandmarks) {
      //console.log("Found Hand");
      const landmarksArray = [results.poseLandmarks];
      for (const landmarks of landmarksArray) {
        drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
      const comText = <Reps array={results} />;
      setText(comText);
    }
    canvasCtx.restore();
  };

  return (
    <>
      <div style={{ fontSize: 60 }}>
        <br />
        {text}
        <br />
      </div>
      <div>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
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
        ></Webcam>
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
      </div>
    </>
  );
};

export default MPPose;
