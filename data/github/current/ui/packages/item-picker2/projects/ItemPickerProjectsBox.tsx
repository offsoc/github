import {useRef, useState} from 'react'
import {Button, Heading, Text} from '@primer/react'
import {GearIcon} from '@primer/octicons-react'
import {graphql, useFragment} from 'react-relay'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {ItemPickerProjects, type ItemPickerProjectsProps} from './ItemPickerProjects'
import {ItemPickerProjectsClassicBoxItem, ItemPickerProjectsV2BoxItem} from './ItemPickerProjectsBoxItem'

import type {ItemPickerProjectsBox_SelectedClassicProjectCardsFragment$key} from './__generated__/ItemPickerProjectsBox_SelectedClassicProjectCardsFragment.graphql'
import type {ItemPickerProjectsBox_SelectedClassicProjectsFragment$key} from './__generated__/ItemPickerProjectsBox_SelectedClassicProjectsFragment.graphql'
import type {ItemPickerProjectsBox_SelectedProjectsV2Fragment$key} from './__generated__/ItemPickerProjectsBox_SelectedProjectsV2Fragment.graphql'

export type ItemPickerProjectsBoxProps = {
  selectedProjectsV2Key: ItemPickerProjectsBox_SelectedProjectsV2Fragment$key
  selectedClassicProjectsKey?: ItemPickerProjectsBox_SelectedClassicProjectsFragment$key
  selectedClassicProjectCardsKey?: ItemPickerProjectsBox_SelectedClassicProjectCardsFragment$key
  sx?: BetterSystemStyleObject
} & Omit<
  ItemPickerProjectsProps,
  | 'projectsButtonRef'
  | 'setOpen'
  | 'open'
  | 'selectedProjectsNames'
  | 'selectedProjectsV2Key'
  | 'selectedClassicProjectsKey'
  | 'selectedClassicProjectCardsKey'
>

export function ItemPickerProjectsBox({
  selectedProjectsV2Key,
  selectedClassicProjectsKey,
  selectedClassicProjectCardsKey,
  ...props
}: ItemPickerProjectsBoxProps) {
  const projectsButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const selectedProjectsV2 = useFragment(
    graphql`
      fragment ItemPickerProjectsBox_SelectedProjectsV2Fragment on ProjectV2Connection {
        ...ItemPickerProjects_SelectedProjectsV2Fragment
        nodes {
          __typename
          ...ItemPickerProjectsBoxItem_V2Fragment
        }
      }
    `,
    selectedProjectsV2Key,
  )

  const selectedClassicProjects = useFragment(
    graphql`
      fragment ItemPickerProjectsBox_SelectedClassicProjectsFragment on ProjectConnection {
        ...ItemPickerProjects_SelectedClassicProjectsFragment
        nodes {
          __typename
          ...ItemPickerProjectsBoxItem_ClassicFragment
        }
      }
    `,
    selectedClassicProjectsKey ?? null,
  )

  const selectedClassicProjectCards = useFragment(
    graphql`
      fragment ItemPickerProjectsBox_SelectedClassicProjectCardsFragment on ProjectCardConnection {
        ...ItemPickerProjects_SelectedClassicProjectCardsFragment
        nodes {
          project {
            __typename
            ...ItemPickerProjectsBoxItem_ClassicFragment
          }
        }
      }
    `,
    selectedClassicProjectCardsKey ?? null,
  )

  // remove all null nodes in a TypeScript-friendly way
  let initialSelectedClassicProjects = []
  if (selectedClassicProjectCardsKey) {
    initialSelectedClassicProjects = (selectedClassicProjectCards?.nodes || []).flatMap(a => (a ? a.project : []))
  } else {
    initialSelectedClassicProjects = (selectedClassicProjects?.nodes || []).flatMap(a => (a ? a : []))
  }
  // remove all null nodes in a TypeScript-friendly way
  const initialSelectedProjectsV2 = (selectedProjectsV2?.nodes || []).flatMap(a => (a ? a : []))

  const hasProjects =
    initialSelectedProjectsV2.length > 0 || (props.includeClassicProjects && initialSelectedClassicProjects.length > 0)
  return (
    <>
      <Button
        ref={projectsButtonRef}
        variant="invisible"
        size="small"
        trailingAction={GearIcon}
        block
        sx={{
          '[data-component=buttonContent]': {flex: '1 1 auto', justifyContent: 'left'},
          mb: 1,
        }}
        onClick={() => {
          setOpen(!open)
        }}
        {...testIdProps('item-picker-projects-box-edit-projects-button')}
      >
        <Heading as="h3" sx={{color: 'fg.muted', fontSize: 0}}>
          Projects
        </Heading>
        <span className="sr-only">Edit Projects</span>
      </Button>

      <div {...testIdProps('item-picker-projects-box-projects')}>
        {hasProjects ? (
          <>
            {initialSelectedProjectsV2.map((project, index) => (
              <ItemPickerProjectsV2BoxItem key={index} projectKey={project} />
            ))}
            {props.includeClassicProjects &&
              initialSelectedClassicProjects.map((project, index) => (
                <ItemPickerProjectsClassicBoxItem key={index} projectKey={project} />
              ))}
          </>
        ) : (
          <Text sx={{color: 'fg.muted', px: 2}}>No Projects</Text>
        )}
      </div>

      <ItemPickerProjects
        {...props}
        open={open}
        selectedProjectsV2Key={selectedProjectsV2}
        selectedClassicProjectsKey={selectedClassicProjects}
        selectedClassicProjectCardsKey={selectedClassicProjectCards}
        setOpen={setOpen}
        projectsButtonRef={projectsButtonRef}
      />
    </>
  )
}
