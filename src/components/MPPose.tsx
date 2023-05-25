import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";
import Reps from "./Reps";
import Canvas from "./Canvas";

const MPPose = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [results, setResults] = useState<Results | null>(null);

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

  //draw markers with canvas + start counter component
  const onResults = (results: Results) => {
    if (results.poseLandmarks) {
      const landmarksArray = [results.poseLandmarks];
      //start Reps component (counting push-ups)
      setResults(results);
    } else {
      setResults(null);
    }
  };

  return (
    <>
      <div style={{ fontSize: 60 }}>
        <br />
        {results && <Reps results={results} />}
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
          />
        )}
      </div>
    </>
  );
};

export default MPPose;
