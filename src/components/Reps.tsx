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
let pushUp = true;
let initY = true;
let cnt = 0;
let distY = 0;
const Reps = ({ results }: Props) => {
  //Helpful States
  const [counter, setCounter] = useState(0);
  const [down, setDown] = useState(false);
  const [up, setUp] = useState(false);

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
      const landmarks1 = {
        x: landmarksArray[0][16].x, //Wrist
        y: landmarksArray[0][16].y,
      };
      const landmarks2 = {
        x: landmarksArray[0][12].x, //Schulter
        y: landmarksArray[0][12].y,
      };
      const landmarks3 = {
        x: landmarksArray[0][24].x, //Hip
        y: landmarksArray[0][24].y,
      };
      const landmarks4 = {
        x: landmarksArray[0][14].x, //Ellbow
        y: landmarksArray[0][14].y,
      };
      const landmarks5 = {
        x: landmarksArray[0][28].x, //Ankle
        y: landmarksArray[0][28].y,
      };
      // Middle one must be the origin
      const opt = { small: true, round: true };
      //Calc Wrist-Ankle-Shoulder Angle
      let anngle = findAngle(landmarks1, landmarks5, landmarks2, opt);
      //Calc Shoulder-Ellbow-Wrist Angle
      let anngle1 = findAngle(landmarks2, landmarks4, landmarks1, opt);
      //Calc Shoulder-Hip-Ankle Angle
      let anngle2 = findAngle(landmarks2, landmarks3, landmarks5, opt);

      const angleSHW = `Handgelenk-Knöchel-Schulter: ${anngle}`;
      const angleHAW = `Schulter-Elle-Handgelenk: ${anngle1}`;
      const angleSHA = `Shoulder-Hip-Ankle ${anngle2}`; //works great -> almost 180
      const diffY =
        Math.abs(landmarksArray[0][28].y - landmarksArray[0][12].y) * 100;

      setAngleText(angleSHW);
      setAngleText1(angleHAW);
      setAngleText2(angleSHA);
      setDiffY(`Diff S&A: ${diffY}`);
      setDistanceY(`Fixed Wert: ${distY}`);
      //console.log(landmarksArray);
      setLandmarkArray(results);
      //UP
      if (
        anngle > 30 &&
        anngle1 > 170 &&
        anngle2 > 170 &&
        diffY > 0.9 * distY &&
        !up &&
        down
      ) {
        setUp(true);
        setDirection(`Up ${down} ${up}`);
        setDummyUp(`Up Y: ${diffY} `);
      }
      //DOWN
      else if (
        anngle < 25 &&
        anngle1 < 140 &&
        diffY < 0.7 * distY &&
        !down &&
        !up
      ) {
        setDown(true);
        setDirection(`Down ${down} ${up}`);

        //cnt = cnt + 1;
      }
      //COUNTER
      else if (up === true && down === true) {
        setDown(false);
        setUp(false);
        setCounter(counter + 1);
      }
      //Save Init State (Y Distance between Ankle & Shoulder)
      else if (
        anngle > 30 &&
        anngle1 > 170 &&
        anngle2 > 170 &&
        diffY > 0.9 * distY &&
        initY
      ) {
        setDirection("Start");
        initY = false;
      }
      // Calculate Init State
      else if (initY) {
        setDirection("Warten auf Positionierung");
        distY =
          Math.abs(landmarksArray[0][28].y - landmarksArray[0][12].y) * 100;
      }
    };

    updateReps();
  }, [results.poseLandmarks]);

  return (
    <div style={{}}>
      {/* <Logger results={landmarkArray}></Logger> */}
      Hier: {direction} <br /> {counter} <br /> {angleText} <br /> {angleText1}{" "}
      <br /> {angleText2}
      <br /> {distanceY}
      <br /> {diffY}
      <br /> {dummy} {dummyUp}
    </div>
  );
};

export default Reps;
