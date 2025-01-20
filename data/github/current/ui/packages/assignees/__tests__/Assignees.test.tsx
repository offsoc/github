import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {Assignees} from '../Assignees'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {AssigneePickerAssignee$data} from '@github-ui/item-picker/AssigneePicker.graphql'

test('renders the assignees section with current assignees', async () => {
  const assignee: AssigneePickerAssignee$data = {
    login: 'monalisa',
    name: 'Mona Lisa',
    id: mockRelayId(),
    avatarUrl: 'https://github.com/mona.png',
    ' $fragmentType': 'AssigneePickerAssignee',
  }
  render(<Assignees assignees={[assignee]} />)
  expect(screen.getByText('monalisa')).toBeInTheDocument()
})
