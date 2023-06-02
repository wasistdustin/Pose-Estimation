import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import HumanPoseEstimation from "./components/HumanPoseEstimation";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <HumanPoseEstimation></HumanPoseEstimation>
    </div>
  );
}

export default App;
