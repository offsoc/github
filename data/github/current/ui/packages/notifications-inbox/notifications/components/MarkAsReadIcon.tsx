import {memo} from 'react'

export default memo(function MarkAsReadIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      style={{
        display: 'inline-block',
        userSelect: 'none',
        verticalAlign: 'text-bottom',
        overflow: 'visible',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.11499 0.649428C7.66151 0.329056 8.33849 0.329057 8.88501 0.649428L15.135 4.31322C15.6708 4.62731 16 5.20186 16 5.82294V12.25C16 13.2165 15.2165 14 14.25 14H1.75C0.783501 14 0 13.2165 0 12.25V5.82294C0 5.20186 0.329188 4.62731 0.864991 4.31322L7.11499 0.649428ZM8.12643 1.94347C8.04836 1.89771 7.95164 1.89771 7.87357 1.94347L2.15461 5.29597L6.46712 7.76026C7.39311 7.13791 8.60687 7.13792 9.53286 7.76028L13.8454 5.29597L8.12643 1.94347ZM14.5 6.64954L10.813 8.75641L14.5 11.6534V6.64954ZM5.187 8.75638L1.5 6.64953V11.6533L5.187 8.75638ZM13.1497 12.5H2.85029L7.22769 9.0606C7.68096 8.70447 8.31898 8.70447 8.77225 9.0606L13.1497 12.5Z"
        fill="currentColor"
      />
    </svg>
  )
})
