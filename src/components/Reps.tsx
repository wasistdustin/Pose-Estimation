import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Results } from "@mediapipe/pose";
import findAngle from "angle-between-landmarks";

interface Props {
  array: Results;
}
let pushUp = true;
let initY = true;
let cnt = 0;
let DistY = 0;
const Reps = ({ array }: Props) => {
  const [direction, setDirection] = useState("");
  const [counter, setCounter] = useState(0);
  const [angleText, setAngleText] = useState("");
  const [angleText1, setAngleText1] = useState("");
  const [angleText2, setAngleText2] = useState("");
  const [distY, setDistY] = useState("");
  const [diffY, setDiffY] = useState("");
  const [dummy, setDummy] = useState("");
  const [dummyUp, setDummyUp] = useState("");

  useEffect(() => {
    const updateReps = () => {
      const landmarksArray = [array.poseLandmarks];
      const landmarks1 = {
        x: landmarksArray[0][16].x, //Handgelenk
        y: landmarksArray[0][16].y,
      };
      const landmarks2 = {
        x: landmarksArray[0][12].x, //Schulter
        y: landmarksArray[0][12].y,
      }; // Middle one must be the origin
      const landmarks3 = {
        x: landmarksArray[0][24].x, //Ellbogen
        y: landmarksArray[0][24].y,
      };
      const landmarks4 = {
        x: landmarksArray[0][14].x, //Ellbogen
        y: landmarksArray[0][14].y,
      };
      const landmarks5 = {
        x: landmarksArray[0][28].x, //Ankle
        y: landmarksArray[0][28].y,
      }; // Middle one must be the origin
      const landmarks6 = {
        x: landmarksArray[0][16].x, //Wrist
        y: landmarksArray[0][16].y,
      };
      const opt = { small: true, round: true };
      //Wrist-Ankle-Shoulder
      let anngle = findAngle(landmarks1, landmarks5, landmarks2, opt);
      //Shoulder-Ellbow-Wrist
      let anngle1 = findAngle(landmarks2, landmarks4, landmarks6, opt);
      //Shoulder-Hip-Ankle
      let anngle2 = findAngle(landmarks2, landmarks3, landmarks5, opt);

      const AngleSHW = `Handgelenk-Knöchel-Schulter: ${anngle}`;
      const AngleHAW = `Schulter-Elle-Handgelenk: ${anngle1}`;
      const AngleSHA = `Shoulder-Hip-Ankle ${anngle2}`; //klappt sher gut -> nahe 180
      const DiffY = Math.abs(landmarksArray[0][28].y - landmarksArray[0][12].y);

      setAngleText(AngleSHW);
      setAngleText1(AngleHAW);
      setAngleText2(AngleSHA);
      setDiffY(`Diff S&A: ${DiffY}`);

      //Down noch Y Diff hinzufügen..
      if (anngle < 25 && anngle1 < 140 && !pushUp) {
        pushUp = true;
        setDirection("Down");
        setDummy(`Down Y: ${DiffY} `);
        cnt = cnt + 1;
      } else if (
        anngle > 30 &&
        anngle1 > 170 &&
        anngle2 > 170 &&
        DiffY > 0.9 * DistY &&
        pushUp
      ) {
        pushUp = false;
        initY = false;
        setDirection("Up");
        setCounter(cnt);
        setDummyUp(`Up Y: ${DiffY} `);
      } else if (initY) {
        const DistY = Math.abs(
          landmarksArray[0][28].y - landmarksArray[0][12].y
        );
        setDistY(`Fixed Wert: ${DistY}`);
      }
    };

    updateReps();
  }, [array.poseLandmarks]);

  return (
    <div>
      Hier: {direction} <br /> {counter} <br /> {angleText} <br /> {angleText1}{" "}
      <br /> {angleText2}
      <br /> {distY}
      <br /> {diffY}
      <br /> {dummy} {dummyUp}
    </div>
  );
};

export default Reps;
