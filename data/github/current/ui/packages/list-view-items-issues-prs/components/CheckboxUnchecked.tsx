import {themeGet} from '@primer/react'
import {memo} from 'react'
import styled from 'styled-components'

const ColoredSvg = styled.svg`
  color: ${themeGet('colors.fg.muted')};
`

export default memo(function CheckboxUnchecked() {
  return (
    <ColoredSvg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 2.5C2.61193 2.5 2.5 2.61193 2.5 2.75V13.25C2.5 13.3881 2.61193 13.5 2.75 13.5H13.25C13.3881 13.5 13.5 13.3881 13.5 13.25V2.75C13.5 2.61193 13.3881 2.5 13.25 2.5H2.75ZM1 2.75C1 1.7835 1.7835 1 2.75 1H13.25C14.2165 1 15 1.7835 15 2.75V13.25C15 14.2165 14.2165 15 13.25 15H2.75C1.7835 15 1 14.2165 1 13.25V2.75Z"
        fill="currentColor"
      />
    </ColoredSvg>
  )
})
