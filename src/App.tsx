import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import MPPose from "./components/MPPose";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <MPPose></MPPose>
    </div>
  );
}

export default App;
