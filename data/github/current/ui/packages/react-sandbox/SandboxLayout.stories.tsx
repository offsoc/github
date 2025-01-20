import type {Meta} from '@storybook/react'
import {SandboxLayout} from './SandboxLayout'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {Wrapper} from '@github-ui/react-core/test-utils'

const meta = {
  title: 'ReactSandbox/SandboxLayout',
  component: SandboxLayout,
} satisfies Meta<typeof SandboxLayout>

export default meta

export const ClientChildren = {
  render: () => {
    return (
      <Wrapper>
        <SandboxLayout>Children elements</SandboxLayout>
      </Wrapper>
    )
  },
}

export const ServerChildren = {
  render: () => {
    return (
      <Wrapper>
        <SandboxLayout serverChildren={'Children elements from server html' as SafeHTMLString} />
      </Wrapper>
    )
  },
}
