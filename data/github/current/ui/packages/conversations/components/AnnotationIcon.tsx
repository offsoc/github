import styled, {keyframes} from 'styled-components'

import {DiffAnnotationLevels} from '../types'

export type AnnotationIconProps = {
  annotationLevel: DiffAnnotationLevels
  className?: string
}

/**
 * Renders an svg corresponding to the given annotation level
 */
export function AnnotationIcon({annotationLevel, ...rest}: AnnotationIconProps) {
  const {icon, ...annotationData} = AnnotationPresentationMap[annotationLevel]
  return buildAnnotationIcon({...icon, ...annotationData, ...rest})
}

const fadeInAnimation = keyframes`
  0% {opacity: 0;}
  100% {opacity: 1;}
`
/**
 * Renders an annotation icon that fades in
 */
export const AnimatedAnnotationIcon = styled(AnnotationIcon)`
  animation: ${fadeInAnimation} 0.1s ease-in;
`

function buildAnnotationIcon({
  fill,
  stroke,
  ariaLabel,
  svgHtml,
  className,
}: {
  fill: string
  stroke: string
  ariaLabel: string
  svgHtml: JSX.Element
  className?: string
}): JSX.Element {
  return (
    <svg
      aria-label={ariaLabel}
      className={className}
      fill={fill}
      height="24"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      style={{boxShadow: 'none'}}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {svgHtml}
    </svg>
  )
}

export const AnnotationPresentationMap: {
  [key in DiffAnnotationLevels]: {
    priority: number
    ariaLabel: string
    primaryColor: string
    icon: {
      fill: string
      stroke: string
      svgHtml: JSX.Element
    }
  }
} = {
  [DiffAnnotationLevels.Failure]: {
    priority: 1,
    ariaLabel: 'Check failure',
    primaryColor: 'danger.fg',
    icon: {
      fill: 'var(--bgColor-danger-emphasis, var(--color-danger-emphasis))',
      stroke: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
      svgHtml: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" x2="9" y1="9" y2="15" />
          <line x1="9" x2="15" y1="9" y2="15" />
        </>
      ),
    },
  },
  [DiffAnnotationLevels.Warning]: {
    priority: 2,
    ariaLabel: 'Check warning',
    primaryColor: 'attention.fg',
    icon: {
      fill: 'var(--bgColor-attention-emphasis, var(--color-attention-emphasis))',
      stroke: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
      svgHtml: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12" y1="16" y2="16" />
        </>
      ),
    },
  },
  [DiffAnnotationLevels.Notice]: {
    priority: 3,
    ariaLabel: 'Check notice',
    primaryColor: 'fg.muted',
    icon: {
      fill: 'var(--bgColor-neutral-emphasis, var(--color-neutral-emphasis))',
      stroke: 'var(--fgColor-onEmphasis, var(--color-fg-on-emphasis))',
      svgHtml: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="16" y2="12" />
          <line x1="12" x2="12" y1="8" y2="8" />
        </>
      ),
    },
  },
}
