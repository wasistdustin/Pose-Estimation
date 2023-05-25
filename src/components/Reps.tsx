import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { LandmarkList, Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results, NormalizedLandmarkList } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";
import Logger from "./Logger";

interface Props {
  results: Results;
}

let distY = 0;
const Reps = ({ results }: Props) => {
  //Helpful States
  //Counter States
  const [counter, setCounter] = useState(0);
  const [down, setDown] = useState(false);
  const [up, setUp] = useState(false);
  // DistY State
  const [distY, setDistY] = useState(0);
  // Init State for DistY
  const [initY, setInitY] = useState(true);

  //States for Debugging
  const [landmarkArray, setLandmarkArray] = useState<Results | null>(null);
  const [direction, setDirection] = useState("");
  const [angleText, setAngleText] = useState("");
  const [angleText1, setAngleText1] = useState("");
  const [angleText2, setAngleText2] = useState("");
  const [distanceY, setDistanceY] = useState("");
  const [diffY, setDiffY] = useState("");
  const [dummy, setDummy] = useState("");
  const [dummyUp, setDummyUp] = useState("");

  //useEffect because of changing variables
  useEffect(() => {
    const updateReps = () => {
      const landmarksArray = [results.poseLandmarks];

      // init important landmarks for angle or distance calculation - all right side
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

      let visAnkleR = landmarksArray[0][28].visibility;
      let visShoulderR = landmarksArray[0][12].visibility;
      if (!visShoulderR) return;
      if (!visAnkleR) return;

      let visAnkleL = landmarksArray[0][27].visibility;
      let visShoulderL = landmarksArray[0][11].visibility;
      if (!visShoulderL) return;
      if (!visAnkleL) return;

      const diffY =
        Math.abs(landmarksArray[0][28].y - landmarksArray[0][12].y) * 100;

      setAngleText(`Handgelenk-Knöchel-Schulter: ${angleAnkleR}`);
      setAngleText1(`Schulter-Elle-Handgelenk: ${angleElbowR}`);
      setAngleText2(`Shoulder-Hip-Ankle ${angleHipR}`);
      setDiffY(`Visibality ANkle ${rightAnkle.y}`);
      setDistanceY(`Visabiliy ${rightWrist.y}`);
      //console.log(landmarksArray);
      setLandmarkArray(results);
      //UP 3 angles & Ankle higher than Wrist (x-coord) & visibility from ankle & shoulder & 2 booleans
      if (
        (angleAnkleR > 30 &&
          angleElbowR > 170 &&
          angleHipR > 170 &&
          !up &&
          down &&
          visShoulderR > 0.8 &&
          visAnkleR > 0.8 &&
          rightAnkle.y < rightWrist.y) ||
        (angleAnkleL > 30 &&
          angleElbowL > 170 &&
          angleHipL > 170 &&
          !up &&
          down &&
          visShoulderL > 0.8 &&
          visAnkleL > 0.8 &&
          leftAnkle.y < leftWrist.y)
      ) {
        setUp(true);
        setDirection(`Last State: Up`);
        setDummyUp(`Up Y: ${diffY} `);
      }
      //DOWN
      else if (
        (angleAnkleR < 25 &&
          angleElbowR < 140 &&
          angleHipR > 150 &&
          !down &&
          !up &&
          visShoulderR > 0.8 &&
          visAnkleR > 0.8 &&
          rightAnkle.y < rightWrist.y) ||
        (angleAnkleL < 25 &&
          angleElbowL < 140 &&
          angleHipL > 150 &&
          !down &&
          !up &&
          visShoulderL > 0.8 &&
          visAnkleL > 0.8 &&
          leftAnkle.y < leftWrist.y)
      ) {
        setDown(true);
        setDirection(`Last State: Down`);
      }
      //COUNTER
      else if (up && down) {
        setDown(false);
        setUp(false);
        setCounter(counter + 1);
      }
      //Save Init State (Y Distance between Ankle & Shoulder)
      // else if (
      //   angleAnkleR > 30 &&
      //   angleElbowR > 170 &&
      //   angleHipR > 170 &&
      //   diffY > 0.9 * distY &&
      //   initY
      // ) {
      //   //setDirection("Start");
      //   setInitY(false);
      // }
      // // Calculate Init State
      // else if (initY) {
      //   //setDirection("Warten auf Positionierung");
      //   setDistY(
      //     Math.abs(landmarksArray[0][28].y - landmarksArray[0][12].y) * 100
      //   );
      // }
    };

    updateReps();
  }, [results.poseLandmarks]);

  return (
    <div style={{}}>
      {/* <Logger results={landmarkArray}></Logger> */}
      {direction} <br /> Wiederholungen: {counter} <br /> {angleText} <br />{" "}
      {angleText1} <br /> {angleText2}
      <br /> {distanceY}
      <br /> {diffY}
      <br /> {dummy} {dummyUp}
    </div>
  );
};

export default Reps;
