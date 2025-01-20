import {Box, Link} from '@primer/react'
import {HeaderMenu, type HeaderMenuBaseProps} from './HeaderMenu'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {PageHeader} from '@primer/react/experimental'

import type {OptionConfig} from '../OptionConfig'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {issueHovercardPath} from '@github-ui/paths'
import {graphql} from 'relay-runtime'
import type {HeaderViewer$key} from './__generated__/HeaderViewer.graphql'
import {useFragment} from 'react-relay'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import type {HeaderParentTitle$key} from './__generated__/HeaderParentTitle.graphql'

export type HeaderViewerProps = {
  headerViewerKey: HeaderViewer$key
  parentKey?: HeaderParentTitle$key
  optionConfig: OptionConfig
} & HeaderMenuBaseProps

export function HeaderViewer({headerViewerKey, optionConfig, containerRef, ...rest}: HeaderViewerProps) {
  const data = useFragment(
    graphql`
      fragment HeaderViewer on Issue {
        titleHTML
        number
        url
        repository {
          name
          owner {
            login
          }
        }
        ...HeaderMenu
      }
    `,
    headerViewerKey,
  )
  const {titleHTML, number, url, repository} = data
  const {titleAs = 'h1'} = optionConfig

  const headerMenu = (
    <HeaderMenu optionConfig={optionConfig} headerMenuData={data} containerRef={containerRef} {...rest} />
  )

  const breakpoint = useContainerBreakpoint(containerRef?.current ?? null)

  return (
    <div aria-label="Header" role={'region'} data-testid={TEST_IDS.issueHeader}>
      <PageHeader
        sx={{
          pt: [0, 0, 2, 2],
        }}
      >
        <PageHeader.TitleArea
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: [2, 2, 0, 0],
          }}
        >
          <PageHeader.Title
            as={titleAs}
            sx={{
              lineHeight: '1.25',
              // There is no design system value for '26px',
              // but we want to align with PRs experience
              fontSize: optionConfig.useViewportQueries
                ? ['26px', '26px', 'var(--text-title-size-large, 32px)', 'var(--text-title-size-large, 32px)']
                : breakpoint([
                    '26px',
                    '26px',
                    'var(--text-title-size-large, 32px)',
                    'var(--text-title-size-large, 32px)',
                  ]),
              fontWeight: 'normal',
            }}
          >
            <SafeHTMLBox
              as="bdi"
              sx={{display: 'inline', wordBreak: 'break-word', mr: 2}}
              className="markdown-title"
              html={titleHTML as SafeHTMLString}
              data-testid={TEST_IDS.issueTitle}
            />
            <Box sx={{display: 'inline-flex', whiteSpace: 'nowrap', alignItems: 'center', gap: 1}}>
              <Link
                href={url}
                target="_blank"
                data-hovercard-url={issueHovercardPath({
                  owner: repository.owner.login,
                  repo: repository.name,
                  issueNumber: number,
                })}
                sx={{color: 'fg.muted', fontWeight: 'light', display: 'inline'}}
              >
                {LABELS.issueNumber(number)}
              </Link>
            </Box>
          </PageHeader.Title>
        </PageHeader.TitleArea>
        {/* Mobile page viewport actions */}
        <PageHeader.ContextArea>
          <PageHeader.ContextAreaActions
            sx={{
              flexGrow: 0,
              width: '100%',
              justifyContent: 'left',
            }}
          >
            {headerMenu}
          </PageHeader.ContextAreaActions>
        </PageHeader.ContextArea>
        {/* Desktop page viewport, narrow container viewport actions */}
        {!optionConfig.useViewportQueries && (
          // Only in the case where container-aware breakpoints are used
          <PageHeader.ContextArea hidden={false} sx={{display: ['none', 'none', 'flex', 'flex']}}>
            <Box sx={{display: ['none', 'none', 'flex', 'flex'], width: '100%'}}>
              <Box sx={{display: breakpoint(['flex', 'flex', 'none', 'none']), width: '100%'}}>{headerMenu}</Box>
            </Box>
          </PageHeader.ContextArea>
        )}
        <PageHeader.Actions
          sx={{
            display: optionConfig.useViewportQueries
              ? ['none', 'none', 'flex', 'flex']
              : breakpoint(['none', 'none', 'flex', 'flex']),
            // TODO: Can be removed once this fix for a Safari-specific issue has been upstreamed: https://github.com/primer/react/pull/4738
            minWidth: 'max-content',
          }}
        >
          {headerMenu}
        </PageHeader.Actions>
      </PageHeader>
    </div>
  )
}
