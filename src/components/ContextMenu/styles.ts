import styled from "styled-components"

export const CONTEXT_ITEM_WIDTH = 160
export const ContainerContextMenu = styled.div<{ $visible: boolean }>`
  visibility: ${(attr) => (attr?.$visible ? 'visible' : 'hidden')};
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1.35em;
  z-index: 3;
`

export const ContextItem = styled.li`
  & button {
    color: var(--color-context-item);
    cursor: pointer;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.05em;
    width: ${CONTEXT_ITEM_WIDTH}px;
    max-width: 100%;
    padding: 0.25em 0.8em;

    &:hover {
      color: var(--hover-context-item);
    }
  }
`

export const ContextList = styled.ul`
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  background: var(--bg-context-list);
  padding-block-start: 0;
  list-style: none;
  overflow: hidden;

  &:last-child {
    border-bottom-left-radius: 0.4em;
    border-bottom-right-radius: 0.4em;
  }
  &:first-child {
    border-top-right-radius: 0.4em;
    border-top-left-radius: 0.4em;
  }
`