import type {Meta, StoryObj} from '@storybook/react'
import {ScreenSizeProvider, useScreenSize} from '@github-ui/screen-size'
import {getBranches} from '../test-utils/mock-data'
import TruncatedBranchName from './TruncatedBranchName'

const branch = getBranches().slice(-1)[0]!

const meta: Meta<typeof TruncatedBranchName> = {
  title: 'Repo Branches/Components/TruncatedBranchName',
  component: TruncatedBranchName,
  args: {
    ...branch,
  },
}

export const Default: StoryObj<typeof TruncatedBranchName> = {
  render: args => {
    return (
      <ScreenSizeProvider>
        <ScreenSizeDebugText />
        <TruncatedBranchName {...branch} {...args} />
      </ScreenSizeProvider>
    )
  },
}

const ScreenSizeDebugText = () => {
  const {screenSize} = useScreenSize()
  return <p>Screen size (normalized): {screenSize}</p>
}

export default meta
