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
let cnt = 0;
const Reps = ({ array }: Props) => {
  const [direction, setDirection] = useState("");
  const [counter, setCounter] = useState(0);
  const [angleText, setAngleText] = useState("");
  const [angleText1, setAngleText1] = useState("");

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

      let anngle = findAngle(landmarks1, landmarks5, landmarks2, opt);
      let anngle1 = findAngle(landmarks2, landmarks4, landmarks6, opt);

      const AngleSHW = `Handgelenk-Knöchel-Schulter: ${anngle}`;
      const AngleHAW = `Schulter-Elle-Handgelenk: ${anngle1}`;
      setAngleText(AngleSHW);
      setAngleText1(AngleHAW);

      if (anngle < 25 && anngle1 < 140 && !pushUp) {
        pushUp = true;
        setDirection("Down");

        setCounter(cnt);
      } else if (anngle > 30 && anngle1 > 170 && pushUp) {
        pushUp = false;
        setDirection("Up");
        cnt = cnt + 1;
      }
    };

    updateReps();
  }, [array.poseLandmarks]);

  return (
    <div>
      Hier: {direction} und {counter} und {angleText} und {angleText1}
    </div>
  );
};

export default Reps;
