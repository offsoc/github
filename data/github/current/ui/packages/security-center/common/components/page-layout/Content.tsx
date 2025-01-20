type Props = unknown

function Content({children}: React.PropsWithChildren<Props>): JSX.Element {
  return <>{children}</>
}

Content.displayName = 'PageLayout.Content'

export default Content
