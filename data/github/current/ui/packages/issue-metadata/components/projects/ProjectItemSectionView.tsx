import {ChevronDownIcon, ChevronUpIcon, ProjectTemplateIcon, TableIcon} from '@primer/octicons-react'
import {Box, IconButton, Link, Octicon, Text, Truncate} from '@primer/react'
import {SingleSelectField} from './fields/SingleSelectField'
import {graphql, useFragment} from 'react-relay'
import type {ProjectItemSectionView$key} from './__generated__/ProjectItemSectionView.graphql'
import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '@github-ui/issue-body/constants/test-ids'

export type ProjectItemSectionViewProps = {
  projectItem: ProjectItemSectionView$key
  open: boolean
  setOpen: (isOpen: boolean) => void
  onIssueUpdate?: () => void
  isProjectOpen: boolean
}

export function ProjectItemSectionView({projectItem, setOpen, open, isProjectOpen}: ProjectItemSectionViewProps) {
  const {id, project, fieldValueByName, isArchived} = useFragment(
    graphql`
      fragment ProjectItemSectionView on ProjectV2Item {
        id
        # eslint-disable-next-line relay/unused-fields
        isArchived
        project {
          id
          title
          template
          viewerCanUpdate
          url
          field(name: "Status") {
            ...SingleSelectFieldConfigFragment
          }
        }
        fieldValueByName(name: "Status") {
          ...SingleSelectFieldFragment
        }
      }
    `,
    projectItem,
  )

  return (
    <Box
      sx={{
        pl: 'var(--control-xsmall-paddingInline-spacious)',
        pr: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'flex-start',
      }}
    >
      {isProjectOpen ? (
        <Text
          sx={{
            color: 'fg.default',
            display: 'flex',
            gap: 1,
            fontSize: 0,
            fontWeight: 'bold',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Octicon icon={project.template ? ProjectTemplateIcon : TableIcon} />
          <Text sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{project.title}</Text>
        </Text>
      ) : (
        <Box sx={{display: 'flex', width: '100%'}}>
          <Link
            href={project.url}
            hoverColor={'accent.fg'}
            underline={false}
            sx={{
              color: 'fg.default',
              display: 'flex',
              fontSize: 0,
              fontWeight: 'bold',
              gap: 1,
              alignItems: 'center',
              '&:hover': {textDecoration: 'none'},
              width: '100%',
            }}
            tabIndex={0}
          >
            <Octicon icon={project.template ? ProjectTemplateIcon : TableIcon} />
            <Truncate
              title={project.title}
              sx={{maxWidth: '100%', display: 'block', pr: 2}}
              data-testid={TEST_IDS.projectTitle}
            >
              {project.title}
            </Truncate>
          </Link>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        <Box as={'ul'} sx={{flex: '1 0 auto', listStyleType: 'none', width: '75%'}}>
          {project.field && fieldValueByName !== undefined && (
            <SingleSelectField
              viewerCanUpdate={project.viewerCanUpdate && !isArchived}
              itemId={id}
              projectId={project.id}
              field={project.field}
              value={fieldValueByName}
              isStatusField={true}
            />
          )}
        </Box>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          sx={{display: 'flex', alignItems: 'center', gap: 2, color: 'fg.subtle', fontSize: 0, ml: 'auto'}}
          variant="invisible"
          onClick={() => {
            setOpen(!open)
          }}
          size="small"
          icon={!open ? ChevronDownIcon : ChevronUpIcon}
          aria-label={LABELS.showMoreProjectFields}
        />
      </Box>
    </Box>
  )
}
