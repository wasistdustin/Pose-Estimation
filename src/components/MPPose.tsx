import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";
import PushUp from "./PushUp";
import Canvas from "./Canvas";
import Squats from "./Squats";
import Prediction from "./Prediction";

const MPPose = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [results, setResults] = useState<Results | null>(null);
  //Drawing Angles for WO
  const [drawPushUpAnglesR, setDrawPushUpAnglesR] = useState(false);
  const [drawSquatsAnglesR, setDrawSquatsAnglesR] = useState(false);

  useEffect(() => {
    //Init Pose Detection
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

    //get frame for pose estimation
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

  const setDrawValue = (pushUp: boolean, squats: boolean) => {
    setDrawPushUpAnglesR(pushUp);
    setDrawSquatsAnglesR(squats);
  };
  //draw markers with canvas + start counter component
  const onResults = (results: Results) => {
    if (results.poseLandmarks) {
      const landmarksArray = [results.poseLandmarks];
      //start PushUp component (counting push-ups)
      setResults(results);
    } else {
      setResults(null);
    }
  };

  return (
    <>
      <div style={{ fontSize: 50 }}>
        <br />
        {/* {results && (
          <Prediction setDrawValue={setDrawValue} results={results} />
        )} */}
        {results && <PushUp results={results} />}
        {/* {results && <Squats results={results} />} */}
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
        {results && (
          <Canvas
            results={results}
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            drawPushUpAnglesR={drawPushUpAnglesR}
            drawSquatsAnglesR={drawSquatsAnglesR}
          />
        )}
      </div>
    </>
  );
};

export default MPPose;
