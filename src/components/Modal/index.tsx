import { RuleSet } from "styled-components"
import { Backdrop, Panel } from "./styles"
import React, { useEffect, useState } from "react"
import { SetState } from "../../util/types"
import { useMounted } from "../../hooks/useMounted"

interface ModalProps extends React.ComponentPropsWithoutRef<'div'> {
  show?: boolean
  setShow?: SetState<boolean>
  customize?: {
    backdrop?: RuleSet<object>,
    panel?: RuleSet<object>
  }
}

function Modal(props: ModalProps) {
  const { customize, children, show, setShow } = props
  const [animation, setAnimation] = useState(false)
  const isMouted = useMounted();

  useEffect(() => {
    if (isMouted && !show) {
      setAnimation(true)
      setTimeout(() => setAnimation(false), 250)
    }
  }, [isMouted, show])


  const prevent = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault()
    evt.stopPropagation()
  }

  return (<>{(show || animation)
    ? <Backdrop $css={customize?.backdrop} $show={show} onClick={() => setShow?.(false)}>
      <Panel $css={customize?.panel} $show={show} onClick={prevent}>
        {children}
      </Panel>
    </Backdrop>
    : <></>}</>)
}

export default Modal