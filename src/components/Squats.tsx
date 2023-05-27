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
const Squats = ({ results }: Props) => {
  //Helpful States
  //Counter States
  const [counter, setCounter] = useState(0);
  const [down, setDown] = useState(false);
  const [up, setUp] = useState(false);

  //States for Debugging
  const [landmarkArray, setLandmarkArray] = useState<Results | null>(null);
  const [direction, setDirection] = useState("Start");
  const [angleText, setAngleText] = useState("");
  const [angleText1, setAngleText1] = useState("");
  const [angleText2, setAngleText2] = useState("");
  const [distanceY, setDistanceY] = useState("");
  const [diffY, setDiffY] = useState("");
  const [dummy, setDummy] = useState("");
  const [dummyUp, setDummyUp] = useState("");
  // DistY State
  const [distY, setDistY] = useState(0);
  // Init State for DistY
  const [initY, setInitY] = useState(true);

  //useEffect because of changing variables
  useEffect(() => {
    const updateSquats = () => {
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
      //Calc Ankle-Knee-Hip Angle
      let angleKneeR = findAngle(rightAnkle, rightKnee, rightHip, opt);
      //Calc Shoulder-Ellbow-Wrist Angle
      let angleElbowR = findAngle(rightShoulder, rightElbow, rightWrist, opt);
      //Calc Ankle-Hip-Shoulder Angle
      let angleHipR = findAngle(rightAnkle, rightHip, rightShoulder, opt);
      // Calc Elbow-Shoulder-Hip Angle
      let angleShoulderR = findAngle(rightElbow, rightShoulder, rightHip, opt);
      // Calc Knee-Hip-Shoulder
      let angleHipDownR = findAngle(rightKnee, rightHip, rightShoulder, opt);
      //Left side
      //Calc Ankle-Knee-Hip Angle
      let angleKneeL = findAngle(leftAnkle, leftKnee, leftHip, opt);
      //Calc Shoulder-Ellbow-Wrist Angle
      let angleElbowL = findAngle(leftShoulder, leftElbow, leftWrist, opt);
      //Calc Ankle-Hip-Shoulder Angle
      let angleHipL = findAngle(leftAnkle, leftHip, leftShoulder, opt);
      // Calc Elbow-Shoulder-Hip Angle
      let angleShoulderL = findAngle(leftElbow, leftShoulder, leftHip, opt);
      // Calc Knee-Hip-Shoulder
      let angleHipDownL = findAngle(leftKnee, leftHip, leftShoulder, opt);

      let visAnkleR = landmarksArray[0][28].visibility;
      let visKneeR = landmarksArray[0][26].visibility;
      if (!visKneeR) return;
      if (!visAnkleR) return;

      let visAnkleL = landmarksArray[0][27].visibility;
      let visKneeL = landmarksArray[0][25].visibility;
      if (!visKneeL) return;
      if (!visAnkleL) return;

      setAngleText(`Ankle-Hip-Shoulder>170: ${angleHipR}`);
      setAngleText2(`Shoulder-Ellbow-Wrist>160: x`);
      setAngleText1(`Ank-Knee-Hip>170 <90: ${angleKneeR}`);
      setDiffY(`Elbow-Shoulder-Hip>90: ${angleShoulderR}`);
      setDistanceY(`Knee-Hip-Shoulder <80: ${angleHipDownR}`);
      //console.log(landmarksArray);
      //setLandmarkArray(results);
      //UP 3 angles & Ankle higher than Wrist (x-coord) & visibility from ankle & shoulder & 2 booleans
      if (
        (angleKneeR > 170 &&
          angleHipR > 170 &&
          angleShoulderR < 18 &&
          rightHip.y < rightKnee.y &&
          leftKnee.y < rightAnkle.y &&
          !up &&
          down &&
          visKneeR > 0.8 &&
          visAnkleR > 0.8) ||
        (angleKneeL > 170 &&
          angleHipL > 170 &&
          angleShoulderL < 18 &&
          leftHip.y < leftKnee.y &&
          rightKnee.y < leftAnkle.y &&
          !up &&
          down &&
          visKneeL > 0.8 &&
          visAnkleL > 0.8)
      ) {
        setUp(true);
        setDirection(`Last State: Up`);
        //setDummyUp(`Up Y: ${diffY} `);
      }
      //DOWN
      else if (
        (angleShoulderR > 90 &&
          50 < angleKneeR &&
          angleKneeR < 80 &&
          50 < angleHipDownR &&
          angleHipDownR < 80 &&
          rightHip.y > rightKnee.y &&
          leftKnee.y < rightAnkle.y &&
          !down &&
          !up &&
          visKneeR > 0.8 &&
          visAnkleR > 0.8) ||
        (angleShoulderL > 90 &&
          50 < angleKneeL &&
          angleKneeL < 80 &&
          50 < angleHipDownL &&
          angleHipDownL < 80 &&
          leftHip.y > leftKnee.y &&
          rightKnee.y < leftAnkle.y &&
          !down &&
          !up &&
          visKneeL > 0.8 &&
          visAnkleL > 0.8)
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
    };

    updateSquats();
  }, [results.poseLandmarks]);

  return (
    <div style={{}}>
      {/* <Logger results={landmarkArray}></Logger> */}
      {direction} <br /> Wiederholungen: {counter}
      <br /> {angleText} <br /> {angleText2} <br />
      {angleText1} <br />
      {distanceY} <br />
      {diffY}
    </div>
  );
};

export default Squats;
