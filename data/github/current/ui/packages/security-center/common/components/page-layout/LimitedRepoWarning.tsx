import {Link, Text} from '@primer/react'

type Props = {
  show: boolean
  href: string
}

function LimitedRepoWarning({show, href}: Props): JSX.Element {
  return (
    <>
      {show && (
        <Text as="p" sx={{color: 'fg.muted', mb: 3, mt: -3}} data-testid="incomplete-data-warning">
          Results are based on a{' '}
          <Link href={href} muted inline>
            limited selection
          </Link>{' '}
          of repositories.
        </Text>
      )}
    </>
  )
}

LimitedRepoWarning.displayName = 'PageLayout.LimitedRepoWarning'

export default LimitedRepoWarning
