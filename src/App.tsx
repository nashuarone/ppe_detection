import { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [isEnabled, setEnabled] = useState(false);
  const [hat, setHat] = useState("");
  const [vest, setVest] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      })
      .catch((err) => {
        setError(err.name);
      });
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // const getImage = () => takeScreenshot(ref.current);
  const makePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const videoWidth = videoRef.current?.scrollWidth;
      const videoHeight = videoRef.current?.scrollHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      canvasRef.current
        .getContext("2d")
        ?.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    }
  };

  const downloadPhoto = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "photo.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const sendToCheckPPE = () => {
    setVest("");
    setHat("");
    const image = canvasRef.current?.toDataURL("image/png");
    axios({
      method: "POST",
      url: "https://detect.roboflow.com/construction-site-safety/27",
      params: {
        api_key: "SxSeyiG6uOChdjTs3YEV",
      },
      data: image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then(function (response) {
        console.log(response.data);
        response.data.predictions.forEach((ppe) => {
          if (ppe.class === "Hardhat") {
            setHat("green");
          }
          if (ppe.class === "Safety Vest") {
            setVest("green");
          }
          if (ppe.class === "NO-Safety Vest") {
            setVest("red");
          }
          if (ppe.class === "NO-Hardhat") {
            setHat("red");
          }
        });
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  useEffect(() => {
    stopStream();
    if (isEnabled) startStream();
    if (!isEnabled) {
      setVest("");
      setHat("");
    }
  }, [isEnabled]);

  return (
    <>
      <div className="card">
        {isEnabled && <div className="online">online</div>}
        <div className="ppe-status">
          {hat && <div className={hat}>Hardhat</div>}
          {vest && <div className={vest}>Safety Vest</div>}
        </div>
      </div>
      <div className="container">
        <video
          width="640"
          height="480"
          playsInline
          muted
          autoPlay
          ref={videoRef}
        ></video>
      </div>
      <button onClick={() => setEnabled(!isEnabled)}>
        {isEnabled ? "Off" : "ON"}
      </button>
      <button onClick={makePhoto}>Capture</button>
      <button onClick={downloadPhoto}>Save</button>
      <button onClick={sendToCheckPPE}>Check PPE</button>
      <div className="screenshot">
        <canvas ref={canvasRef} width="640" height="480"></canvas>
      </div>
    </>
  );
}

export default App;
