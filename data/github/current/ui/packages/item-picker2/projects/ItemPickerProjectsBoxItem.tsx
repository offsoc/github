import {graphql, useFragment} from 'react-relay'
import type {ItemPickerProjectsBoxItem_V2Fragment$key} from './__generated__/ItemPickerProjectsBoxItem_V2Fragment.graphql'
import type {ItemPickerProjectsBoxItem_ClassicFragment$key} from './__generated__/ItemPickerProjectsBoxItem_ClassicFragment.graphql'
import {Box, Link, Truncate} from '@primer/react'
import {ProjectIcon, TableIcon} from '@primer/octicons-react'

export function ItemPickerProjectsV2BoxItem({projectKey}: {projectKey: ItemPickerProjectsBoxItem_V2Fragment$key}) {
  const project = useFragment(
    graphql`
      fragment ItemPickerProjectsBoxItem_V2Fragment on ProjectV2 {
        title
        url
      }
    `,
    projectKey,
  )

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        p: 'var(--control-xsmall-paddingInline-spacious)',
      }}
    >
      <Box sx={{display: 'flex', width: '100%'}}>
        <Link
          href={project.url}
          hoverColor={'accent.fg'}
          inline={false}
          sx={{
            color: 'fg.default',
            fontSize: 0,
            fontWeight: 'bold',
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            width: '100%',
            '&:hover': {textDecoration: 'none'},
          }}
          tabIndex={0}
        >
          <TableIcon />
          <Truncate title={project.title}>{project.title}</Truncate>
        </Link>
      </Box>
    </Box>
  )
}

export function ItemPickerProjectsClassicBoxItem({
  projectKey,
}: {
  projectKey: ItemPickerProjectsBoxItem_ClassicFragment$key
}) {
  const project = useFragment(
    graphql`
      fragment ItemPickerProjectsBoxItem_ClassicFragment on Project {
        title: name
        url
      }
    `,
    projectKey,
  )

  return (
    <Box sx={{display: 'flex', width: '100%'}}>
      <Link
        href={project.url}
        hoverColor={'accent.fg'}
        inline={false}
        sx={{
          color: 'fg.default',
          fontSize: 0,
          fontWeight: 'bold',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          width: '100%',
          '&:hover': {textDecoration: 'none'},
        }}
        tabIndex={0}
      >
        <ProjectIcon />
        <Truncate title={project.title}>{project.title}</Truncate>
      </Link>
    </Box>
  )
}
