import { useRef, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [isEnabled, setEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roboflowUrl =
    "https://detect.roboflow.com/construction-site-safety/27?api_key=SxSeyiG6uOChdjTs3YEV&confidence=0.01";

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
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  useEffect(() => {
    stopStream();
    if (isEnabled) startStream();
    console.log(canvasRef.current?.toDataURL("image/png"));
  }, [isEnabled]);

  return (
    <>
      {isEnabled && <div>You are online</div>}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
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
        {/* <iframe
          ref={videoRef}
          allowFullScreen
          allow="display-capture"
          src="http://136.169.226.73/1710155536/embed.html?realtime=true&amp;token=bc01f25597cd40e394c398c7bbf0c7db&amp;mute=true?width=640&amp;height=480"
        >
          <video
            // ref={videoRef}
            data-html5-video=""
            muted
            poster="http://136.169.226.73/1710155536/preview.mp4?token=bc01f25597cd40e394c398c7bbf0c7db"
            preload="metadata"
            crossOrigin="anonymous"
            playsInline
            src="blob:http://136.169.226.73/410c52a3-a6b0-44c3-b2b1-b4450e1e888e"
          ></video>
        </iframe> */}
        {/* <iframe
          ref={videoRef}
          allowFullScreen
          allow="display-capture"
          width="640"
          height="480"
          src="https://ucams.ufanet.ru/api/internal/embed/1703069068KXZ73/?ttl=3600&amp;autoplay=true&amp;mute=true?width=640&amp;height=480"
        ></iframe> */}
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
