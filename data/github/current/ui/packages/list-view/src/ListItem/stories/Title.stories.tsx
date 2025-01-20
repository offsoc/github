import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {EllipsisIcon, IssueOpenedIcon} from '@primer/octicons-react'
import {IconButton, Label} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import {type ReactNode, useState} from 'react'
import {Link, MemoryRouter, Route, Routes} from 'react-router-dom'

import {Variants} from '../../constants'
import {ListView} from '../../ListView/ListView'
import {generateLabels} from '../../ListView/stories/helpers'
import type {VariantType} from '../../ListView/VariantContext'
import {ListItemDescription} from '../Description'
import {ListItemLeadingContent} from '../LeadingContent'
import {ListItemLeadingVisual} from '../LeadingVisual'
import {ListItem} from '../ListItem'
import {ListItemMainContent} from '../MainContent'
import {ListItemTitle, type ListItemTitleProps} from '../Title'
import styles from './Title.stories.module.css'

type ListItemTitleWithArgs = ListItemTitleProps & {variant: VariantType}

const meta: Meta<ListItemTitleWithArgs> = {
  title: 'Recipes/ListView/ListItem/Title',
  component: ListItemTitle,
  argTypes: {
    variant: {
      description: 'Type of ListView variant. Controls the width and height of the list and its contents',
      options: Variants,
      control: 'radio',
    },
    onClick: {action: 'clicked'},
  },
}

export default meta
type Story = StoryObj<ListItemTitleWithArgs>
type SampleListItemProps = {title: SafeHTMLString | string} & Omit<ListItemTitleProps, 'value'>

const SampleListItem = ({title, children, ...titleProps}: SampleListItemProps) => (
  <ListItem
    title={
      <ListItemTitle value={title} {...titleProps}>
        {children}
      </ListItemTitle>
    }
  >
    <ListItemLeadingContent>
      <ListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" description="Open Issue" />
    </ListItemLeadingContent>
  </ListItem>
)

export const StaticTitle: Story = {
  args: {
    variant: 'compact',
  },
  render: ({variant, ...args}: ListItemTitleWithArgs) => (
    <ListView title="Static Title list" variant={variant}>
      <SampleListItem {...args} title="I am a non-clickable title!" />
    </ListView>
  ),
}

export const LinkTitle: Story = {
  args: {
    variant: 'compact',
    href: '#',
  },
  render: ({variant, ...args}: ListItemTitleWithArgs) => (
    <ListView title="Link Title list" variant={variant}>
      <SampleListItem {...args} onClick={e => e.preventDefault()} title="I am a clickable title!" />
    </ListView>
  ),
}

function Wrapper({children}: {children?: ReactNode}) {
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
    variant: 'compact',
    href: '#',
  },
  render: ({variant, ...args}: ListItemTitleWithArgs) => (
    <Wrapper>
      <ListView title="React Router Link Title list" variant={variant}>
        <ListItem
          title={
            <ListItemTitle
              {...args}
              value="I am a clickable title with soft navigation!: Cats"
              linkProps={{as: Link, to: '/cats'}}
            />
          }
        >
          <ListItemLeadingContent>
            <ListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" />
          </ListItemLeadingContent>
        </ListItem>
        <ListItem
          title={
            <ListItemTitle
              {...args}
              value="I am a clickable title with soft navigation!: Dogs"
              linkProps={{as: Link, to: '/dogs'}}
            />
          }
        >
          <ListItemLeadingContent>
            <ListItemLeadingVisual icon={IssueOpenedIcon} color="fg.muted" />
          </ListItemLeadingContent>
        </ListItem>
      </ListView>
    </Wrapper>
  ),
}

export const MarkdownLinkTitle: Story = {
  args: {
    variant: 'compact',
    href: '#',
  },
  render: ({variant, ...args}: ListItemTitleWithArgs) => (
    <ListView title="Markdown Link Title list" variant={variant}>
      <SampleListItem
        {...args}
        title=":heart: I love emojis in commits"
        markdownValue={
          // eslint-disable-next-line github/unescaped-html-literal
          '<g-emoji class="g-emoji" alias="heart" fallback-src="/images/icons/emoji/unicode/2764.png"><g-emoji class="g-emoji" alias="heart" fallback-src="/images/icons/emoji/unicode/2764.png">❤️</g-emoji></g-emoji>&nbsp;I love emojis in commits' as SafeHTMLString
        }
      />
      <SampleListItem
        {...args}
        title="Merge pull request #2 from repos/monalisa-patch"
        markdownValue={
          // eslint-disable-next-line github/unescaped-html-literal
          '<a href="/abc" class="color-fg-default">Merge pull request</a>&nbsp;<a data-hovercard-type="pull_request" href="#">#2</a>&nbsp;<a href="/abc" class="color-fg-default">from repos/monalisa-patch</a>' as SafeHTMLString
        }
      />
      <SampleListItem
        {...args}
        title="Adding new <svg /> component - also i can still respond to onClicks"
        markdownValue={'Adding new &lt;svg/&gt; - also i can still respond to onClicks' as SafeHTMLString}
        onClick={() => alert('hello there')}
      />
    </ListView>
  ),
}

const SampleCommitItem = (titleProps: ListItemTitleProps) => {
  const [showDescription, setShowDescription] = useState(false)
  const shortMessage = 'This is a very long title that showcases an length and longness of a title...'
  const bodyMessageHtml = '...and continues into the commit message body. \n\nThen we have a commit description 🔥'
  return (
    <ListItem
      title={
        <ListItemTitle {...titleProps} value={shortMessage} markdownValue={shortMessage as SafeHTMLString}>
          <IconButton
            size="small"
            icon={EllipsisIcon}
            className={styles.ellipsisButton}
            aria-label="Show description"
            variant="invisible"
            onClick={e => {
              e.preventDefault()
              setShowDescription(!showDescription)
            }}
          />
        </ListItemTitle>
      }
    >
      <ListItemMainContent>
        {showDescription && bodyMessageHtml && (
          <ListItemDescription>
            <SafeHTMLText html={bodyMessageHtml as SafeHTMLString} className="ws-pre-wrap" />
          </ListItemDescription>
        )}
      </ListItemMainContent>
    </ListItem>
  )
}

export const TitleWithChildren: Story = {
  args: {
    href: '#',
  },
  render: ({variant, ...args}: ListItemTitleWithArgs) => {
    return (
      <ListView title="Title with children list" variant={variant}>
        <SampleListItem {...args} title="A title can have child elements">
          {generateLabels(4).map(label => (
            <Label key={label.name}>{label.name}</Label>
          ))}
        </SampleListItem>
        <SampleCommitItem {...args} />
      </ListView>
    )
  },
}
