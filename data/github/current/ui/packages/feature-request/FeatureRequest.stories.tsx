import type {Meta} from '@storybook/react'
import {FeatureRequest, type FeatureRequestProps} from './FeatureRequest'

const meta = {
  title: 'Recipes/GrowthComponents/FeatureRequest',
  component: FeatureRequest,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    featureRequestInfo: {
      showFeatureRequest: true,
      alreadyRequested: false,
      dismissed: false,
      isEnterpriseRequest: false,
      featureName: 'protected_branches',
      requestPath: {control: 'text', defaultValue: '/orgs/free-org/member_feature_request'},
    },
  },
} satisfies Meta<typeof FeatureRequest>

export default meta

const defaultArgs: Partial<FeatureRequestProps> = {
  featureRequestInfo: {
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    isEnterpriseRequest: false,
    featureName: 'protected_branches',
    requestPath: '/',
  },
  learnMorePath: 'https://docs.github.com/',
  requestMessage: 'Ask your admin for access to copilot.',
}

export const FeatureRequestExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: FeatureRequestProps) => <FeatureRequest {...args} />,
}
