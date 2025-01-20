import {noop} from '@github-ui/noop'
import {CommitIcon} from '@primer/octicons-react'
import type {Meta, StoryObj} from '@storybook/react'

import {ListItemDescription} from '../../ListItem/Description'
import {ListItemLeadingContent} from '../../ListItem/LeadingContent'
import {ListItem} from '../../ListItem/ListItem'
import {ListItemMainContent} from '../../ListItem/MainContent'
import {ListItemTitle} from '../../ListItem/Title'
import {ListViewDensityToggle} from '../DensityToggle'
import {ListView} from '../ListView'
import {ListViewNote} from '../Note'
import {SampleListViewMetadataWithActions} from './helpers'
import styles from './Note.stories.module.css'

const meta: Meta<typeof ListViewNote> = {
  title: 'Recipes/ListView/Subcomponents/ListViewNote',
  component: ListViewNote,
}

export default meta

const SampleItem = () => (
  <ListItem title={<ListItemTitle value="Who took the cookie from the cookie jar?" href="#" onClick={noop} />}>
    <ListItemLeadingContent />

    <ListItemMainContent>
      <ListItemDescription>github/issues#123 • Updated 12 minutes ago</ListItemDescription>
    </ListItemMainContent>
  </ListItem>
)

const metadata = <SampleListViewMetadataWithActions densityToggle={<ListViewDensityToggle />} />
type Story = StoryObj<typeof ListViewNote>

export const Example: Story = {
  name: 'ListViewNote',
  render: () => (
    <div className={styles.container}>
      <ListView title="Note story list" metadata={metadata}>
        <ListViewNote title="This is a note. It can provide additional non-ListItem context." className={styles.note} />
        <SampleItem />
        <SampleItem />
        <ListViewNote title="This is a note with an icon and trailing content." leadingIcon={CommitIcon}>
          <a href="#abc">Trailing content can include links.</a>
        </ListViewNote>
      </ListView>
    </div>
  ),
}
