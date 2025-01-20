import type React from 'react'

import {PreviewCardOutlet} from '@github-ui/preview-card'

export function App(props: React.PropsWithChildren) {
  return (
    <>
      <main>{props.children}</main>
      <PreviewCardOutlet />
    </>
  )
}
