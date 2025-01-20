type Props = unknown

function Footer({children}: React.PropsWithChildren<Props>): JSX.Element {
  return <>{children}</>
}

Footer.displayName = 'PageLayout.Footer'

export default Footer
