import styled, { css } from 'styled-components'
import Modal from '../Modal'
import {
  ActionDialog,
  ButtonDialog,
  DialogProps,
  DialogServiceContent,
} from '../../contexts/Dialog'
import { cloneElement, ReactElement } from 'react'

interface IPanel extends DialogServiceContent<Record<string, unknown>> {
  props?: DialogProps
  onConfirm?: ButtonDialog | ActionDialog
}

const panel = css`
  width: 38rem;
  max-width: 95%;
  height: max-content;
  max-height: 95%;
  color:  var(--color-card-1);
  background: var(--bg-card-1);
  border-radius: 0.45em;
  /*
  @media screen and (max-width: 450px) {
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  } */
`

export const Button = styled.button<{ $bg?: string }>`
  align-self: center;
  padding: 0.4em 2.5em;
  border-radius: 0.4em;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.05em;
  background: ${(attr) => attr?.$bg ?? 'transparent'};
  cursor: pointer;
`

export default function Panel(props: IPanel) {
  const { show, setShow, props: p, form, setForm } = props
  const confirm =
    typeof p?.onConfirm !== 'function'
      ? p?.onConfirm
      : { onClick: p?.onConfirm }
  if (!show) return null
  return (
    <Modal {...{ show, setShow, customize: { panel } }}>
      <div
        style={{
          padding: '1.2em 0.4em',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {p?.message ? (
          <p style={{ margin: '15px 20px', whiteSpace: 'pre-line' }}>{p?.message}</p>
        ) : (
          cloneElement(p?.content as ReactElement ?? <></>, {
            form,
            setForm,
            show,
            setShow,
          })
        )}
        <Button
          {...confirm}
          $bg={confirm?.color ?? "#1578c9"}
          onClick={(evt) => {
            if (confirm?.onClick)
              return setTimeout(
                () => confirm?.onClick?.(setShow, form, evt),
                100
              )
            setShow?.(false)
          }}
        >
          {confirm?.label ?? 'Ok'}
        </Button>
      </div>
    </Modal>
  )
}
