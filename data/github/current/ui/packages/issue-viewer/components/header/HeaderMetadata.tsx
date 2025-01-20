import {HeaderState} from './HeaderState'
import {Box} from '@primer/react'
import {TaskListStatus, SmallTaskListStatus} from '../shared/TaskListStatus'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {StickyHeaderTitle} from './StickyHeaderTitle'
import {StickyHeaderMenu, type HeaderMenuBaseProps} from './HeaderMenu'
import {Suspense} from 'react'
import {ContentWrapper} from '../ContentWrapper'
import {HeaderIssueType, SmallHeaderIssueType} from './HeaderIssueType'
import type {OptionConfig} from '../OptionConfig'
import {RepositoryPill, SmallRepositoryPill} from './RepositoryPill'
import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {HeaderMetadata$key} from './__generated__/HeaderMetadata.graphql'
import {TrackedBy, SmallTrackedBy} from './TrackedBy'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import {TEST_IDS} from '../../constants/test-ids'
import {HeaderSubIssueSummary} from './HeaderSubIssueSummary'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {HeaderParentTitle} from './HeaderParentTitle'
import type {TaskListStatusFragment$key} from '../shared/__generated__/TaskListStatusFragment.graphql'
import type {TrackedByFragment$key} from './__generated__/TrackedByFragment.graphql'
import {LinkedPullRequestsInternal} from './LinkedPullRequests'
import type {HeaderParentTitle$key} from './__generated__/HeaderParentTitle.graphql'
import type {HeaderSubIssueSummary$key} from './__generated__/HeaderSubIssueSummary.graphql'

export type HeaderMetadataProps = {
  headerMetadataKey: HeaderMetadata$key
  optionConfig: OptionConfig
  isSticky: boolean
  stickyStyles: BetterSystemStyleObject
  headerMetadataSecondaryKey?:
    | TaskListStatusFragment$key
    | TrackedByFragment$key
    | HeaderParentTitle$key
    | HeaderSubIssueSummary$key
} & HeaderMenuBaseProps

const FIXED_HEADER_HEIGHT = '56px'

export function HeaderMetadata({
  headerMetadataKey,
  optionConfig,
  isSticky,
  metadataPaneTrigger,
  containerRef,
  headerMetadataSecondaryKey,
}: HeaderMetadataProps) {
  const {showRepositoryPill, innerSx} = optionConfig
  const sub_issues = useFeatureFlag('sub_issues')

  const headerData = useFragment(
    graphql`
      fragment HeaderMetadata on Issue {
        url
        ...HeaderIssueType
        ...HeaderMenu
        ...HeaderState
        ...StickyHeaderTitle
        ...RepositoryPill
        ...LinkedPullRequests
        ...HeaderSubIssueSummaryWithPrimary
      }
    `,
    headerMetadataKey,
  )

  const breakpoint = useContainerBreakpoint(containerRef?.current ?? null)

  return (
    <>
      {/* Regular header */}
      <ContentWrapper sx={innerSx}>
        <Box
          data-testid={TEST_IDS.issueMetadataFixed}
          sx={{
            height: '100%',
            mb: isSticky ? `-${FIXED_HEADER_HEIGHT}` : undefined,
            minHeight: FIXED_HEADER_HEIGHT,
            width: '100%',
          }}
        >
          <Box
            sx={{
              borderBottom: '1px solid',
              borderColor: 'border.subtle',
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexGrow: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                py: 'var(--base-size-12, 12px)',
                overflow: 'hidden',
              }}
            >
              <HeaderState stateData={headerData} />
              <HeaderIssueType data={headerData} />

              {sub_issues ? (
                <HeaderSubIssueSummary
                  subIssuePrimaryKey={headerData}
                  subIssueSecondaryKey={headerMetadataSecondaryKey as HeaderSubIssueSummary$key}
                />
              ) : (
                <Suspense>
                  <TaskListStatus taskListStatusKey={headerMetadataSecondaryKey as TaskListStatusFragment$key} />
                </Suspense>
              )}

              {sub_issues && (
                <HeaderParentTitle
                  parentKey={headerMetadataSecondaryKey as HeaderParentTitle$key}
                  optionConfig={optionConfig}
                />
              )}
              <Suspense>
                <TrackedBy url={headerData.url} trackedByKey={headerMetadataSecondaryKey as TrackedByFragment$key} />
              </Suspense>

              <LinkedPullRequestsInternal issueData={headerData} />
              {showRepositoryPill && <RepositoryPill repositoryPillData={headerData} />}
            </Box>
            {metadataPaneTrigger && (
              // Center trigger relative to the first "row"
              <Box sx={{alignSelf: 'flex-start', pt: 2}}>{metadataPaneTrigger}</Box>
            )}
          </Box>
        </Box>
      </ContentWrapper>

      {/* "Sticky" header */}
      <Box
        data-testid={TEST_IDS.issueMetadataSticky}
        sx={{
          alignItems: 'center',
          backgroundColor: 'canvas.default',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          display: isSticky ? 'flex' : 'none',
          height: FIXED_HEADER_HEIGHT,
          justifyContent: 'center',
          position: 'sticky',
          width: '100%',
          zIndex: 14,
        }}
        className={'js-notification-shelf-offset-top'}
      >
        <ContentWrapper sx={innerSx}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              width: '100%',
            }}
          >
            <HeaderState stateData={headerData} />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                gap: '2px',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <StickyHeaderTitle headerTitleData={headerData} scrollToTopOnClick={optionConfig.scrollToTopOnClick} />
              <Box
                sx={{
                  alignItems: 'center',
                  color: 'fg.muted',
                  display: optionConfig.useViewportQueries
                    ? ['none', 'none', 'flex', 'flex']
                    : breakpoint(['none', 'none', 'flex', 'flex']),
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  fontSize: 0,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',

                  '& > *:not(:last-child)::after': {
                    content: '"•"',
                    mx: 1,
                  },
                }}
              >
                <SmallHeaderIssueType data={headerData} />
                {sub_issues ? (
                  <HeaderSubIssueSummary
                    subIssuePrimaryKey={headerData}
                    subIssueSecondaryKey={headerMetadataSecondaryKey as HeaderSubIssueSummary$key}
                    size="small"
                  />
                ) : (
                  <Suspense>
                    <SmallTaskListStatus taskListStatusKey={headerMetadataSecondaryKey as TaskListStatusFragment$key} />
                  </Suspense>
                )}

                {sub_issues && (
                  <HeaderParentTitle
                    parentKey={headerMetadataSecondaryKey as HeaderParentTitle$key}
                    optionConfig={optionConfig}
                    small
                  />
                )}
                <Suspense>
                  <SmallTrackedBy
                    url={headerData.url}
                    trackedByKey={headerMetadataSecondaryKey as TrackedByFragment$key}
                  />
                </Suspense>
                <LinkedPullRequestsInternal issueData={headerData} isSmall={true} />
                {showRepositoryPill && <SmallRepositoryPill repositoryPillData={headerData} />}
              </Box>
            </Box>
            <div>
              <StickyHeaderMenu
                optionConfig={optionConfig}
                headerMenuData={headerData}
                metadataPaneTrigger={metadataPaneTrigger}
                containerRef={containerRef}
              />
            </div>
            {metadataPaneTrigger}
          </Box>
        </ContentWrapper>
      </Box>
    </>
  )
}
