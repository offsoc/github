import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'

import {getCopilotChatProviderProps} from '../test-utils/mock-data'
import {CopilotChatProvider} from '../utils/CopilotChatContext'
import {Header, type HeaderProps} from './Header'

const meta = {
  title: 'Apps/Copilot/Header',
  component: Header,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof Header>

export default meta

const defaultArgs: HeaderProps = {
  view: 'thread',
  experimentsDialogRef: {current: null},
  showExperimentsDialog: false,
  setShowExperimentsDialog: () => {},
}

const Container = (props: {children: React.ReactNode}) => (
  <CopilotChatProvider {...getCopilotChatProviderProps()}>
    <Wrapper>
      <div>{props.children}</div>
    </Wrapper>
  </CopilotChatProvider>
)

export const Example = {
  args: {
    ...defaultArgs,
  },
  render: (args: HeaderProps) => {
    return (
      <Container>
        <Header {...args} />
      </Container>
    )
  },
}

export const ImmersiveExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: HeaderProps) => {
    return (
      <Container>
        <Header {...args} isImmersive={true} />
      </Container>
    )
  },
}

export const ListExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: HeaderProps) => {
    return (
      <Container>
        <Header {...args} view="list" />
      </Container>
    )
  },
}
