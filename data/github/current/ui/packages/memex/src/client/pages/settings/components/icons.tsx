/**
 * Temporary icons for indicators, while we work on getting the official icons into
 * the @primer/octicons package. We can hard-code the dimensions for now, since
 * we only use this icon in one place.
 *
 */

const IconWrapper = ({children}: {children: React.ReactNode}) => {
  const width = 16
  const height = 16

  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      className="octicon"
      style={{
        display: 'inline-block',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  )
}

export const BarIcon = () => (
  <IconWrapper>
    <path d="M3 10H13" stroke="#D8DEE4" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 10H7.5" stroke="#57606A" strokeWidth="2" strokeLinecap="round" />
  </IconWrapper>
)

export const SegmentedBarIcon = () => (
  <IconWrapper>
    <path d="M3 8H13" stroke="#D8DEE4" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 8H13" stroke="#6E7781" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3.75" />
  </IconWrapper>
)

export const RingIcon = () => (
  <IconWrapper>
    <g clipPath="url(#clip0_3042_26109)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7453 8C13.7453 4.82696 11.173 2.2547 8.00002 2.2547C4.82701 2.2547 2.25479 4.82696 2.25479 8C2.25479 11.173 4.82701 13.7453 8.00002 13.7453C11.173 13.7453 13.7453 11.173 13.7453 8ZM8.00002 0.928857C11.9053 0.928858 15.0711 4.09472 15.0711 8C15.0711 11.9053 11.9053 15.0711 8.00002 15.0711C4.09478 15.0711 0.928963 11.9053 0.928962 8C0.928963 4.09472 4.09478 0.928858 8.00002 0.928857Z"
        fill="#D8DEE4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.7453 8C13.7453 4.82696 11.173 2.2547 8.00002 2.2547L7.99999 2.2547L7.99999 0.928857H8.00002C11.9053 0.928858 15.0711 4.09472 15.0711 8C15.0711 11.9053 11.9053 15.0711 8.00002 15.0711C6.10246 15.0711 4.37947 14.3237 3.10942 13.1071C3.31957 13.3084 3.54254 13.497 3.77729 13.6718C4.72815 14.3797 5.84174 14.8372 7.01565 15.0023C8.18957 15.1673 9.38613 15.0345 10.4953 14.6162C11.1867 14.3554 11.8303 13.9889 12.4041 13.5321C12.7509 13.256 13.0723 12.9469 13.3633 12.6082L12.3578 11.7442C13.2226 10.7386 13.7453 9.43036 13.7453 8ZM4.10902 3.77287C3.99219 3.88041 3.87983 3.99279 3.77223 4.10973C3.87981 3.99287 3.99218 3.88048 4.10902 3.77287ZM2.25599 8.11886C2.25438 8.04086 2.25435 7.96277 2.25592 7.88463C2.25516 7.923 2.25479 7.96146 2.25479 8C2.25479 8.03972 2.25519 8.07934 2.25599 8.11886ZM3.18542 2.82115C4.42299 1.67007 6.07372 0.957248 7.8906 0.929687C7.48097 0.936023 7.07402 0.977921 6.67417 1.05425C5.95369 1.19178 5.25629 1.4411 4.60795 1.79556C4.09103 2.07818 3.61354 2.42313 3.18542 2.82115ZM0.930122 7.87063C0.96257 6.06206 1.67402 4.41923 2.82035 3.18628C2.53455 3.49382 2.27569 3.82728 2.04745 4.18326C1.40758 5.18121 1.02889 6.32402 0.946173 7.5066C0.937684 7.62797 0.932341 7.74935 0.930122 7.87063Z"
        fill="#57606A"
      />
    </g>
    <defs>
      <clipPath id="clip0_3042_26109">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </IconWrapper>
)
