import {ActionList, Label} from '@primer/react'
import type {Meta} from '@storybook/react'

import {ListItemActionBar} from '../ListItem/ActionBar'
import {ListItemDescription} from '../ListItem/Description'
import {ListItem} from '../ListItem/ListItem'
import {ListItemMainContent} from '../ListItem/MainContent'
import {ListItemMetadata} from '../ListItem/Metadata'
import {ListItemTitle} from '../ListItem/Title'
import {ListView, type ListViewProps} from '../ListView/ListView'
import {ListViewMetadata} from '../ListView/Metadata'
import styles from './IssueTypes.stories.module.css'

const meta: Meta<ListViewProps> = {
  title: 'Recipes/ListView/Custom Sx',
  component: ListView,
}

export default meta

/**
 * Mimic the https://github.com/organizations/<org>/settings/issue-types page.
 * The <IssueTypesList> component that this story is based off of is located in this package directory:
 * https://github.com/github/github/blob/master/ui/packages/issue-types/components/IssueTypesList.tsx
 * Keeping the component in sync with the story will require manually monitoring changes.
 */
export const IssueTypes = {
  render: () => <IssueTypesList />,
}

const IssueTypesList = () => {
  const totalCount = issueTypePropItems.length

  return (
    <div className={styles.issueTypesListContainer}>
      <ListView
        metadata={<ListViewMetadata title={`${totalCount} types`} />}
        totalCount={totalCount}
        title={`${totalCount} types`}
        variant="compact"
      >
        {issueTypePropItems.map((issueType, index) => (
          <SampleIssueType id={index} key={index} {...issueType} />
        ))}
      </ListView>
    </div>
  )
}

const issueTypePropItems: IssueTypeItemProps[] = [
  {
    name: 'Issue With Space',
    description: 'Reasonable description',
    hasActions: false,
  },
  {
    name: 'Issue Type 2',
    description: 'Another reasonable description',
    hasActions: true,
  },
  {
    name: 'Very very very long issue type name',
    description:
      'A somewhat unreasonable description length? Hopefully they realize that brevity is the soul of wit at some point before they hit save.',
    hasActions: true,
    isPrivate: true,
  },
  {
    name: 'Issue Type 4',
    hasActions: false,
    isEnabled: true,
  },
]

type IssueTypeItemProps = {
  id?: number
  name: string
  description?: string
  hasActions: boolean
  isEnabled?: boolean
  isPrivate?: boolean
}

const SampleIssueType = ({name, description, hasActions, isEnabled, isPrivate}: IssueTypeItemProps) => {
  return (
    <ListItem
      className={styles.sampleIssueType}
      title={
        <ListItemTitle
          value={name}
          containerClassName={styles.sampleIssueTypeContainer}
          headingClassName={styles.sampleIssueTypeHeader}
        />
      }
      metadata={
        <ListItemMetadata variant="primary" className={styles.sampleIssueTypeMetadata}>
          {!isEnabled && <Label>Disabled</Label>}
          {isPrivate && <Label>Private</Label>}
        </ListItemMetadata>
      }
      secondaryActions={
        hasActions ? (
          <ListItemActionBar
            staticMenuActions={[
              {
                key: 'edit',
                render: () => <ActionList.Item>Edit</ActionList.Item>,
              },
              {
                key: 'enable-disable',
                render: () => <ActionList.Item>{isEnabled ? 'Disable' : 'Enable'}</ActionList.Item>,
              },
              {
                key: 'delete',
                render: () => {
                  return (
                    <>
                      <ActionList.Divider />
                      <ActionList.Item variant="danger">Delete</ActionList.Item>
                    </>
                  )
                },
              },
            ]}
          />
        ) : undefined
      }
    >
      <ListItemMainContent>
        {description && <ListItemDescription>{description}</ListItemDescription>}
      </ListItemMainContent>
    </ListItem>
  )
}
