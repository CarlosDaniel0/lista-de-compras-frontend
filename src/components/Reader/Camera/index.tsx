import { RxChevronLeft, RxReload } from 'react-icons/rx'
import { CameraStates } from '../../../util/types'
import { ButtonBack, ContainerReader, RefreshButton } from '../styles'
import Loading from '../../Loading'
import useEffectOnce from '../../../hooks/useEffectOnce'
import { useEffect, useRef, useState } from 'react'
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import { useNavigate } from 'react-router-dom'
// import { ParamsContext } from "../../../contexts/Params"
import RequestPermission from '../../Permission'
import Tile from '../../Tile'
import { addPermission } from '../../../redux/slices/config'
import { useDispatch } from 'react-redux'
import { store } from '../../../redux/store'

export default function Camera() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const stream = useRef<MediaStream | null>(null)
  // const timeout = useRef<NodeJS.Timeout | null>(null)
  const { width, height } = useWindowDimensions()
  const [state, setState] = useState(CameraStates.IDLE)
  const { permissions } = store.getState()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const context = useContext(ParamsContext)

  const stopCamera = () => stream.current?.getTracks()[0].stop()

  const startOCR = (stream: MediaStream) => {
    // if (!reader.current) return
    // reader.current.decodeFromStream(stream, video.current!, (result, err) => {
    //   if (result && canvas.current) {
    //     const ctx = canvas.current.getContext('2d')
    //     if (ctx) {
    //       const points = result.getResultPoints()
    //       const x1 = points[0].getX(),
    //         y1 = points[0].getY(),
    //         x2 = points[1].getX(),
    //         y2 = points[1].getY()
    //       ctx.clearRect(0, 0, width, height)
    //       ctx.strokeStyle = 'red'
    //       ctx.beginPath()
    //       ctx.moveTo(x1 - 50, y1)
    //       ctx.lineTo(x2 - 50, y2)
    //       ctx.stroke()
    //       if (!timeout.current) {
    //         timeout.current = setTimeout(() => {
    //           ctx.clearRect(0, 0, width, height)
    //           if (timeout.current) clearTimeout(timeout.current)
    //           timeout.current = null
    //         }, 1000)
    //       }
    //     }
    //     new Audio(beep).play()
    //     const barcode = result.getText()
    //     context?.setState?.({ barcode })
    //     setTimeout(() => {
    //       stopCamera()
    //       navigate(-1)
    //     }, 50)
    //   }
    //   if (err && !(err instanceof NotFoundException)) {
    //     console.error(err)
    //   }
    // })
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

        dispatch(addPermission({ permission: 'camera' }))
        // reader.current = new BrowserMultiFormatReader()
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

  const restart = () => {
    // if (!reader.current || !stream.current) return
    // reader.current.reset()
    setTimeout(read, 50)
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
        window.localStorage.removeItem('barcode')
        setState(CameraStates.NOT_ALLOWED)
      }
    })
  }

  const read = () => {
    handleChangePermissions()
    requestCameraPermission(true).catch(() => console.log('teste'))
  }

  useEffect(() => {
    if (stream.current && video.current) {
      startOCR(stream.current)
    }
  }, [state])
  useEffectOnce(read, [])

  return (
    <ContainerReader>
      {state === CameraStates.REQUESTING && <Loading />}
      {state === CameraStates.ALLOWED && (
        <>
          <ButtonBack
            onClick={() => {
              stopCamera()
              navigate(-1)
            }}
          >
            <RxChevronLeft size={30} color="#fff" />
          </ButtonBack>
          <RefreshButton onClick={restart}>
            <RxReload size={22} color="#fff" />
          </RefreshButton>
          <canvas ref={canvas} width={width} height={height} />
          <Tile
            className="tile"
            width={width}
            height={height}
            cropWidth={'90%'}
            cropHeight={{ value: '22%', minHeight: 95 }}
          />
          <video ref={video} id="video" muted autoPlay playsInline></video>
        </>
      )}
      {[CameraStates.IDLE, CameraStates.NOT_ALLOWED].includes(state) && (
        <RequestPermission
          {...{
            requestCameraPermission,
            message:
              'Por favor, permita o acesso a camera para utilizar o leitor OCR \n(Captura de Texto em Imagens)',
          }}
        />
      )}
    </ContainerReader>
  )
}
