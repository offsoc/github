import type React from 'react'
import {memo} from 'react'

export const ViewerLoginAndType = memo(function ViewerLoginAndType({
  type,
  children,
}: {
  type: string
  children: React.ReactNode
}) {
  return (
    <p>
      {type}: {children}
    </p>
  )
})
