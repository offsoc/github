import {Suspense, useMemo} from 'react'
import type {OptionConfig} from './OptionConfig'
import type {IssueViewerViewer$data} from './__generated__/IssueViewerViewer.graphql'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'

import {noop} from '@github-ui/noop'
import {EditIssueMilestonesSection} from '@github-ui/issue-metadata/MilestonesSection'
import {EditIssueAssigneesSection} from '@github-ui/issue-metadata/AssigneesSection'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {OldExperienceReloadBanner} from './OldExperienceReloadBanner'
import {OptionsSection} from './sections/OptionsSection'
import {graphql, useFragment} from 'react-relay'
import type {IssueSidebarPrimaryQuery$key} from './__generated__/IssueSidebarPrimaryQuery.graphql'
import {IssueSidebarLazySections, IssueSidebarLazySectionsFallback} from './IssueSidebarLazySections'
import {EditIssueProjectsSection} from '@github-ui/issue-metadata/ProjectsSection'
import {EditIssueLabelsSection} from '@github-ui/issue-metadata/LabelsSection'
import type {IssueSidebarSecondary$key} from './__generated__/IssueSidebarSecondary.graphql'
import type {IssueSidebarLazySections$key} from './__generated__/IssueSidebarLazySections.graphql'
import type {AssigneesSectionLazyFragment$key} from '@github-ui/issue-metadata/AssigneesSectionLazyFragment.graphql'

type IssueSidebarProps = {
  sidebarKey: IssueSidebarPrimaryQuery$key
  sidebarSecondaryKey?: IssueSidebarSecondary$key | IssueSidebarLazySections$key
  optionConfig: OptionConfig
  viewer: IssueViewerViewer$data | null
}

const IssueSidebarSecondary = graphql`
  fragment IssueSidebarSecondary on Issue {
    ...OptionsSectionSecondary
    ...AssigneesSectionLazyFragment
  }
`

export const IssueSidebarPrimaryGraphqlQuery = graphql`
  fragment IssueSidebarPrimaryQuery on Issue @argumentDefinitions(allowedOwner: {type: "String", defaultValue: null}) {
    ...AssigneesSectionFragment
    ...LabelsSectionFragment
    ...ProjectsSectionFragment @arguments(allowedOwner: $allowedOwner)
    ...MilestonesSectionFragment
    ...OptionsSectionFragment
  }
`

export function IssueSidebar({sidebarKey, sidebarSecondaryKey, optionConfig, viewer}: IssueSidebarProps) {
  const issue = useFragment(IssueSidebarPrimaryGraphqlQuery, sidebarKey)
  const issueSecondary = useFragment(IssueSidebarSecondary, sidebarSecondaryKey as IssueSidebarSecondary$key)

  const {sub_issues} = useFeatureFlags()

  const sidebar = useMemo(
    () => (
      <>
        <EditIssueAssigneesSection
          issue={issue}
          viewer={viewer}
          lazyKey={issueSecondary as AssigneesSectionLazyFragment$key}
          onIssueUpdate={optionConfig.onIssueUpdate}
          singleKeyShortcutsEnabled={optionConfig.singleKeyShortcutsEnabled || false}
          insideSidePanel={optionConfig.insideSidePanel}
        />
        <EditIssueLabelsSection
          issue={issue}
          onIssueUpdate={optionConfig.onIssueUpdate}
          singleKeyShortcutsEnabled={optionConfig.singleKeyShortcutsEnabled || false}
          insideSidePanel={optionConfig.insideSidePanel}
        />
        <PreloadedQueryBoundary
          onRetry={noop}
          fallback={() => {
            return (
              <Section
                sectionHeader={<ReadonlySectionHeader title={'Projects are currently unavailable'} />}
                emptyText={'Please try again later'}
              >
                <></>
              </Section>
            )
          }}
        >
          <EditIssueProjectsSection
            selectedProjectId={optionConfig.selectedProjectId}
            allowedProjectOwner={optionConfig.allowedProjectOwner}
            issueOrPullRequest={issue}
            onIssueUpdate={optionConfig.onIssueUpdate}
            singleKeyShortcutsEnabled={optionConfig.singleKeyShortcutsEnabled || false}
            insideSidePanel={optionConfig.insideSidePanel}
          />
        </PreloadedQueryBoundary>
        <EditIssueMilestonesSection
          issue={issue}
          onIssueUpdate={optionConfig.onIssueUpdate}
          singleKeyShortcutsEnabled={optionConfig.singleKeyShortcutsEnabled || false}
          insideSidePanel={optionConfig.insideSidePanel}
        />
        <Suspense fallback={<IssueSidebarLazySectionsFallback hasViewer={!!viewer} subIssuesEnabled={sub_issues} />}>
          <IssueSidebarLazySections
            onLinkClick={optionConfig.onLinkClick}
            onIssueUpdate={optionConfig.onIssueUpdate}
            singleKeyShortcutsEnabled={optionConfig.singleKeyShortcutsEnabled || false}
            subIssuesEnabled={sub_issues}
            insideSidePanel={optionConfig.insideSidePanel}
            hasViewer={!!viewer}
            issueSidebarSecondaryKey={sidebarSecondaryKey as IssueSidebarLazySections$key}
          />
        </Suspense>
        <OptionsSection optionsSection={issue} optionsSectionSecondary={issueSecondary} optionConfig={optionConfig} />
        {optionConfig.showReloadInOldExperience && <OldExperienceReloadBanner />}
      </>
    ),
    [issue, issueSecondary, optionConfig, sidebarSecondaryKey, sub_issues, viewer],
  )

  return sidebar
}
