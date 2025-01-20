import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import ApplyToButton from '../../components/SecurityConfiguration/ApplyToButton'
import type {OrganizationSecurityConfiguration} from '../../security-products-enablement-types'
import {getGitHubRecommendedConfiguration} from '../../test-utils/mock-data'

describe('ApplyToButton', () => {
  let ghr_config: OrganizationSecurityConfiguration

  beforeEach(function () {
    ghr_config = getGitHubRecommendedConfiguration()
  })

  const confirmConfigApplication = jest.fn()

  it('should render the button', () => {
    render(<ApplyToButton configuration={ghr_config} confirmConfigApplication={confirmConfigApplication} />)

    expect(screen.getByText('Apply to')).toBeInTheDocument()
  })

  it('should call confirmConfigApplication with correct parameters when "All repositories" is selected', async () => {
    const {user} = render(
      <ApplyToButton configuration={ghr_config} confirmConfigApplication={confirmConfigApplication} />,
    )

    await user.click(screen.getByText('Apply to'))
    await user.click(screen.getByText('All repositories'))

    expect(confirmConfigApplication).toHaveBeenCalledWith(ghr_config, true, true)
  })

  it('should call confirmConfigApplication with correct parameters when "All repositories without configurations" is selected', async () => {
    const {user} = render(
      <ApplyToButton configuration={ghr_config} confirmConfigApplication={confirmConfigApplication} />,
    )

    await user.click(screen.getByText('Apply to'))
    await user.click(screen.getByText('All repositories without configurations'))

    expect(confirmConfigApplication).toHaveBeenCalledWith(ghr_config, false, true)
  })
})
