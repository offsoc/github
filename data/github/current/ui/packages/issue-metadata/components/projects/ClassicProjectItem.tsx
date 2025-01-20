import {graphql, useFragment} from 'react-relay'
import {Box, Link, Octicon, Text} from '@primer/react'
import {ProjectIcon} from '@primer/octicons-react'
import {SingleSelectColumn} from './fields/SingleSelectColumn'
import {TEST_IDS} from '@github-ui/issue-body/constants/test-ids'
import type {ClassicProjectItem$key} from './__generated__/ClassicProjectItem.graphql'

type ClassicProjectItemProps = {
  projectItem: ClassicProjectItem$key
  onIssueUpdate?: () => void
  issueId: string
}

export function ClassicProjectItem({projectItem, ...rest}: ClassicProjectItemProps) {
  const {project, column} = useFragment(
    graphql`
      fragment ClassicProjectItem on ProjectCard {
        project {
          name
          url
          ...SingleSelectColumnProject
        }
        column {
          ...SingleSelectColumn
        }
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
          >
            <Octicon icon={ProjectIcon} />
            <Text
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                display: 'block',
                pr: 2,
              }}
              data-testid={TEST_IDS.projectTitle}
            >
              {project.name}
            </Text>
          </Link>
        </Box>
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
            <SingleSelectColumn projectItem={project} column={column} {...rest} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
