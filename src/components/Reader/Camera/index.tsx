/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from 'react'
// import Tile from '../../Tile'
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import styled from 'styled-components'
import useEffectOnce from '../../../hooks/useEffectOnce'
import Card from '../../Card'
import {
  ButtonBack,
  ButtonRight,
  ContainerReader,
  ContentReader,
} from '../styles'
import { NavigateFunction, useNavigate } from 'react-router-dom'
// import { ParamsContext } from '../../../contexts/Params'
import { Loader } from '../../Loading'
import { RxChevronLeft } from 'react-icons/rx'
import { CameraStates, SetState } from '../../../util/types'
import { addPermission, removePermission } from '../../../redux/slices/config'
import { useDispatch } from 'react-redux'
import { store } from '../../../redux/store'
import Tesseract from 'tesseract.js'
import { FaCircle } from 'react-icons/fa6'
import RequestPermission from '../../Permission'
import { getFiles, getImageFromBase64, getImageFromFile } from '../../../util'
import { RoundedButton } from '../../Button'
import { ParamsContext, StateParams } from '../../../contexts/Params'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { grayScale } from './tools'
import { RiRefreshLine } from 'react-icons/ri'
import { BiMinus, BiPlus } from 'react-icons/bi'

interface TextSelectorProps {
  width: number
  height: number
  context: StateParams
  navigate: NavigateFunction
  setResult: SetState<Tesseract.RecognizeResult | null>
  result: Tesseract.RecognizeResult
  read: () => void
}

const CaptureButton = styled.button`
  z-index: 4;
  outline: none;
  border: none;
  position: absolute;
  bottom: 8%;
  width: 65px;
  height: 65px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  transform: translateX(-50%);

  & svg {
    color: #fff;
  }
`

const Snack = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  border-radius: 0.35em;
  padding: 0.25em 0.65em;
  color: #fff;
`

const Controllers = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  bottom: 50px;
  right: 10px;
  border: 1px solid #fff;
  border-radius: 0.95em;

  & button {
    background: rgba(0, 0, 0, 0.65);
    border: none;
    outline: none;
    font-size: 1.4em;
    color: #fff;
    padding: 0.4em 0.3em;
    transition: cubic-bezier(0.075, 0.82, 0.165, 1);

    &:active {
      transform: scale(0.87);
    }
  }

  & button:first-child {
    border-radius: 0.8em 0.8em 0 0;
  }

  & button:last-child {
    border-radius: 0 0 0.8em 0.8em;
  }
`

