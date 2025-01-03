import styled, { RuleSet } from "styled-components"

const Container = styled.div<{$css?: RuleSet}>`
 ${attr => attr?.$css}
 padding: 0.5em 0.35em;
 box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
 background: var(--bg-card-1);
`

export default function Card(props: React.ComponentPropsWithoutRef<'div'> & { css?: RuleSet }) {
  const { children, css, ...rest } = props
  return <Container $css={css} {...rest} style={rest?.style}>
    {children}
  </Container>
}