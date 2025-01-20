import type React from 'react'

import {PreviewCardOutlet} from '@github-ui/preview-card'
import {SplitPageLayout} from '@primer/react'

export function App(props: React.PropsWithChildren) {
  return (
    <>
      <SplitPageLayout>{props.children}</SplitPageLayout>
      <PreviewCardOutlet />
    </>
  )
}
