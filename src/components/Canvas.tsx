import React from "react";
import { Results } from "@mediapipe/pose";
import { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";

interface Props {
  results: Results;
  drawRightAngles?: boolean;
  webcamRef: React.MutableRefObject<Webcam | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

const Canvas = ({ results, webcamRef, canvasRef, drawRightAngles }: Props) => {
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
      if (!drawRightAngles) {
        for (const landmarks of landmarksArray) {
          console.log(landmarks);
          drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      } else if (drawRightAngles) {
        const opt = { small: true, round: true };

        const rightWrist = {
          x: landmarksArray[0][16].x, //right Wrist
          y: landmarksArray[0][16].y,
        };
        const rightShoulder = {
          x: landmarksArray[0][12].x, //right Shoulder
          y: landmarksArray[0][12].y,
        };
        const rightHip = {
          x: landmarksArray[0][24].x, //right Hip
          y: landmarksArray[0][24].y,
        };
        const rightElbow = {
          x: landmarksArray[0][14].x, //right Elbow
          y: landmarksArray[0][14].y,
        };
        const rightAnkle = {
          x: landmarksArray[0][28].x, //right Ankle
          y: landmarksArray[0][28].y,
        };
        //Calc Wrist-Ankle-Shoulder Angle
        let angleAnkleR = findAngle(rightWrist, rightAnkle, rightShoulder, opt);
        //Calc Shoulder-Ellbow-Wrist Angle
        let angleElbowR = findAngle(rightShoulder, rightElbow, rightWrist, opt);
        //Calc Shoulder-Hip-Ankle Angle
        let angleHipR = findAngle(rightShoulder, rightHip, rightAnkle, opt);
        //RIGHT: Wrist-Ankle-Shoulder
        drawConnectors(
          canvasCtx,
          [landmarksArray[0][16], landmarksArray[0][28], landmarksArray[0][12]],
          POSE_CONNECTIONS,
          {
            color: "#FF0000",
            lineWidth: 5,
          }
        );
        console.log(`X: ${landmarksArray[0][16].x}`);
        console.log(`Y: ${landmarksArray[0][16].y}`);

        //RIGHT: Shoulder-Elbow-Wrist
        drawConnectors(
          canvasCtx,
          [landmarksArray[0][12], landmarksArray[0][14], landmarksArray[0][16]],
          POSE_CONNECTIONS,
          {
            color: "#8800ff",
            lineWidth: 5,
          }
        );
        //RIGHT: Shoulder-Hip-Ankle
        drawConnectors(
          canvasCtx,
          [landmarksArray[0][12], landmarksArray[0][24], landmarksArray[0][28]],
          POSE_CONNECTIONS,
          {
            color: "#00FFFF",
            lineWidth: 5,
          }
        );

        // Draw Angles
        canvasCtx.save();
        canvasCtx.scale(-1, 1); // invert canvas object to get text the right way
        canvasCtx.font = "bold 30px Arial";
        canvasCtx.shadowColor = "white";
        canvasCtx.shadowBlur = 20;
        canvasCtx.fillStyle = "#FF0000";
        //Ankle
        canvasCtx.fillText(
          `${angleAnkleR}`,
          -landmarksArray[0][28].x * canvasElement.width,
          landmarksArray[0][28].y * canvasElement.height
        );
        // Elbow
        canvasCtx.fillStyle = "#8800FF";
        canvasCtx.fillText(
          `${angleElbowR}`,
          -landmarksArray[0][14].x * canvasElement.width,
          landmarksArray[0][14].y * canvasElement.height
        );
        // Hip
        canvasCtx.fillStyle = "#00FFFF";
        canvasCtx.fillText(
          `${angleHipR}`,
          -landmarksArray[0][24].x * canvasElement.width,
          landmarksArray[0][24].y * canvasElement.height
        );
        canvasCtx.restore();
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
