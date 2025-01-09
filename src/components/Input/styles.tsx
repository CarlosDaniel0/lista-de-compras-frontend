import { renderToStaticMarkup } from 'react-dom/server'
import { FaCheck } from 'react-icons/fa'
import styled from 'styled-components'

export const Container = styled.div`
  border-radius: 0.4em;
  border: solid 1px var(--input-border);
  background-color: var(--input-bg);
  color: var(--input-color);
  display: flex;

  & *:first-child() {
    border-top-left-radius: 0.28em;
    border-bottom-left-radius: 0.28em;
  }

  & *:last-child {
    border-top-right-radius: 0.28em;
    border-bottom-right-radius: 0.28em;
  }

  & input {
    flex: 1 1 0;
    padding: 0.4em 0.4em;
    color: inherit;
    background-color: transparent;
    width: 100%;
    font-size: 1.2em;
    border: none;
    outline: none;
  }

  & button {
    cursor: pointer;
  }

  & span,
  & button {
    outline: none;
    border: none;
    background: var(--input-item-bg);
    color: var(--input-item-color);
    display: flex;
    align-items: center;
    padding: 0 0.4em;
  }
`

export const CheckboxContainer = styled.input.attrs(attr => ({ ...attr, type: 'checkbox' }))`
  appearance: none;
  width: 1.2em;
  height: 1.2em; 
  border-radius: 0.3em;
  background-color: var(--background);
  border: solid 1px var(--input-border-color);

  &:checked {
    background-color: var(--blue500);
    background-image: url('data:image/svg+xml,${renderToStaticMarkup(<FaCheck fill="rgb(255, 255, 255)" />)}');
    background-size: 70%;
    background-repeat: no-repeat;
    background-position: center;
    border: solid 1px var(--blue500);
  }

  &:disabled {
    opacity: 0.75;
    filter: grayscale(0.7);
  }

  &:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 .25rem rgba(13, 110, 253, .25);
  }
`

const sizes = {
  1: {
    width: '2.25em',
    height: '1.27em',
    borderRadius: '0.6em',
    icon: {
      borderRadius: '50%',
      top: '0.08em',
      left: '1.25px',
      width: '1.1em',
      height: '1.1em',
      diffEnd: '0.08em',
    },
  },
  2: {
    width: '3.25em',
    height: '1.71em',
    borderRadius: '0.81em',
    icon: {
      borderRadius: '50%',
      top: '0.11em',
      left: '1.69px',
      width: '1.49em',
      height: '1.49em',
      diffEnd: '0.04em',
    },
  }
}

export const CheckboxSwitch = styled.input.attrs(attr => ({ ...attr, type: 'checkbox' }))<{ $size?: keyof typeof sizes }>`
  appearance: none;
  width: ${attr => sizes[attr?.$size ?? 1].width};
  height: ${attr => sizes[attr?.$size ?? 1].height}; 
  border-radius: ${attr => sizes[attr?.$size ?? 1].borderRadius};
  background-color: var(--input-switch-bg);

  &::after {
    content: '';
    background-color: var(--input-switch-ball-unchecked);
    border-radius: 50%;
    top: ${attr => sizes[attr?.$size ?? 1].icon.top};
    left: ${attr => sizes[attr?.$size ?? 1].icon.left};
    width: ${attr => sizes[attr?.$size ?? 1].icon.width};
    height: ${attr => sizes[attr?.$size ?? 1].icon.height};
    position: relative;
    display: block;
    transition: all ease-in 150ms;
  }

  &:checked {
    background-color: var(--blue500);

    &::after {
      background-color: var(--white);
      transform: translateX(calc(100% - ${attr => sizes[attr?.$size ?? 1].icon.diffEnd}));
    }
  }
  
  &:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 .25rem rgba(13, 110, 253, .25);
  }

  &:disabled {
    opacity: 0.75;
    filter: grayscale(0.7);
  }
`
