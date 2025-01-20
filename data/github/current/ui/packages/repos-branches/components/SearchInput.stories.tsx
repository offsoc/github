import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import SearchInput from './SearchInput'
import {getOverviewRoutePayload} from '../test-utils/mock-data'
import {BRANCH_PAGES} from '../constants'

const meta: Meta<typeof SearchInput> = {
  title: 'Repo Branches/Components/SearchInput',
  component: SearchInput,
  argTypes: {
    selectedPage: {
      description: 'The currently selected page in the branches page',
      options: BRANCH_PAGES.map(({type}) => type),
      defaultValue: 'all',
    },
    onChange: {action: 'searched'},
  },
  args: {
    selectedPage: 'all',
  },
}

export const Default: StoryObj<typeof SearchInput> = {
  render: args => {
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <SearchInput {...args} />
      </Wrapper>
    )
  },
}

export default meta
