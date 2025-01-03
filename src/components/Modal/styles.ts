import styled, { RuleSet } from 'styled-components'

export const Backdrop = styled.div<{ $css?: RuleSet<object>; $show?: boolean }>`
  opacity: ${(attr) => (attr?.$show ? 1 : 0.6)};
  transition: opacity 1s linear;
  z-index: 999;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  position: fixed;
  background: rgba(0, 0, 0, 0.23);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  ${(attr) => attr?.$css ?? ''}

  @keyframes hidde-backdrop {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`

export const Panel = styled.div<{ $css?: RuleSet<object>; $show?: boolean }>`
  opacity: ${(attr) => (attr?.$show ? 1 : 0)};
  transform: ${(attr) => `translateY(${attr?.$show ? '0%' : '-100%'})`};
  animation: ${(attr) =>
    `show-panel 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${
      !attr?.$show ? 'reverse' : ''
    }`};

  ${(attr) => attr?.$css}
  /* 
  border-radius: 0.45em;
  width: 38rem;
  max-width: 95%;
  height: 30rem;
  max-height: 95%;
  background: #fff; */

  @keyframes show-panel {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  ${(attr) => attr?.$css ?? ''}
`
