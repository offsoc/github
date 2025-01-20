import {useFragment, graphql} from 'react-relay'
import {DevelopmentSection, DevelopmentSectionFallback} from './sections/development-section/DevelopmentSection'
import {SubscriptionSection, SubscriptionSectionFallback} from './sections/SubscriptionSection'
import type {IssueSidebarLazySections$key} from './__generated__/IssueSidebarLazySections.graphql'
import {ParticipantsSection} from './sections/ParticipantsSection'
import {
  RelationshipsSectionFallback,
  RelationshipsSectionInternal,
} from './sections/relations-section/RelationshipsSection'

type IssueSidebarLazySectionsBaseProps = {
  onLinkClick?: (event: MouseEvent) => void
  onIssueUpdate?: () => void
  singleKeyShortcutsEnabled: boolean
  subIssuesEnabled?: boolean
  insideSidePanel?: boolean
  hasViewer: boolean
}

type IssueSidebarLazySectionsProps = IssueSidebarLazySectionsBaseProps & {
  issueSidebarSecondaryKey?: IssueSidebarLazySections$key
}

type FallbackProps = {
  subIssuesEnabled?: boolean
  hasViewer: boolean
}

export function IssueSidebarLazySections({
  issueSidebarSecondaryKey,
  onIssueUpdate,
  onLinkClick,
  singleKeyShortcutsEnabled,
  subIssuesEnabled,
  insideSidePanel,
  hasViewer,
}: IssueSidebarLazySectionsProps) {
  const data = useFragment(
    graphql`
      fragment IssueSidebarLazySections on Issue {
        ...DevelopmentSectionFragment
        ...RelationshipsSectionFragment
        ...SubscriptionSectionFragment
        ...ParticipantsSectionFragment
      }
    `,
    issueSidebarSecondaryKey,
  )

  if (!data) {
    return <IssueSidebarLazySectionsFallback hasViewer={hasViewer} subIssuesEnabled={subIssuesEnabled} />
  }

  return (
    <>
      {subIssuesEnabled && (
        <RelationshipsSectionInternal issue={data} onLinkClick={onLinkClick} insideSidePanel={insideSidePanel} />
      )}
      <DevelopmentSection
        shortcutEnabled={singleKeyShortcutsEnabled}
        issue={data}
        onIssueUpdate={onIssueUpdate}
        insideSidePanel={insideSidePanel}
      />
      {hasViewer && <SubscriptionSection issue={data} />}
      <ParticipantsSection issue={data} />
    </>
  )
}

export function IssueSidebarLazySectionsFallback({hasViewer, subIssuesEnabled}: FallbackProps) {
  return (
    <>
      {subIssuesEnabled && <RelationshipsSectionFallback />}
      <DevelopmentSectionFallback />
      {hasViewer && <SubscriptionSectionFallback />}
    </>
  )
}
