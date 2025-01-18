/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react'
import Tile from '../../Tile'
import useWindowDimensions from '../../../hooks/useWindowDimensions'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import useEffectOnce from '../../../hooks/useEffectOnce'
import Card from '../../Card'
import {
  ButtonBack,
  ContainerReader,
  ContentReader,
  RefreshButton,
} from '../styles'
import beep from '../../../assets/beep.mp3'
import { useNavigate } from 'react-router-dom'
import { ParamsContext } from '../../../contexts/Params'
import { Loader } from '../../Loading'
import { RxChevronLeft, RxReload } from 'react-icons/rx'
import RequestPermission from '../../Permission'
import { CameraStates } from '../../../util/types'
import { useDispatch } from 'react-redux'
import { addPermission } from '../../../redux/slices/config'
import { store } from '../../../redux/store'

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


export default function Barcode() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const { width, height } = useWindowDimensions()
  const reader = useRef<BrowserMultiFormatReader | null>(null)
  const [state, setState] = useState(CameraStates.IDLE)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { permissions } = store.getState()
  const context = useContext(ParamsContext)

  const stopCamera = () => stream.current?.getTracks()[0].stop()

  const startDecoding = (stream: MediaStream) => {
    if (!reader.current) return

    reader.current.decodeFromStream(stream, video.current!, (result, err) => {
      if (result && canvas.current) {
        const ctx = canvas.current.getContext('2d')
        if (ctx) {
          const points = result.getResultPoints()
          const x1 = points[0].getX(),
            y1 = points[0].getY(),
            x2 = points[1].getX(),
            y2 = points[1].getY()

          ctx.clearRect(0, 0, width, height)
          ctx.strokeStyle = 'red'
          ctx.beginPath()
          ctx.moveTo(x1 - 50, y1)
          ctx.lineTo(x2 - 50, y2)
          ctx.stroke()

          if (!timeout.current) {
            timeout.current = setTimeout(() => {
              ctx.clearRect(0, 0, width, height)
              if (timeout.current) clearTimeout(timeout.current)
              timeout.current = null
            }, 1000)
          }
        }
        new Audio(beep).play()
        const barcode = result.getText()
        context?.setState?.({ ...(context?.state ?? {}), barcode })
        setTimeout(() => {
          stopCamera()
          navigate(-1)
        }, 50)
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err)
      }
    })
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
        reader.current = new BrowserMultiFormatReader()
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
    if (!reader.current || !stream.current) return
    reader.current.reset()
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
    if (stream.current && video.current && reader.current) {
      startDecoding(stream.current)
    }
  }, [state])
  useEffectOnce(read, [])

  return (
    <ContainerReader>
      {state === CameraStates.REQUESTING && <Loading />}
      {state === CameraStates.ALLOWED && (
        <>
          <ButtonBack onClick={() => {
            stopCamera()
            navigate(-1)
          }}>
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
        <RequestPermission {...{ requestCameraPermission }} />
      )}
    </ContainerReader>
  )
}
