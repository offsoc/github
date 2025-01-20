import {Box} from '@primer/react'

interface Props {
  'aria-label'?: string
  size: number
}

export function RadarCircle({'aria-label': ariaLabel, size}: Props) {
  return (
    <Box sx={{height: `${size}px`, width: `${size}px`}}>
      <svg
        aria-label={ariaLabel ?? 'Currently running'}
        className="anim-rotate"
        fill="none"
        height="100%"
        viewBox="0 0 16 16"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="none"
          stroke="#DBAB0A"
          strokeWidth="2"
          d="M3.05 3.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9Z"
          opacity=".5"
        />
        <path fill="#DBAB0A" fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clipRule="evenodd" />
        <path fill="#DBAB0A" d="M14 8a6 6 0 0 0-6-6V0a8 8 0 0 1 8 8h-2Z" />
      </svg>
    </Box>
  )
}
