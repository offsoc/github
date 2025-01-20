import type {Meta} from '@storybook/react'
import {ContributorFooter, type ContributorFooterProps} from './ContributorFooter'

const meta = {
  title: 'IssuesComponents/ContributorFooter',
  component: ContributorFooter,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    contributingFileUrl: {control: 'text', defaultValue: '/file-url'},
    securityPolicyUrl: {control: 'text', defaultValue: '/security-url'},
    codeOfConductFileUrl: {control: 'text', defaultValue: '/coc-url'},
  },
} satisfies Meta<typeof ContributorFooter>

export default meta

const defaultArgs: Partial<ContributorFooterProps> = {
  contributingFileUrl: '/file-url',
  securityPolicyUrl: '/security-url',
  codeOfConductFileUrl: '/coc-url',
}

export const ContributorFooterExample = {
  args: {
    ...defaultArgs,
  },
}
