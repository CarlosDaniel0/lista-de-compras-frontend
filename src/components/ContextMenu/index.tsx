import { useEffect, useRef, useState } from "react"
import { Option, SetState } from "../../util/types"
import useEffectOnce from "../../hooks/useEffectOnce"
import { ContainerContextMenu, CONTEXT_ITEM_WIDTH, ContextItem, ContextList } from "./styles"
import { genId } from "../../util"

export interface Menu {
  show: boolean
  top: number
  left: number
}

export interface ContextMenuProps<T,> {
  setMenu: SetState<T>
  menu: T,
  options: Option[]
}

export default function ContextMenu <T extends Menu>({
  setMenu,
  menu,
  options
}: ContextMenuProps<T>) {
  const [flip, setFlip] = useState({
    visible: false,
    horizontal: false,
    vertical: false,
  })
  const container = useRef<HTMLDivElement>(null)
  const isDescendant = function (parent: HTMLElement, child: HTMLElement) {
    let node = child.parentNode
    while (node) {
      if (node === parent) return true
      node = node.parentNode
    }
    return false
  }

  const close = () => setMenu(prev => ({ ...prev, left: 0, top: 0, show: false}))

  const handleClick = (event: MouseEvent) => {
    if (!container.current) return
    const descendant = isDescendant(
      container.current,
      event.target as HTMLElement
    )
    if (!descendant)
      setMenu((prev) => ({ ...prev, show: false, left: 0, top: 0 }))
  }

  useEffect(() => {
    setFlip((prev) => ({ ...prev, visible: false, horizontal: false, vertical: false }))
    setTimeout(() => {
      if (!container.current) return
      const [width, height] = [window.innerWidth, window.innerHeight]
      const { bottom } = container.current.getBoundingClientRect()
      setFlip({
        visible: true,
        horizontal: menu.left + CONTEXT_ITEM_WIDTH > width,
        vertical: bottom > height,
      })
    }, 15)
  }, [menu, container])

  useEffectOnce(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <ContainerContextMenu
      $visible={flip.visible}
      ref={container}
      onContextMenu={(evt) => {
        evt.stopPropagation()
        evt.preventDefault()
      }}
      style={{
        left: flip.horizontal ? undefined : menu.left,
        top: flip.vertical ? undefined : menu.top,
        bottom: flip.vertical ? menu.top : undefined,
        right: flip.horizontal ? window.innerWidth - menu.left : undefined,
      }}
    >
      <ContextList>
        {options.map((option, i) => <ContextItem  key={genId(`${option.key}-${i}-`)}>
          <button onClick={(evt) => {
            if (option.onClick) return option.onClick(evt, close)
            close()
          }}>
            {option.label}
          </button>
        </ContextItem>)}
      </ContextList>
    </ContainerContextMenu>
  )
}