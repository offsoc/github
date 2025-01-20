import {Heading, PageLayout} from '@primer/react'
import type {PropsWithChildren} from 'react'

type LayoutProps = {
  title: string
}

export default function Layout({children, title}: PropsWithChildren<LayoutProps>) {
  return (
    <PageLayout rowGap="none">
      <PageLayout.Header divider="line" sx={{mb: 3}}>
        <div className="d-flex flex-items-center flex-justify-between">
          <Heading as="h1" className="f2 text-normal pb-2" id="commits-pagehead">
            {title}
          </Heading>
        </div>
      </PageLayout.Header>

      <PageLayout.Content as="div">
        <div>{children}</div>
      </PageLayout.Content>
    </PageLayout>
  )
}
