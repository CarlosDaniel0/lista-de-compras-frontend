import styled from "styled-components"

export const ContainerMenu = styled.div<{ $show?: boolean }>`
  position: fixed;
  bottom: 0;
  z-index: 3;
  max-width: 100%;
  visibility: ${(attr) => (attr?.$show ? 'visible' : 'hidden')};
  background-color: var(--bg-menu);
  color: var(--color-menu);
  background-clip: padding-box;
  outline: 0;
  transition: transform 0.3s ease-in-out;

  top: 0;
  left: 0;
  width: 350px;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  transform: ${(attr) =>
    attr?.$show ? 'translateX(0px)' : 'translateX(-100%)'};
`

export const Backdrop = styled.div`
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`

export const ButtonClose = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  position: absolute;
  top: 5px;
  right: 5px;
  color: var(--color-menu);
`

export const ListMenu = styled.ul`
  margin-top: 48px;
  padding-block-start: 0;
  list-style: none;
`

export const ItemMenu = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.8em 1.2em;

  & a {
    color: inherit;
    text-decoration: none;
  }

  & a,
  & span {
    font-size: 1.18em;
  }
`

export const BottomContainerMenu = styled.div`
  bottom: 5px;
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Profile = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & .profile-row {
    display: flex;
    gap: 9px;
    align-items: center;
    margin-left: 10px;
  }
`

export const IconProfile = styled.div`
  width: 60px;
  height: 60px;
  position: relative;

  & img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }
`