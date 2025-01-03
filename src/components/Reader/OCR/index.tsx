import { useEffect, useRef, useState } from "react";
import Tesseract, { createScheduler, createWorker } from "tesseract.js"
import useWindowDimensions from "../../../hooks/useWindowDimensions";

export default function OCR() {
  const video = useRef<HTMLVideoElement>(null);
  const track = useRef<MediaStreamTrack | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const myStream = useRef<MediaStream>();
  const scannedCodes = useRef<object>();
  const scheduler = useRef<Tesseract.Scheduler | null>(null)
  const [active, setActive] = useState(false)
  const [log, setLog] = useState<string>('')
  const time = useRef(new Date().getTime())
  const { width, height } = useWindowDimensions()
  
  const tick = async () => {
    // zbar.scanImageData()
    if (video && video.current && video.current.readyState === video.current.HAVE_ENOUGH_DATA && scheduler.current) {
      // canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const image = video.current;
      // source 
      const sx = 0;
      const sy = 0;
      const dWidth = width;
      const dHeight = height;
      const context = canvas.getContext("2d")
      context?.drawImage(image, sx, sy, dWidth, dHeight);
      // if (time.current % 350 === 0) {
      //   console.log(time.current)
      //   const imgData = context?.getImageData(0, 0, canvas.width, canvas.height)

      //   console.log(imgData)
      //   for (let i = 0; i < (imgData?.data?.length ?? 1); i += 4) {
      //     const count = imgData!.data[i] + imgData!.data[i + 1] + imgData!.data[i + 2];
      //     let colour = 0;
      //     if (count > 510) colour = 255;
      //     else if (count > 255) colour = 127.5;

      //     imgData!.data[i] = colour;
      //     imgData!.data[i + 1] = colour;
      //     imgData!.data[i + 2] = colour;
      //     imgData!.data[i + 3] = 255;
      //   }
      //   context?.putImageData(imgData!, 0, 0)
      // } else {
      //   context!.globalCompositeOperation = 'difference';
      //   context!.fillStyle = 'white';
      //   context?.fillRect(0, 0, canvas.width, canvas.height)
      // }

      const dt = await scheduler.current.addJob('recognize', canvas);
      const { data: { words, confidence, text } } = dt
      if (confidence > 90) setLog(text)
      if (canvasRef.current && words && confidence > 40) {
        console.log(words, confidence)
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.reset()
        words.forEach(word => {
          ctx.strokeStyle = 'rgb(90, 54, 187)'
          ctx.strokeRect(word?.bbox?.x0, word?.bbox?.y0, word?.bbox?.x1 - word?.bbox?.x0, word?.bbox?.y1 - word?.bbox?.y0)
          ctx.lineWidth = 2
        })
      }
      // const regex = /[a-zA-Z0-9]/gi;
      // const scannedText = text && text.match(regex) && (text.match(regex) ?? ['']).filter(x => x).join("");
      // console.log({ text, scannedText });
      requestAnimationFrame(tick);
      time.current = new Date().getTime()
    }
  };

  useEffect(() => {
    if (video && video.current) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      })
        .then(stream => {
          if (!video.current) return
          track.current = stream.getVideoTracks()[0];
          Array.from(stream.getVideoTracks()).map((track, i) => {
            console.log(`index: ${i}`, track.getCapabilities().torch)
          });

          video.current.srcObject = stream;
          myStream.current = stream;
          scannedCodes.current = {};

          (async () => {
            scheduler.current = createScheduler();
            for (let i = 0; i < 4; i++) {
              const worker = await createWorker('por')
              await worker.setParameters({ tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáãâàÁÃÂÀéêÉÊíÍóõôÓÕÔúÚçÇ-+/\\=:*, ' })
              scheduler.current.addWorker(worker);
            }
            requestAnimationFrame(tick);
          })()
        })
        .catch(err => {
          console.error(err);
          // handle error here with popup
        })
    }

    return () => myStream && myStream.current && myStream.current.getTracks().forEach(x => x.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const torch = () => {
    setActive(prev => {
      const torch = !prev

      if (track.current) {
        const imageCapture = new ImageCapture(track.current)
        const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
          if (track.current) track.current.applyConstraints({
            advanced: [{
              torch: true
            }]
          });

        })
        console.log(photoCapabilities)
      }
      //   track.current.applyConstraints({
      //   advanced: [{ torch: true } as MediaTrackConstraintSet]
      // })
      return torch
    })
  }

  return (
    <div>
      <button onClick={torch} style={{ zIndex: 3, background: 'transparent', border: 'none', outline: 'none', position: 'fixed', top: 15, left: 7, color: active ? '#fff23d' : undefined }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-lightning-charge-fill" viewBox="0 0 16 16">
          <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
        </svg>
      </button>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', objectFit: 'cover' }} />
      <video
        ref={video}
        autoPlay
        muted
        playsInline
        width={width}
        height={height}
        onLoadedMetadata={evt => console.log(evt.currentTarget.getBoundingClientRect())}
      ></video>
      <div style={{ position: 'absolute', bottom: 0, left: 5, right: 0, overflow: 'hidden', height: 40, display: 'flex', alignItems: 'revert', flexDirection: 'column' }}>
        {log}
      </div>
    </div>
  )
}