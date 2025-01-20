import type {WebSearchReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {Box, Link, Text} from '@primer/react'

import {ReferencePreview} from './ReferencePreview'
import styles from './WebSearchReferencePreview.module.css'

export function WebSearchReferencePreview<T extends WebSearchReference>({
  reference,
  onDismiss,
}: {
  reference: T
  onDismiss?: () => void
}) {
  return (
    <ReferencePreview.Frame>
      <ReferencePreview.Header onDismiss={onDismiss}>
        <Box
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <BingIcon />
          <Text sx={{fontSize: 0, fontWeight: 400, color: 'fg.muted'}}>
            <Text sx={{fontSize: 1, fontWeight: 600, color: 'fg.default'}}>
              {reference.results.length} {reference.results.length === 1 ? ' result ' : ' results '}
            </Text>
            from Bing search.
          </Text>
        </Box>
      </ReferencePreview.Header>
      <ReferencePreview.Body detailsError={false} detailsLoading={false}>
        <Box sx={{display: 'flex', flexDirection: 'column', px: 3, gap: 3, pb: 3}}>
          {reference.results.map((result, index) => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                border: '1px solid var(--borderColor-default, var(--color-border-default))',
                borderRadius: '6px',
                padding: 3,
              }}
              key={index}
            >
              <Link sx={{fontWeight: 600, fontSize: 2}} href={result.url} rel="nofollow">
                {result.title}
              </Link>
              <div>{result.excerpt}</div>
              <Box sx={{fontSize: 0, color: 'fg.muted'}}>{result.url}</Box>
            </Box>
          ))}

          <Text sx={{fontSize: 0, fontWeight: 400}}>
            <Link href="https://privacy.microsoft.com/en-us/privacystatement" rel="nofollow" target="_blank">
              Microsoft Privacy Statement
            </Link>
          </Text>
        </Box>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}

export const BingIcon = () => <div className={styles['bing-icon']} />
