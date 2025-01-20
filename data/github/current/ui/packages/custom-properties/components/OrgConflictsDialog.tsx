import type {OrgConflictUsage, PropertyNameOrgConflicts} from '@github-ui/custom-properties-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Button} from '@primer/react'
import {Dialog} from '@primer/react/drafts'

import {definitionTypeLabels} from '../helpers/definition-type-labels'
import styles from './OrgConflictsDialog.module.css'

export function OrgConflictsDialog({
  onClose,
  orgConflicts,
}: {
  onClose: () => void
  orgConflicts: PropertyNameOrgConflicts
}) {
  const {usages, totalUsageCount} = orgConflicts
  const displayedUsagesCount = usages.length

  const displayMessage = `This property cannot be created because there are conflicting properties in this enterprise's organizations${
    displayedUsagesCount < totalUsageCount
      ? ` (showing ${displayedUsagesCount} out of a total ${totalUsageCount} conflicts)`
      : ''
  }.`

  return (
    <Dialog onClose={onClose} renderHeader={() => null}>
      <Dialog.Header>
        <h4>Conflicts</h4>
        <p className={styles.description}>{displayMessage}</p>
      </Dialog.Header>
      <Dialog.Body as="ul">
        {orgConflicts.usages.map(usage => (
          <OrgConflictRow key={usage.name} orgConflictUsage={usage} />
        ))}
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onClose}>Done</Button>
      </Dialog.Footer>
    </Dialog>
  )
}

function OrgConflictRow({orgConflictUsage}: {orgConflictUsage: OrgConflictUsage}) {
  return (
    <li className={styles.orgConflictRow}>
      <div className={styles.avatarLabelGroup}>
        <GitHubAvatar className={styles.avatarIcon} square src={orgConflictUsage.avatarUrl} />
        <span className={styles.avatarLabel}>{orgConflictUsage.name}</span>
      </div>
      <span className={styles.orgConflictPropertyTypeLabel}>{definitionTypeLabels[orgConflictUsage.propertyType]}</span>
    </li>
  )
}
