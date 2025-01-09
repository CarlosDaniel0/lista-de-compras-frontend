import styled from 'styled-components'

export const Container = styled.button<{ $bg?: string }>`
  font-size: 1.2em;
  border-radius: 0.4em;
  padding: 0.4em 0.8em;
  background: ${attr => attr?.$bg ?? 'transparent'};
  border: solid 1px rgb(217, 217, 217);
  cursor: pointer;
`
