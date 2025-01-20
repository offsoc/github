import {Box, Flash} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {RefObject, ReactNode} from 'react'

/**
 * Props for a generic error flash component in the ruleset form
 * @param {ReactNode} props.children
 * @param {RefObject<HTMLDivElement>} [props.errorRef] Use this ref to focus on the error
 * @param {string} props.errorId
 *   errorId is a unique identifier used to reference the rule input/target,
 *   it should be the same value as the aria-describedby attribute in the input/target element
 * @param {BetterSystemStyleObject} [props.sx] Styles for flash container
 * @returns {JSX.Element}
 */
export function RulesetFormErrorFlash({
  errorId,
  children,
  errorRef,
  sx,
}: {
  children: ReactNode
  errorRef?: RefObject<HTMLDivElement>
  errorId: string
  sx?: BetterSystemStyleObject
}): JSX.Element {
  return (
    <Box sx={{display: 'flex', gap: 2, flexDirection: 'column', my: 2, ...sx}}>
      <Flash ref={errorRef} variant="danger" sx={{display: 'flex', alignItems: 'center'}} id={errorId} tabIndex={0}>
        {children}
      </Flash>
    </Box>
  )
}
