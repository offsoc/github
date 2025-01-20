import {useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {ProjectItemSection$key} from './__generated__/ProjectItemSection.graphql'
import {ProjectItemSectionView} from './ProjectItemSectionView'
import {ProjectItemSectionFieldList} from './ProjectItemSectionFieldList'
import {Box} from '@primer/react'

export type ProjectItemSectionProps = {
  projectItem: ProjectItemSection$key
  isOpen: boolean
  onIssueUpdate?: () => void
}

export function ProjectItemSection({projectItem, onIssueUpdate, isOpen = false}: ProjectItemSectionProps) {
  const [open, setOpen] = useState(isOpen)
  const data = useFragment(
    graphql`
      fragment ProjectItemSection on ProjectV2Item {
        id
        isArchived
        project {
          id
        }
        ...ProjectItemSectionView
      }
    `,
    projectItem,
  )

  return (
    <Box
      sx={{
        my: 2,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        width: '100%',
        py: 2,
        pt: 'var(--control-xsmall-paddingInline-spacious)',
      }}
    >
      <ProjectItemSectionView
        projectItem={data}
        open={open}
        setOpen={setOpen}
        onIssueUpdate={onIssueUpdate}
        isProjectOpen={isOpen}
      />
      {open && (
        <ProjectItemSectionFieldList
          projectItemId={data.id}
          projectId={data.project.id}
          isArchived={data.isArchived}
          onIssueUpdate={onIssueUpdate}
        />
      )}
    </Box>
  )
}
