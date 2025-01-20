import {fireEvent, screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RunnerGroupSelector} from '../RunnerGroupSelector'
import {type RunnerGroup, RunnerGroupVisibility} from '../../../../types/runner'

const defaultGroup: RunnerGroup = {
  id: 1,
  name: 'Default',
  visibility: RunnerGroupVisibility.All,
  allowPublic: false,
  selectedTargets: [],
  precreated: true,
}
const customGroup: RunnerGroup = {
  id: 2,
  name: 'Linux runners',
  visibility: RunnerGroupVisibility.Selected,
  allowPublic: true,
  selectedTargets: [{}],
  precreated: false,
}

describe('RunnerGroupSelector', () => {
  test('renders with default group selected', async () => {
    const availableGroups: RunnerGroup[] = [defaultGroup, customGroup]
    const onChange = jest.fn()
    const value = defaultGroup.id

    render(<RunnerGroupSelector groups={availableGroups} value={value} setValue={onChange} />)

    const runnerGroupSelectorElement = screen.getByTestId('runner-group-selector')
    expect(runnerGroupSelectorElement).toHaveTextContent(defaultGroup.name)
    fireEvent.click(runnerGroupSelectorElement)

    const runnerGroupOptionsPanel = screen.getByRole('dialog')
    const runnerGroupOptions = within(runnerGroupOptionsPanel).getAllByRole('option')
    expect(runnerGroupOptions[0]).toHaveAttribute('aria-selected', 'true')
  })

  test('renders with custom group selected', async () => {
    const availableGroups: RunnerGroup[] = [defaultGroup, customGroup]
    const onChange = jest.fn()
    const value = customGroup.id

    render(<RunnerGroupSelector groups={availableGroups} value={value} setValue={onChange} />)

    const runnerGroupSelectorElement = screen.getByTestId('runner-group-selector')
    expect(runnerGroupSelectorElement).toHaveTextContent(customGroup.name)
    fireEvent.click(runnerGroupSelectorElement)

    const runnerGroupOptionsPanel = screen.getByRole('dialog')
    const runnerGroupOptions = within(runnerGroupOptionsPanel).getAllByRole('option')
    expect(runnerGroupOptions[1]).toHaveAttribute('aria-selected', 'true')
  })

  test('renders group description', async () => {
    const availableGroups: RunnerGroup[] = [defaultGroup, customGroup]
    const onChange = jest.fn()
    const value = customGroup.id

    render(<RunnerGroupSelector groups={availableGroups} value={value} setValue={onChange} />)

    const runnerGroupSelectorElement = screen.getByTestId('runner-group-selector')
    expect(runnerGroupSelectorElement).toHaveTextContent(customGroup.name)
    fireEvent.click(runnerGroupSelectorElement)

    const runnerGroupOptionsPanel = screen.getByRole('dialog')
    const runnerGroupOptions = within(runnerGroupOptionsPanel).getAllByRole('option')
    expect(runnerGroupOptions[0]).toHaveTextContent('All repositories, excluding public repositories')
    expect(runnerGroupOptions[1]).toHaveTextContent('Selected repositories (1), including public repositories')
  })

  test('renders error text when no groups', async () => {
    const availableGroups: RunnerGroup[] = []
    const onChange = jest.fn()
    const value = 0

    render(<RunnerGroupSelector groups={availableGroups} value={value} setValue={onChange} />)

    expect(screen.queryByTestId('runner-group-selector')).not.toBeInTheDocument()
    expect(screen.getByTestId('no-runner-groups-error')).toBeInTheDocument()
  })
})
