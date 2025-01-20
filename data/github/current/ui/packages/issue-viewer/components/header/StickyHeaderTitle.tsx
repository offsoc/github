import {issueHovercardPath} from '@github-ui/paths'
import {type SafeHTMLString, SafeHTMLBox} from '@github-ui/safe-html'
import {Box, Link, Text} from '@primer/react'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {graphql} from 'relay-runtime'
import type {StickyHeaderTitle$key} from './__generated__/StickyHeaderTitle.graphql'
import {useFragment} from 'react-relay'
import {useCallback} from 'react'

type StickyHeaderTitleProps = {
  headerTitleData: StickyHeaderTitle$key
  scrollToTopOnClick?: boolean
}

export function StickyHeaderTitle({headerTitleData, scrollToTopOnClick}: StickyHeaderTitleProps) {
  const {titleHTML, number, url, repository} = useFragment(
    graphql`
      fragment StickyHeaderTitle on Issue {
        titleHTML
        number
        url
        repository {
          name
          owner {
            login
          }
        }
      }
    `,
    headerTitleData,
  )

  const scrollToTop = useCallback(() => {
    if (!scrollToTopOnClick) {
      return
    }
    setTimeout(() => {
      // Clicking the link to #top will scroll to the top of the page, but it will also append "#top" to the URL.
      // We want to prevent that from happening, so we replace the URL right after the scroll happens.
      window.history.replaceState(history.state, '', url)
    }, 10)
  }, [scrollToTopOnClick, url])

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', width: '100%'}}>
      <Link
        data-hovercard-url={
          scrollToTopOnClick
            ? undefined
            : issueHovercardPath({
                owner: repository.owner.login,
                repo: repository.name,
                issueNumber: number,
              })
        }
        sx={{
          color: 'fg.default',
          display: 'block',
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          wordBreak: 'break-word',
        }}
        href={scrollToTopOnClick ? '#top' : url}
        target={scrollToTopOnClick ? undefined : '_blank'}
        onClick={scrollToTop}
      >
        <SafeHTMLBox
          as="bdi"
          className="markdown-title"
          html={titleHTML as SafeHTMLString}
          data-testid={TEST_IDS.issueTitleSticky}
        />
      </Link>
      <Text
        sx={{
          color: 'fg.muted',
          ml: 1,
        }}
      >
        {LABELS.issueNumber(number)}
      </Text>
    </Box>
  )
}
