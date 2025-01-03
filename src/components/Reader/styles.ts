import styled, { css } from "styled-components"

export const ContentReader = styled.div<{ $height?: string }>`
  height: ${attr => attr?.$height ?? '100%'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const ContainerReader = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;

  & canvas,
  & .tile {
    position: absolute;
  }

  & .tile {
    z-index: 1;
  }

  & video {
    z-index: 2;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const button = css`
  border: 1px solid #fff;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  background: transparent;
  position: fixed;
  z-index: 4;
`

export const ButtonBack = styled.button`
  ${button}
  top: 4px;
  left: 6px;
 
`

export const RefreshButton = styled.button`
  ${button}
  top: 4px;
  right: 6px;
`
