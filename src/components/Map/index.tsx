/* eslint-disable react-hooks/exhaustive-deps */
import { LatLngExpression, LatLngLiteral } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import { SetState } from '../../util/types'
import useEffectOnce from '../../hooks/useEffectOnce'
// import TabBar from '../TabBar'
const { VITE_USERNAME, VITE_STYLE_ID, VITE_ACCESS_TOKEN } = import.meta.env

interface MapProps {
  position?: boolean
  marker?: LatLngLiteral
  setMarker?: SetState<LatLngLiteral>
}

interface MarkerItem {
  name?: string
  position: LatLngLiteral
}

interface MarkersProps {
  markers: MarkerItem[]
  zoom?: boolean
}

const zoom = 14
// const supermarkets = [
//   {
//     name: 'Mix Mateus - CEASA',
//     address:
//       'Av. Henry Wall de Carvalho, 5300A - Parque São João, Teresina - PI, 64020-720',
//     position: [-5.1369, -42.79678],
//   },
//   {
//     name: 'R Carvalho Barão de Gurgueia',
//     address: 'Av. Barão de Gurguéia, 3450 - Tabuleta, Teresina - PI, 64019-352',
//     position: [-5.12037, -42.80358],
//   },
//   {
//     name: 'Mix Mateus - Timon Alvorada',
//     address:
//       'Av. Pres. Médici, S/N - Anexo I - Parque Alvorada, Timon - MA, 65630-020',
//     position: [-5.1258796, -42.8231305],
//   },
//   {
//     name: 'Assaí Atacadista',
//     address: 'R. Gonçalo Nunes, 1000 - São Raimundo, Teresina - PI, 64075-080',
//     position: [-5.1051, -42.76886],
//   },
// ]

const formatSearchParams = (value?: string | null) => {
  const validate = (value: string) => {
    return value.split('_').every((item, i) => {
      if (i >= 0 && i <= 1 && !Number.isNaN(Number(item))) return true
      if (
        i === 2 &&
        item[item.length - 1].toLowerCase() === 'z' &&
        !Number.isNaN(Number(item.replace(/\D/, '')))
      )
        return true
      return false
    })
  }
  if (!value) return [undefined, undefined]
  const position = value.split('_')
  if (validate(value))
    return [
      position.slice(0, 2).map(Number),
      Number(position[position.length - 1].replace(/\D/, '')),
    ] as [LatLngExpression, number]
  return [undefined, undefined]
}

function MapController(props: MapProps) {
  const { setMarker, position, marker } = props
  const mutex = useRef(0)
  const [searchParams, setSearchParams] = useSearchParams()

  const map = useMapEvents({
    click(evt) {
      const { lat, lng } = evt.latlng
      setMarker?.({ lat, lng })
    },
    dragend() {
      if (!position) return
      const { lat, lng } = map.getCenter()
      setSearchParams(
        { p: encodeURIComponent(`${lat}_${lng}_${map.getZoom()}z`) },
        {}
      )
    },
    zoom() {
      if (!position) return
      const { lat, lng } = map.getCenter()
      setSearchParams(
        { p: encodeURIComponent(`${lat}_${lng}_${map.getZoom()}z`) },
        {}
      )
    },
  })

  useEffect(() => {
    const [coords, zoom] = formatSearchParams(searchParams.get('p'))
    if (coords)
      map.setView(coords, zoom)
  }, [map, searchParams])

  useEffectOnce(() => {
    if (mutex.current || marker?.lat === -1) return
    mutex.current = 1
    map.setView([marker!.lat, marker!.lng], 15)
  }, [marker])
  return <></>
}

function Markers(props: MarkersProps) {
  const { markers, zoom } = props
  const map = useMap()
  return markers.map((item, i) => (
    <Marker
      key={`mark-${new Date().getTime()}-${i}-${Math.floor(
        Math.random() * 100
      ).toString(16)}`}
      eventHandlers={
        zoom
          ? {
              click: (e) => map.setView(e.latlng, 18),
            }
          : undefined
      }
      position={item.position as LatLngExpression}
    >
      {item.name && <Popup>{item.name}</Popup>}
    </Marker>
  ))
}

function Map(props: MapProps) {
  const { marker, setMarker } = props
  const [position, setPosition] = useState<LatLngExpression>([
    -5.560973, -42.6127416,
  ])
  useEffectOnce(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((success) => {
        const coords = [
          success.coords.latitude,
          success.coords.longitude,
        ] as LatLngExpression
        setPosition(coords)
      })
    }
  }, [])

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          zIndex: 1,
          position: 'relative',
        }}
      >
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/${VITE_USERNAME}/${VITE_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${VITE_ACCESS_TOKEN}`}
          />
          <Markers
            zoom={typeof setMarker === 'undefined'}
            markers={
              [marker]
                .filter((item) => item?.lat !== -1)
                .map((position) => ({ position } as MarkerItem)) ?? []
            }
          />
          <MapController {...props} />
        </MapContainer>
      </div>
    </>
  )
}

export default Map
