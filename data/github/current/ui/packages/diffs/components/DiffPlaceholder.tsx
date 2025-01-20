import {Box} from '@primer/react'

export const DIFF_PLACEHOLDER_ID = 'diff-placeholder'

export function DiffPlaceholder() {
  return (
    <Box
      aria-hidden="true"
      as="svg"
      version="1.1"
      viewBox="0 0 340 84"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        bottom: '0 !important',
        clip: 'rect(1px, 1px, 1px, 1px)',
        clipPath: 'inset(50%)',
        height: '84px',
        position: 'absolute',
        width: '320px',
      }}
    >
      <defs>
        <clipPath id="diff-placeholder">
          <rect height="11.9298746" rx="2" width="67.0175439" x="0" y="0" />
          <rect height="11.9298746" rx="2" width="100.701754" x="18.9473684" y="47.7194983" />
          <rect height="11.9298746" rx="2" width="37.8947368" x="0" y="71.930126" />
          <rect height="11.9298746" rx="2" width="53.3333333" x="127.017544" y="48.0703769" />
          <rect height="11.9298746" rx="2" width="72.9824561" x="187.719298" y="48.0703769" />
          <rect height="11.9298746" rx="2" width="140.350877" x="76.8421053" y="0" />
          <rect height="11.9298746" rx="2" width="140.350877" x="17.8947368" y="23.8597491" />
          <rect height="11.9298746" rx="2" width="173.684211" x="166.315789" y="23.8597491" />
        </clipPath>

        <linearGradient id="animated-diff-gradient" spreadMethod="reflect" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eee" />
          <stop offset="0.2" stopColor="#eee" />
          <stop offset="0.5" stopColor="#ddd" />
          <stop offset="0.8" stopColor="#eee" />
          <stop offset="1" stopColor="#eee" />
          <animateTransform attributeName="y1" dur="1s" repeatCount="3" values="0%; 100%; 0" />
          <animateTransform attributeName="y2" dur="1s" repeatCount="3" values="100%; 200%; 0" />
        </linearGradient>
      </defs>
    </Box>
  )
}