const Loading = () => {
  return (
    <ContentReader>
      <Card
        style={{
          padding: '1.2em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Loader />
        <p style={{ marginTop: 12, fontSize: '1.2em' }}>
          Verificando Permissão
        </p>
      </Card>
    </ContentReader>
  )
}

const TextSelector = (props: TextSelectorProps) => {
  const { result, width, height, setResult, read, navigate, context } = props
  const [text, setText] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)
  const [delta, setDelta] = useState({ h: 0, v: 0 })
  const [touch, setTouch] = useState({ startX: 0, endX: 0, startY: 0, endY: 0 })
  const [image, setImage] = useState<HTMLImageElement>()
  const [show, setShow] = useState(false)
  const [scale, setScale] = useState(1.0)
  const handleConfirm = () => {
    const state = context?.state ?? {}
    const field = String(state?._field ?? 'text')
    context?.setState?.({ ...state, _value: { [field]: text } })
    setTimeout(() => {
      navigate(-2)
    }, 50)
  }

  const getImage = async (
    canvas: HTMLCanvasElement,
    result: Tesseract.RecognizeResult
  ) => {
    const context = canvas.getContext('2d')
    const { imageColor } = result.data
    const img = !image ? await getImageFromBase64(imageColor!) : image
    if (!image) setImage(img)
    context?.clearRect(0, 0, width, height)
    context?.save()
    context?.scale(scale, scale)
    context?.drawImage(img, delta.h, delta.v, img.width, img.height)

    result.data.blocks?.forEach((word) => {
      context!.fillStyle = '#3a78ff37'
      context?.fillRect(
        word.bbox.x0 + delta.h,
        word.bbox.y0 + delta.v,
        word.bbox.x1 - word.bbox.x0,
        word.bbox.y1 - word.bbox.y0
      )
    })
    context?.restore()
  }

  const handleWheel = (evt: React.WheelEvent<HTMLCanvasElement>) => {
    setDelta((prev) => ({
      ...prev,
      v: Math.max(
        Math.min(50 * scale, (prev.v -= evt.deltaY)),
        (-(image!.height - height) - 50) * scale
      ),
      // h: Math.max(
      //   Math.min(50, (prev.h -= evt.deltaX)),
      //   -(image!.width - width) - 50
      // ),
    }))
  }

  const handleClick = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const [x, y] = [evt.pageX, evt.pageY]
    result.data.blocks?.forEach((block) => {
      const { x0, x1, y0, y1 } = block.bbox
      const { text } = block
      if (
        x >= (delta.h + x0) * scale &&
        x <= (delta.h + x1) * scale &&
        y >= (delta.v + y0) * scale &&
        y <= (delta.v + y1) * scale
      ) {
        setText((prev) => (prev += ` ${text}`))
        setShow(true)
      }
    })
  }

  const handleTouch =
    (type: 'start' | 'move') => (evt: React.TouchEvent<HTMLCanvasElement>) => {
      switch (type) {
        case 'start':
          return setTouch({
            startX: evt.changedTouches[0].clientX,
            endX: 0,
            startY: evt.changedTouches[0].clientY,
            endY: 0,
          })
        case 'move':
        default:
          setDelta((prev) => ({
            v: Math.max(
              Math.min(
                50 * scale,
                (prev.v += evt.changedTouches[0].clientY - touch.startY)
              ),
            (-(image!.height - height) - 50) * scale
            ),
            h: Math.max(
              Math.min(
                0,
                (prev.h += evt.changedTouches[0].clientX - touch.startX)
              ),
              (-(image!.width - width) - 50) * scale
            ),
          }))
          setTouch((prev) => ({
            ...prev,
            end: evt.changedTouches[0].clientY,
          }))
      }
    }

  const zoom = (type: '+' | '-') => {
    switch (type) {
      case '+':
        setScale((prev) => Math.min((prev += 0.05), 2))
        break
      case '-':
        setScale((prev) => Math.max((prev -= 0.05), 0.5))
        break
    }
  }

  useEffect(() => {
    if (!canvas.current) return
    getImage(canvas.current, result)
  }, [width, height, delta, scale])

  return (
    <ContentReader>
      <ButtonBack
        style={{ background: 'rgba(0,0,0,0.65)' }}
        onClick={() => {
          setResult(null)
          window.history.back()
          setTimeout(read, 50)
        }}
      >
        <RxChevronLeft size={30} color="#fff" />
      </ButtonBack>
      <ButtonRight
        onClick={() => {
          setText('')
          setShow(false)
        }}
        style={{ background: 'rgba(0,0,0,0.65)' }}
      >
        <RiRefreshLine size={22} color="#fff" />
      </ButtonRight>
      <canvas
        ref={canvas}
        width={width}
        height={height}
        onWheel={handleWheel}
        onClick={handleClick}
        onTouchStart={handleTouch('start')}
        onTouchMove={handleTouch('move')}
      />
      {!!text && (
        <RoundedButton
          onClick={handleConfirm}
          $bg="#0c7e4e"
          style={{
            zIndex: 5,
            position: 'absolute',
            top: '0.5%',
            color: '#fff',
            fontSize: '1.6em',
            border: 'none',
          }}
        >
          Confirmar
        </RoundedButton>
      )}
      {show && <Snack>{text}</Snack>}
      <Controllers>
        <button onClick={() => zoom('+')}>
          <BiPlus />
        </button>
        <button onClick={() => zoom('-')}>
          <BiMinus />
        </button>
      </Controllers>
    </ContentReader>
  )
}

