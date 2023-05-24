import React, { useEffect } from "react";
import { saveAs } from "file-saver";
import { Results, NormalizedLandmarkList } from "@mediapipe/pose";

interface Props {
  results: Results | null;
}

const Logger = ({ results }: Props) => {
  useEffect(() => {
    if (results) {
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp}: ${JSON.stringify(
        results.poseLandmarks
      )}\n`;

      const blob = new Blob([logEntry], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "log.txt");
    }
  }, [results]);

  return <div>Logger</div>;
};

export default Logger;
