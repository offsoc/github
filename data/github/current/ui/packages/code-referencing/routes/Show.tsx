import React from 'react'
import {useSearchParams} from '@github-ui/use-navigate'

import {FileFrame} from '@github-ui/code'
import {Snippet} from '@github-ui/code/snippet'
import {number} from '@github-ui/formatters'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {AlertIcon, LawIcon} from '@primer/octicons-react'
import {Box, Flash, Link, Pagination, SplitPageLayout, Text} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {LicenseFilterPane} from '../components/LicenseFilterPane'
import type {CodeReferenceShowPayload, FileReference} from '../types'

export function Show() {
  const payload = useRoutePayload<CodeReferenceShowPayload>()

  return (
    <>
      <SplitPageLayout.Pane position="start" divider="line" padding="normal">
        <Text as="h2" sx={{font: 'var(--text-title-shorthand-small)', px: 3, pb: 3}}>
          Filter by
        </Text>
        <LicenseFilterPane items={payload.licenses} />
      </SplitPageLayout.Pane>
      <SplitPageLayout.Content width="full" padding="normal">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--stack-padding-normal)',
          }}
        >
          {payload.total_results === 0 ? (
            <ZeroStateBanner />
          ) : (
            <>
              <SubHeader totalMatches={payload.total_matches} totalResults={payload.total_results} />
              <Text as="p" sx={{mt: 1}}>
                Some of the original code references might not be available due to changes in the code or repository
                privacy. Licenses refer to the general repository license. Check the individual files for possible
                licensing.
              </Text>
              <Snippets snippets={payload.files} />
              <PaginationStrip pageCount={payload.total_pages} />
            </>
          )}
        </Box>
      </SplitPageLayout.Content>
    </>
  )
}

function SubHeader(props: {totalMatches: number; totalResults: number}) {
  return (
    <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2}}>
      <Text as="h2" sx={{font: 'var(--text-subtitle-shorthand)'}}>
        Showing <b>{number(props.totalResults)}</b> of <b>{number(props.totalMatches)}</b> references in public code
        sources
      </Text>
    </Box>
  )
}

function License(props: {license: string}) {
  return (
    <Box sx={{color: 'fg.muted', display: 'inline-flex', gap: 2, alignItems: 'center'}}>
      <LawIcon size={16} />
      <Text sx={{lineHeight: 1}}>{props.license}</Text>
    </Box>
  )
}

function SnippetError(props: {fileUrl: string}) {
  return (
    <Flash variant="warning" full sx={{borderBottom: 'none', py: 2}}>
      There was an error retrieving the code snippet.{' '}
      <Link href={props.fileUrl} inline target="_blank">
        View full file
      </Link>
      .
    </Flash>
  )
}

function Snippets(props: {snippets: FileReference[]}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 'var(--stack-padding-normal)'}} data-hpc>
      {props.snippets.map(file => (
        <FileFrame key={file.url} entity={file} decorations={file.license ? <License license={file.license} /> : null}>
          {file.colorized_lines != null ? (
            <Snippet lines={file.colorized_lines} />
          ) : (
            <SnippetError fileUrl={file.url} />
          )}
        </FileFrame>
      ))}
    </Box>
  )
}

function PaginationStrip(props: {pageCount: number}) {
  const [params] = useSearchParams()

  let currentPage = parseInt(params.get('page') ?? '1', 10)
  if (isNaN(currentPage)) currentPage = 1

  const hrefBuilder = React.useCallback(
    (num: number) => {
      const newParams = new URLSearchParams(params)
      newParams.set('page', String(num))
      return `?${String(newParams)}`
    },
    [params],
  )

  return <Pagination currentPage={currentPage} pageCount={props.pageCount} hrefBuilder={hrefBuilder} />
}

function ZeroStateBanner() {
  return (
    <Box sx={{minHeight: '80vh', maxWidth: '30rem', margin: 'auto', paddingTop: '20vh'}} data-hpc>
      <Blankslate>
        <Blankslate.Visual>
          <AlertIcon size="medium" fill="fg.subtle" />
        </Blankslate.Visual>
        <Blankslate.Heading>No available references for this code</Blankslate.Heading>
        <Blankslate.Description>
          The original code references might not be available anymore due to changes in the code or repository privacy.
        </Blankslate.Description>
        <Blankslate.SecondaryAction href="https://docs.github.com/copilot">
          Learn more about references in the documentation
        </Blankslate.SecondaryAction>
      </Blankslate>
    </Box>
  )
}