export default function Camera() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const { width, height } = useWindowDimensions()
  const [state, setState] = useState(CameraStates.IDLE)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { permissions } = store.getState()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Tesseract.RecognizeResult | null>(null)
  const context = useContext(ParamsContext)

  const stopCamera = () => stream.current?.getTracks()[0].stop()
  const handleBack = () => {
    const { pathname } = new URL(window.location.href)
    if (pathname.includes('camera')) {
      setResult(null)
      setTimeout(read, 50)
    } else {
      stopCamera()
    }
  }

  const generateWorker = async () => {
    const worker = await Tesseract.createWorker('por', 1, {
      logger: (m) => import.meta.env.DEV && console.log(m),
    })
    return worker
  }

  const batchproccessImage = (canvas: HTMLCanvasElement) => {
    const image = canvas
      .getContext('2d')
      ?.getImageData(0, 0, canvas.width, canvas.height)
    // blurARGB(image!.data, canvas, 0.5)
    // dilate(image!.data, canvas)
    // invertColors(image!.data)
    // thresholdFilter(image!.data, 0.4)
    grayScale(image!.data)
    // backAndWhite(image!.data)
    return image
  }

  const preprocessImage = async (image: HTMLImageElement) =>
    new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context?.drawImage(image, 0, 0, image.width, image.height)
      context?.putImageData(batchproccessImage(canvas)!, 0, 0)

      const newImage = context?.getImageData(0, 0, canvas.width, canvas.height)
      context?.putImageData(newImage!, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    })

  const getImage = async (canvas: HTMLCanvasElement, video: HTMLVideoElement) =>
    new Promise<string>((resolve) => {
      const ctx = canvas.getContext('2d')
      const vw = video.videoWidth,
        vh = video.videoHeight,
        cw = canvas.width,
        ch = canvas.height
      const sx = vw / 2 - cw / 2,
        sy = 0,
        sw = (vh * cw) / (ch - (vw / 2 - cw / 2)),
        sh = ch - (vw / 2 - cw / 2)
      const dx = 0,
        dy = 0,
        dw = cw,
        dh = ch
      ctx?.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh)
      resolve(canvas.toDataURL('image/png'))
    })

  const startOCR = async (image: File | string) => {
    setLoading(true)
    const worker = await generateWorker()
    const result = await worker.recognize(
      image,
      { rotateAuto: true },
      { imageColor: true, imageBinary: true } // imageColor: true, imageGrey: true,
    )

    stopCamera()
    setResult(result)
    setLoading(false)
    window.history.pushState({}, '', '/camera?p=1')
  }

  const captureImage = async () => {
    video.current?.pause()
    const image = await getImage(canvas.current!, video.current!)
    const img = await getImageFromBase64(image)
    const imgStr = await preprocessImage(img)
    startOCR(imgStr)
  }

  const getCamera = async () => {
    setState(CameraStates.REQUESTING)
    return navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .then((str) => {
        const track = str.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        const settings = track.getSettings()

        dispatch(addPermission('camera'))
        stream.current = str
        setState(CameraStates.ALLOWED)
        return {
          stream: str,
          track,
          capabilities,
          settings,
          hasTorch: 'torch' in settings,
        }
      })
      .catch((err) => {
        console.log(err.message)
        setState(CameraStates.NOT_ALLOWED)
        return null
      })
  }

  const requestCameraPermission = async (isCheck?: boolean) => {
    if (isCheck && !permissions.includes('camera')) {
      return null
    }
    return getCamera()
  }

  const handleChangePermissions = async () => {
    const permission = await navigator.permissions.query({
      name: 'camera',
    } as never as PermissionDescriptor)
    permission.addEventListener('change', () => {
      const allowed = permission.state === 'granted'
      if (!allowed) {
        dispatch(removePermission('camera'))
        setState(CameraStates.NOT_ALLOWED)
      }
    })
  }

  const handleImage = async () => {
    const file = await getFiles({ accept: 'image/png, image/gif, image/jpeg' })
    const image = file?.item(0)
    if (image) {
      const img = await getImageFromFile(image!)
      const imgStr = await preprocessImage(img)
      startOCR(imgStr)
    }
  }

  const read = () => {
    handleChangePermissions()
    requestCameraPermission(true).catch(() => console.log('teste'))
  }

  useEffect(() => {
    if (stream.current && video.current) {
      video.current.srcObject = stream.current
    }
  }, [state])
  useEffectOnce(() => {
    read()
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [])

  return (
    <ContainerReader>
      {result !== null && (
        <TextSelector
          {...{
            width,
            height,
            result,
            setResult,
            read,
            navigate,
            context: context as any,
          }}
        />
      )}
      {loading && (
        <ContentReader>
          <Loader />
        </ContentReader>
      )}
      {state === CameraStates.REQUESTING && <Loading />}
      {state === CameraStates.ALLOWED && !result && (
        <>
          <ButtonBack
            onClick={() => {
              stopCamera()
              navigate(-1)
            }}
          >
            <RxChevronLeft size={30} color="#fff" />
          </ButtonBack>
          <ButtonRight disabled={loading} onClick={handleImage}>
            <MdOutlineAddPhotoAlternate size={24} color="#fff" />
          </ButtonRight>
          <canvas ref={canvas} width={width} height={height} />
          {!loading && (
            <CaptureButton onClick={captureImage}>
              <FaCircle size={38} />
            </CaptureButton>
          )}
          <video
            ref={video}
            onDoubleClick={captureImage}
            id="video"
            muted
            autoPlay
            playsInline
          ></video>
        </>
      )}
      {[CameraStates.IDLE, CameraStates.NOT_ALLOWED].includes(state) && (
        <RequestPermission
          {...{
            requestPermission: requestCameraPermission,
            message:
              'Por favor, permita o acesso a camera para utilizar o leitor OCR \n(Reconhecimento Óptico de Caracteres)',
          }}
        />
      )}
    </ContainerReader>
  )
}
