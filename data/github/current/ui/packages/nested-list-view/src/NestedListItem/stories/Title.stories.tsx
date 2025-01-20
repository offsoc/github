import type {SafeHTMLString} from '@github-ui/safe-html'
import {IssueOpenedIcon} from '@primer/octicons-react'
import type {Meta, StoryObj} from '@storybook/react'
import type {ReactNode} from 'react'
import {Link, MemoryRouter, Route, Routes} from 'react-router-dom'

import {NestedListView} from '../../NestedListView'
import {NestedListItemLeadingContent} from '../LeadingContent'
import {NestedListItemLeadingVisual} from '../LeadingVisual'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle, type NestedListItemTitleProps} from '../Title'

type NestedListItemTitleWithArgs = NestedListItemTitleProps

const meta: Meta<NestedListItemTitleWithArgs> = {
  title: 'Recipes/NestedListView/NestedListItem/Title',
  component: NestedListItemTitle,
  argTypes: {
    onClick: {action: 'clicked'},
  },
  parameters: {
    a11y: {
      config: {
        // Disable role=presentation axe rule on anchor tag
        rules: [
          {id: 'aria-allowed-role', enabled: false},
          {id: 'presentation-role-conflict', enabled: false},
        ],
      },
    },
  },
}

export default meta
type Story = StoryObj<NestedListItemTitleWithArgs>
type SampleListItemProps = {title: SafeHTMLString | string} & Omit<NestedListItemTitleProps, 'value'>

const SampleListItem = ({title, children, ...titleProps}: SampleListItemProps) => (
  <NestedListItem
    title={
      <NestedListItemTitle value={title} {...titleProps}>
        {children}
      </NestedListItemTitle>
    }
  >
    <NestedListItemLeadingContent>
      <NestedListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" description="Open Issue" />
    </NestedListItemLeadingContent>
  </NestedListItem>
)

export const Example: Story = {
  args: {
    href: '#',
  },
  render: ({...args}: NestedListItemTitleWithArgs) => (
    <NestedListView title="title storybook">
      <SampleListItem {...args} title="I am a clickable title!" />
    </NestedListView>
  ),
}

function ReactRouterWrapper({children}: {children?: ReactNode}) {
  return (
    <MemoryRouter initialEntries={['/cats']}>
      <Routes>
        <Route
          path={'/cats'}
          element={
            <>
              <h2>Cat Page</h2>
              {children}
            </>
          }
        />
        <Route
          path={'/dogs'}
          element={
            <>
              <h2>Dog Page</h2>
              {children}
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

export const ReactRouterLinkTitle: Story = {
  args: {
    href: '#',
  },
  render: ({...args}: NestedListItemTitleWithArgs) => (
    <ReactRouterWrapper>
      <NestedListView title="title storybook">
        <NestedListItem
          title={
            <NestedListItemTitle
              {...args}
              value="I am a clickable title with soft navigation!: Cats"
              additionalLinkProps={{as: Link, to: '/cats'}}
            />
          }
        >
          <NestedListItemLeadingContent>
            <NestedListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" />
          </NestedListItemLeadingContent>
        </NestedListItem>
        <NestedListItem
          title={
            <NestedListItemTitle
              {...args}
              value="I am a clickable title with soft navigation!: Dogs"
              additionalLinkProps={{as: Link, to: '/dogs'}}
            />
          }
        >
          <NestedListItemLeadingContent>
            <NestedListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" />
          </NestedListItemLeadingContent>
        </NestedListItem>
      </NestedListView>
    </ReactRouterWrapper>
  ),
}

export const TitleWithChildren: Story = {
  args: {
    href: '#',
  },
  render: ({...args}: NestedListItemTitleWithArgs) => {
    return (
      <NestedListView title="title storybook">
        <SampleListItem {...args} title="A title can have child elements">
          <span>I am a child of the title</span>
        </SampleListItem>
      </NestedListView>
    )
  },
}
