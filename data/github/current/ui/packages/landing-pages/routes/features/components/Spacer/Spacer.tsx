import type React from 'react'
import type {HTMLAttributes} from 'react'

// Spacer is a utility component that adds space between elements.
// Styles are defined in marketing/feature-shared

//    0px - 543px  (mobile)
//  544px - 767px  (tablet - portrait)
//  768px - 1011px (tablet - landscape)
// 1012px - 1279px (laptop)
// 1280px - ~      (desktop)

// Usage:
//   Default size: <Spacer />
//   Fixed size for all breakpoints: <Spacer size="80px" />
//   Adjust per breakpoints: <Spacer size="12px" size544="24px" size768="48px" size1012="96px" size1280="152px" />

interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size?: string
  size544?: string
  size768?: string
  size1012?: string
  size1280?: string
}

export const Spacer = ({size, size544, size768, size1012, size1280, className}: SpacerProps) => {
  return (
    <div
      className={`fp-Spacer${className ? ` ${className}` : ''}`}
      style={
        {
          '--Spacer-size': size,
          '--Spacer-size544': size544,
          '--Spacer-size768': size768,
          '--Spacer-size1012': size1012,
          '--Spacer-size1280': size1280,
        } as React.CSSProperties
      }
      aria-hidden
    />
  )
}
