import {render, screen} from '@testing-library/react'
import {RunnerPublicIpCheckbox} from '../RunnerPublicIpCheckbox'

describe('RunnerPublicIpCheckbox', () => {
  test('renders correctly for an empty form', () => {
    render(
      <RunnerPublicIpCheckbox
        checked={false}
        onChange={jest.fn()}
        isPublicIpAllowed={true}
        usedIpCount={0}
        totalIpCount={10}
      />,
    )

    const publicIpCheckbox = screen.getByTestId('runner-public-ip-checkbox')
    expect(publicIpCheckbox).not.toBeChecked()
    expect(publicIpCheckbox).not.toBeDisabled()
  })

  test('checkbox is disabled when public ip is not allowed', () => {
    render(
      <RunnerPublicIpCheckbox
        checked={false}
        onChange={jest.fn()}
        isPublicIpAllowed={false}
        usedIpCount={0}
        totalIpCount={10}
      />,
    )
    expect(screen.getByTestId('runner-public-ip-checkbox')).toBeDisabled()
  })

  test('checkbox is disabled when public ip limit is reached', () => {
    render(
      <RunnerPublicIpCheckbox
        checked={false}
        onChange={jest.fn()}
        isPublicIpAllowed={true}
        usedIpCount={10}
        totalIpCount={10}
      />,
    )
    expect(screen.getByTestId('runner-public-ip-checkbox')).toBeDisabled()
  })

  test('checkbox is enabled when public ip limit is reached but runner already has a public ip', () => {
    render(
      <RunnerPublicIpCheckbox
        checked={true}
        onChange={jest.fn()}
        isPublicIpAllowed={true}
        usedIpCount={10}
        totalIpCount={10}
        runnerHasPublicIp={true}
      />,
    )
    expect(screen.getByTestId('runner-public-ip-checkbox')).not.toBeDisabled()
  })
})
