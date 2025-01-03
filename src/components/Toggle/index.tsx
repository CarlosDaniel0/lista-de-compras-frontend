/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react"
import styled from "styled-components"
import { SetState } from "../../util/types"
import { useMounted } from "../../hooks/useMounted"

interface ToggleProps extends React.ComponentPropsWithoutRef<'div'> {
  show: boolean,
  setShow: SetState<boolean>
}

const Container = styled.div<{ $show?: boolean }>`
  ${attr => !attr?.$show ? 'display: none;' : ''}
`

export default function Toggle(props: ToggleProps) {
  const { show, children, ...rest } = props
  const container = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()

  const toggle = (value: boolean) => {
    if (!container.current) return
    const target = container.current
    target.classList.add('collapsing')
    target.style.height =  value ? target.scrollHeight + 'px' : ''

    setTimeout(() => {
      if (!target) return
      target.classList.remove('collapsing')
      target.style.height = ''
    }, 350)
  }

  useEffect(() => {
    if (!isMounted) return
    toggle(show)
  }, [show])

  return <Container ref={container} $show={show} {...rest}>
    {children}
  </Container>  
}