import React from "react";
import { Results } from "@mediapipe/pose";
import { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";

interface Props {
  results: Results;
  drawPushUpAnglesR?: boolean;
  drawSquatsAnglesR?: boolean;
  webcamRef: React.MutableRefObject<Webcam | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

const Canvas = ({
  results,
  webcamRef,
  canvasRef,
  drawPushUpAnglesR,
  drawSquatsAnglesR,
}: Props) => {
  // console.log(results);
  // console.log(webcamRef);
  // console.log(canvasRef);

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
    //console.log(results);

    if (results.poseLandmarks) {
      const landmarksArray = [results.poseLandmarks];
      if (!drawPushUpAnglesR && !drawSquatsAnglesR) {
        for (const landmarks of landmarksArray) {
          console.log(`Alle Marker`);
          drawConnectors(canvasCtx, landmarks, POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      } else if (drawPushUpAnglesR) {
        console.log(`PushUp Marker`);
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
            color: "#FFFF00",
            lineWidth: 5,
          }
        );
        // console.log(`X: ${landmarksArray[0][16].x}`);
        //console.log(`Y: ${landmarksArray[0][16].y}`);

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
        canvasCtx.fillStyle = "#FFFF00";
        // if ankleR meet req for UP or DOWN
        if (angleAnkleR > 29 || angleAnkleR < 26) {
          canvasCtx.fillStyle = "#00FF00";
          canvasCtx.fillText(
            `${angleAnkleR}`,
            -landmarksArray[0][28].x * canvasElement.width,
            landmarksArray[0][28].y * canvasElement.height
          );
        }
        //Ankle Thresholds - 3 states because init though was to display more text..
        else if (angleAnkleR >= 25 && angleAnkleR <= 26) {
          canvasCtx.fillStyle = "#FF0000";
          canvasCtx.fillText(
            `${angleAnkleR}`,
            -landmarksArray[0][28].x * canvasElement.width,
            landmarksArray[0][28].y * canvasElement.height
          );
        } else if (angleAnkleR <= 29 && angleAnkleR >= 28) {
          canvasCtx.fillStyle = "#FF0000";
          canvasCtx.fillText(
            `${angleAnkleR}`,
            -landmarksArray[0][28].x * canvasElement.width,
            landmarksArray[0][28].y * canvasElement.height
          );
        } else {
          canvasCtx.fillText(
            `${angleAnkleR}`,
            -landmarksArray[0][28].x * canvasElement.width,
            landmarksArray[0][28].y * canvasElement.height
          );
        }

        // Elbow
        canvasCtx.fillStyle = "#8800FF";
        canvasCtx.fillText(
          `${angleElbowR}`,
          -landmarksArray[0][14].x * canvasElement.width,
          landmarksArray[0][14].y * canvasElement.height
        );
        // Hip
        if (
          (angleAnkleR > 29 && angleElbowR > 170 && angleHipR > 170) ||
          (angleAnkleR < 25 && angleElbowR < 140 && angleHipR > 150)
        ) {
          canvasCtx.fillStyle = "#00FF00";
          canvasCtx.fillText(
            `${angleHipR}`,
            -landmarksArray[0][24].x * canvasElement.width,
            landmarksArray[0][24].y * canvasElement.height
          );
        } else {
          canvasCtx.fillStyle = "#00FFFF";
          canvasCtx.fillText(
            `${angleHipR}`,
            -landmarksArray[0][24].x * canvasElement.width,
            landmarksArray[0][24].y * canvasElement.height
          );
        }

        canvasCtx.restore();
      } else if (drawSquatsAnglesR) {
        console.log(`SquatMarker Marker`);
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
        const rightKnee = {
          x: landmarksArray[0][26].x, //right knee
          y: landmarksArray[0][26].y,
        };
        //right Side
        //Calc Ankle-Knee-Hip Angle
        let angleKneeR = findAngle(rightAnkle, rightKnee, rightHip, opt);
        // Calc Elbow-Shoulder-Hip Angle
        let angleShoulderR = findAngle(
          rightElbow,
          rightShoulder,
          rightHip,
          opt
        );
        // Calc Knee-Hip-Shoulder
        let angleHipDownR = findAngle(rightKnee, rightHip, rightShoulder, opt);

        drawConnectors(
          canvasCtx,
          [rightKnee, rightHip, rightShoulder],
          POSE_CONNECTIONS,
          {
            color: "#00FFFF",
            lineWidth: 15,
          }
        );
        //Ankle-Knee-Hip
        drawConnectors(
          canvasCtx,
          [rightAnkle, rightKnee, rightHip],
          POSE_CONNECTIONS,
          {
            color: "#FFFF00",
            lineWidth: 5,
          }
        );

        //RIGHT: Shoulder-Elbow-Wrist
        drawConnectors(
          canvasCtx,
          [rightElbow, rightShoulder, rightHip],
          POSE_CONNECTIONS,
          {
            color: "#FF00FF",
            lineWidth: 5,
          }
        );
        //RIGHT: Shoulder-Hip-Ankle

        // Draw Angles
        canvasCtx.save();
        canvasCtx.scale(-1, 1); // invert canvas object to get text the right way
        canvasCtx.font = "bold 30px Arial";
        canvasCtx.shadowColor = "white";
        canvasCtx.shadowBlur = 20;
        canvasCtx.fillStyle = "#FFFF00";

        // Hip
        canvasCtx.fillStyle = "#00FFFF";
        canvasCtx.fillText(
          `${angleHipDownR}`,
          -rightHip.x * canvasElement.width,
          rightHip.y * canvasElement.height
        ); // Knee
        canvasCtx.fillStyle = "#FFFF00";
        canvasCtx.fillText(
          `${angleKneeR}`,
          -rightKnee.x * canvasElement.width,
          rightKnee.y * canvasElement.height
        );
        // Shoulder
        canvasCtx.fillStyle = "#FF00FF";
        canvasCtx.fillText(
          `${angleShoulderR}`,
          -rightShoulder.x * canvasElement.width,
          rightShoulder.y * canvasElement.height
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
