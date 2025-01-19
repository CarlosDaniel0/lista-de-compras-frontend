/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react'
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
import { genId, getFiles } from '../../../util'
import { RoundedButton } from '../../Button'
import { ParamsContext, StateParams } from '../../../contexts/Params'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { useElementDimensions } from '../../../hooks/useElementDimensions'

interface TextSelectorProps {
  context: StateParams<{ text: string }>
  navigate: NavigateFunction
  setResult: SetState<Tesseract.RecognizeResult | null>
  result: Tesseract.RecognizeResult
  read: () => void
}

interface ResizeProps {
  element: Element
  parent: Element
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

const TextBoxes = ({
  data,
  setText,
  width,
  height,
}: {
  width: number
  height: number
  data: Tesseract.Page
  setText: SetState<string>
}) => {
  const [show, setShow] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const { lines } = data
  const isOverflown = ({ clientHeight, scrollHeight }: Element) =>
    scrollHeight > clientHeight
  const resizeText = ({ element: el, parent }: ResizeProps) => {
    const element = el as HTMLDivElement
    let i = 10 // let's start with 12px
    let overflow = false
    const maxSize = 128 // very huge text size

    while (!overflow && i < maxSize) {
      element.style.fontSize = `${i}px`
      overflow = isOverflown(parent)
      if (!overflow) i++
    }

    // revert to last state where no overflow happened:
    element.style.fontSize = `${i - 1}px`
  }

  const handleSelect = () => {
    let value = ''
    if (window.getSelection) {
      value = window.getSelection()?.toString() ?? ''
    }
    setText(value)
  }

  useEffect(() => {
    if (!container.current) return setShow(true)
    Array.from(container.current.children).forEach((parent) =>
      Array.from(parent.children ?? []).forEach((element) =>
        resizeText({ element, parent })
      )
    )
    setShow(true)
    container.current.addEventListener('mouseup', handleSelect)
    document.addEventListener('selectionchange', handleSelect)
    return () => {
      if (container.current) {
        container.current.removeEventListener('mouseup', handleSelect)
        document.removeEventListener('selectionchange', handleSelect)
      }
    }
  }, [container, lines])

  return (
    <>
      <div
        ref={container}
        style={{ width, height, position: 'absolute', zIndex: 3 }}
      >
        {lines
          .filter((item) => item.confidence > 45)
          .map((item, i) => (
            <div
              key={genId(`text-${i}-`)}
              style={{
                visibility: show ? 'visible' : 'hidden',
                display: 'block',
                // overflow: 'hidden',
                background: '#3a78ff37',
                position: 'fixed',
                left: item.bbox.x0,
                top: item.bbox.y0,
                width: item.bbox.x1 - item.bbox.x0,
                height: item.bbox.y1 - item.bbox.y0,
              }}
            >
              <span style={{ color: 'transparent' }}>{item.text}</span>
              {/* {item.words.map((word, idx) => <span style={{ position: 'fixed', left: word.bbox.x0, top: word.bbox.y0, color: 'transparent' }} key={genId(`word-${i}-${idx}-`)}>{word.text}</span>)} */}
            </div>
          ))}
      </div>
    </>
  )
}

const TextSelector = (props: TextSelectorProps) => {
  const { result, setResult, read, navigate, context } = props
  const [text, setText] = useState('')
  const image = useRef<HTMLImageElement>(null)
  const { width, height } = useElementDimensions(image)
  const handleConfirm = () => {
    context?.setState?.({ ...(context?.state ?? {}), text })
    setTimeout(() => {
      navigate(-2)
    }, 50)
  }

  return (
    <ContentReader>
      <ButtonBack
        onClick={() => {
          setResult(null)
          window.history.back()
          setTimeout(read, 50)
        }}
      >
        <RxChevronLeft size={30} color="#fff" />
      </ButtonBack>
      {result.data && (
        <TextBoxes {...{ width, height, setText }} data={result.data} />
      )}
      {result.data.imageColor && (
        <img
          ref={image}
          style={{ width: '100%' }}
          src={result.data.imageColor}
          alt="Resultado do reconhecimento OCR - Tesseract.js"
        />
      )}
      {!!text && (
        <RoundedButton
          onClick={handleConfirm}
          $bg="#0c7e4e"
          style={{
            zIndex: 5,
            position: 'absolute',
            top: '7%',
            color: '#fff',
            fontSize: '1.6em',
            border: 'none',
          }}
        >
          Confirmar
        </RoundedButton>
      )}
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

  const getImage = async (canvas: HTMLCanvasElement, video: HTMLVideoElement) =>
    new Promise<string>((resolve) => {
      const ctx = canvas.getContext('2d')
      const vw = video.videoWidth,
        vh = video.videoHeight,
        cw = canvas.width,
        ch = canvas.height
      const sx = (vw / 2 - cw / 2) * 1.2,
        sy = 0,
        sw = (vh * cw) / ch,
        sh = ch
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
    startOCR(image)
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
    if (image) startOCR(image)
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
          {...{ result, setResult, read, navigate, context: context as any }}
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
          <ButtonRight onClick={handleImage}>
            <MdOutlineAddPhotoAlternate size={24} color="#fff" />
          </ButtonRight>
          <canvas ref={canvas} width={width} height={height} />
          <CaptureButton onClick={captureImage}>
            <FaCircle size={38} />
          </CaptureButton>
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
            requestCameraPermission,
            message:
              'Por favor, permita o acesso a camera para utilizar o leitor OCR \n(Reconhecimento Óptico de Caracteres)',
          }}
        />
      )}
    </ContainerReader>
  )
}
