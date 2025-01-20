import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import BranchPagination from './BranchPagination'
import {getListRoutePayload} from '../test-utils/mock-data'

const meta: Meta<typeof BranchPagination> = {
  title: 'Repo Branches/Components/BranchPagination',
  component: BranchPagination,
}

export const HasMore: StoryObj<typeof BranchPagination> = {
  render() {
    const routePayload = getListRoutePayload()
    return (
      <Wrapper
        routePayload={{
          ...routePayload,
          current_page: 1,
          has_more: true,
        }}
      >
        <BranchPagination sx={{mt: 4}} />
      </Wrapper>
    )
  },
}

export const HasPrevious: StoryObj<typeof BranchPagination> = {
  render() {
    const routePayload = getListRoutePayload()
    return (
      <Wrapper
        routePayload={{
          ...routePayload,
          current_page: 2,
          has_more: false,
        }}
      >
        <BranchPagination sx={{mt: 4}} />
      </Wrapper>
    )
  },
}

export const BashBoth: StoryObj<typeof BranchPagination> = {
  render() {
    const routePayload = getListRoutePayload()
    return (
      <Wrapper
        routePayload={{
          ...routePayload,
          current_page: 2,
          has_more: true,
        }}
      >
        <BranchPagination sx={{mt: 4}} />
      </Wrapper>
    )
  },
}

export default meta
