import {useCallback} from 'react'
import {useIssueCreateDataContext} from '../contexts/IssueCreateDataContext'
import {useIssueCreateConfigContext} from '../contexts/IssueCreateConfigContext'
import type {Milestone} from '@github-ui/item-picker/MilestonePicker'
import {MetadataFooter} from './MetadataFooter'
import {MetadataSidebar} from './MetadataSidebar'

export type SharedMetadataProps = {
  repo: string
  owner: string
  setMilestoneCallback: (milestones: Milestone[] | null) => void
  canAssign: boolean
  canLabel: boolean
  canMilestone: boolean
  canProject: boolean
}

export const MetadataSelectors = () => {
  const {optionConfig} = useIssueCreateConfigContext()
  const showMetadataInSidebar = !optionConfig.insidePortal
  const {repository, setMilestone} = useIssueCreateDataContext()

  const setMilestoneCallback = useCallback(
    (milestones: Milestone[] | null) => {
      setMilestone(milestones?.[0] || null)
    },
    [setMilestone],
  )

  const canAssign = repository?.viewerIssueCreationPermissions?.assignable
  const canLabel = repository?.viewerIssueCreationPermissions?.labelable
  const canMilestone = repository?.viewerIssueCreationPermissions?.milestoneable
  const canProject = repository?.viewerIssueCreationPermissions?.triageable

  const sharedMetadataProps: SharedMetadataProps = {
    repo: repository?.name || '',
    owner: repository?.owner.login || '',
    setMilestoneCallback,
    canAssign: canAssign ?? false,
    canLabel: canLabel ?? false,
    canMilestone: canMilestone ?? false,
    canProject: canProject ?? false,
  }

  return showMetadataInSidebar ? (
    <MetadataSidebar {...sharedMetadataProps} />
  ) : (
    <MetadataFooter {...sharedMetadataProps} />
  )
}
