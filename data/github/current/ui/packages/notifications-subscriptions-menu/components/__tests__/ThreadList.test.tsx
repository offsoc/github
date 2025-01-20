import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import ThreadList from '../ThreadList'

const list = (
  <ThreadList
    subscribableThreadTypes={[
      {name: 'Issue', enabled: true, subscribed: true},
      {name: 'Discussion', enabled: true, subscribed: true},
    ]}
    showLabelSubscriptions={false}
    repoLabels={[{text: 'label'}]}
    cancelMenuCallback={() => {}}
    appliedThreads={['Issue']}
    appliedLabels={[{text: 'label'}]}
    subscribedThreads={['Issue']}
    applyThreads={() => {}}
    saveThreads={() => Promise.resolve()}
    showError={false}
  />
)

describe('ThreadList', () => {
  test('renders the thread list items titles', () => {
    render(list)

    expect(screen.getAllByRole('checkbox', {name: 'Issues'})[0]).toBeVisible()
    expect(screen.getAllByRole('checkbox', {name: 'Discussions'})[0]).toBeVisible()
  })

  test('renders the thread list items checkboxes', () => {
    render(list)

    const input = screen.getByRole('checkbox', {name: 'Issues'})
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  test('renders the footer options', () => {
    render(list)

    expect(screen.getByText('Apply')).toBeVisible()
    expect(screen.getByText('Cancel')).toBeVisible()
  })
})
