import type {Meta} from '@storybook/react'
import {IssueTypeToken, type IssueTypeTokenProps} from './IssueTypeToken'

const meta = {
  title: 'Recipes/IssueTypeToken',
  component: IssueTypeToken,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof IssueTypeToken>

export default meta

const defaultArgs: Partial<IssueTypeTokenProps> = {
  name: 'Bug',
  color: 'RED',
  href: '#',
}

export const BugToken = {
  args: {
    ...defaultArgs,
  },
  render: (args: IssueTypeTokenProps) => {
    const getTooltipText = (isTruncated: boolean) => (isTruncated ? args.name : '')
    return <IssueTypeToken {...args} getTooltipText={getTooltipText} />
  },
}

export const TokenWithLongName = {
  args: {
    ...defaultArgs,
    name: 'This is a very long issue type name that will be truncated',
    color: 'GREEN',
  },
  render: (args: IssueTypeTokenProps) => {
    const getTooltipText = (isTruncated: boolean) => {
      return isTruncated ? args.name : ''
    }
    return <IssueTypeToken {...args} getTooltipText={getTooltipText} />
  },
}

export const TokenWithHoverDescription = {
  args: {
    ...defaultArgs,
  },
  render: (args: IssueTypeTokenProps) => {
    const getTooltipText = (isTruncated: boolean) => {
      return isTruncated ? args.name : 'A bug is a problem that needs to be fixed'
    }
    return <IssueTypeToken {...args} getTooltipText={getTooltipText} />
  },
}
