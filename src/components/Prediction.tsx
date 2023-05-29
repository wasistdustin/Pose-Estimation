import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { LandmarkList, Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results, NormalizedLandmarkList } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";
import Logger from "./Logger";
import Reps from "./Reps";
import Squats from "./Squats";

interface Props {
  results: Results;
  setDrawValue: (pushUp: boolean, squats: boolean) => void;
}

let distY = 0;
const Prediction = ({ results, setDrawValue }: Props) => {
  //Helpful States
  //Counter States
  const [counter, setCounter] = useState(0);
  const [squats, setSquats] = useState(false);
  const [pushUp, setPushUp] = useState(false);

  //States for Debugging
  const [landmarkArray, setLandmarkArray] = useState<Results | null>(null);
  const [prediction, setPrediction] = useState("Waiting for Prediction..");

  //useEffect because of changing variables
  useEffect(() => {
    const updatePrediction = () => {
      const landmarksArray = [results.poseLandmarks];

      // init important landmarks for angle (or distance calculation)
      const leftWrist = {
        x: landmarksArray[0][15].x, //left Wrist
        y: landmarksArray[0][15].y,
      };
      const leftShoulder = {
        x: landmarksArray[0][11].x, //left Shoulder
        y: landmarksArray[0][11].y,
      };
      const leftHip = {
        x: landmarksArray[0][23].x, //left Hip
        y: landmarksArray[0][23].y,
      };
      const leftElbow = {
        x: landmarksArray[0][13].x, //left Ellbow
        y: landmarksArray[0][13].y,
      };
      const leftAnkle = {
        x: landmarksArray[0][27].x, //left Ankle
        y: landmarksArray[0][27].y,
      };
      const leftKnee = {
        x: landmarksArray[0][25].x, //left knee
        y: landmarksArray[0][25].y,
      };
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
      // Middle one must be the origin
      const opt = { small: true, round: true };
      //right Side
      //Calc Wrist-Ankle-Shoulder Angle
      let angleAnkleR = findAngle(rightWrist, rightAnkle, rightShoulder, opt);
      //Calc Shoulder-Ellbow-Wrist Angle
      let angleElbowR = findAngle(rightShoulder, rightElbow, rightWrist, opt);
      //Calc Shoulder-Hip-Ankle Angle
      let angleHipR = findAngle(rightShoulder, rightHip, rightAnkle, opt);
      //Left side
      //Calc Wrist-Ankle-Shoulder Angle
      let angleAnkleL = findAngle(leftWrist, leftAnkle, leftShoulder, opt);
      //Calc Shoulder-Ellbow-Wrist Angle
      let angleElbowL = findAngle(leftShoulder, leftElbow, leftWrist, opt);
      //Calc Shoulder-Hip-Ankle Angle
      let angleHipL = findAngle(leftShoulder, leftHip, leftAnkle, opt);
      //Calc Ankle-Knee-Hip Angle
      let angleKneeR = findAngle(rightAnkle, rightKnee, rightHip, opt);
      // Calc Elbow-Shoulder-Hip Angle
      let angleShoulderR = findAngle(rightElbow, rightShoulder, rightHip, opt);
      // Calc Knee-Hip-Shoulder
      let angleHipDownR = findAngle(rightKnee, rightHip, rightShoulder, opt);
      //Left side
      //Calc Ankle-Knee-Hip Angle
      let angleKneeL = findAngle(leftAnkle, leftKnee, leftHip, opt);
      // Calc Elbow-Shoulder-Hip Angle
      let angleShoulderL = findAngle(leftElbow, leftShoulder, leftHip, opt);
      // Calc Knee-Hip-Shoulder
      let angleHipDownL = findAngle(leftKnee, leftHip, leftShoulder, opt);

      let visAnkleR = landmarksArray[0][28].visibility;
      let visShoulderR = landmarksArray[0][12].visibility;
      let visKneeR = landmarksArray[0][26].visibility;
      if (!visKneeR) return;
      if (!visShoulderR) return;
      if (!visAnkleR) return;

      let visAnkleL = landmarksArray[0][27].visibility;
      let visShoulderL = landmarksArray[0][11].visibility;
      let visKneeL = landmarksArray[0][25].visibility;
      if (!visKneeL) return;
      if (!visShoulderL) return;
      if (!visAnkleL) return;

      //push Up init State
      if (
        (angleAnkleR > 29 &&
          angleElbowR > 170 &&
          angleHipR > 170 &&
          visShoulderR > 0.8 &&
          visAnkleR > 0.8 &&
          rightAnkle.y < rightWrist.y) ||
        (angleAnkleL > 29 &&
          angleElbowL > 170 &&
          angleHipL > 170 &&
          visShoulderL > 0.8 &&
          visAnkleL > 0.8 &&
          leftAnkle.y < leftWrist.y)
      ) {
        setPushUp(true);
        setSquats(false);
        setDrawValue(pushUp, squats);
        setPrediction(`Prediction: Push ups`);
        //setDummyUp(`Up Y: ${diffY} `);
      }
      //Squats Init State
      else if (
        (angleKneeR > 170 &&
          angleHipDownR > 170 &&
          angleShoulderR >= 70 &&
          rightHip.y < rightKnee.y &&
          leftKnee.y < rightAnkle.y &&
          visKneeR > 0.8 &&
          visAnkleR > 0.8) ||
        (angleKneeL > 170 &&
          angleHipDownL > 170 &&
          angleShoulderL >= 70 &&
          leftHip.y < leftKnee.y &&
          rightKnee.y < leftAnkle.y &&
          visKneeL > 0.8 &&
          visAnkleL > 0.8)
      ) {
        setSquats(true);
        setPushUp(false);
        setDrawValue(pushUp, squats);
        setPrediction(`Prediction: Squats`);
      } // only go back if user goes outside of the picture..
      else if (prediction === "Waiting for Prediction..") {
        setDrawValue(false, false);
      }
    };

    updatePrediction();
  }, [results.poseLandmarks]);

  return (
    <div style={{}}>
      {/* <Logger results={landmarkArray}></Logger> */}
      {prediction}
      {results && pushUp && <Reps results={results} />}
      {results && squats && <Squats results={results} />}
    </div>
  );
};

export default Prediction;
