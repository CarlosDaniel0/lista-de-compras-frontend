import styled from 'styled-components'
import Card from '../Card'

export const Backgdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`

export const Loader = styled.div`
  width: 48px;
  height: 48px;
  border: 5px solid #2b7bf3;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export default function Loading(props: { label?: string; status?: boolean }) {
  const { label, status = true } = props
  return (
    <>
      {status && (
        <Backgdrop>
          <Card
            style={{
              background: '#f9f9f9',
              borderRadius: '0.4em',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '0.6em 1.2em',
            }}
          >
            <Loader />
            <span style={{ fontSize: '1.05em' }}>
              {label ?? 'Carregando...'}
            </span>
          </Card>
        </Backgdrop>
      )}
    </>
  )
}
