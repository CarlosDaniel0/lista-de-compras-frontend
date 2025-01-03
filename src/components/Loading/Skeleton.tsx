import { css } from 'styled-components'

export const skeleton = css`
  background: var(--bg-skeleton);
  background: var(--gradient-skeleton);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
`