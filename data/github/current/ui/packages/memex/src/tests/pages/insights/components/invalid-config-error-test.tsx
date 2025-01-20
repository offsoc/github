import {ThemeProvider} from '@primer/react'
import {render, screen} from '@testing-library/react'

import {InvalidConfigError} from '../../../../client/pages/insights/components/error-messages/invalid-config-error'
import {useInsightsConfigurationPane} from '../../../../client/pages/insights/hooks/use-insights-configuration-pane'
import {createMockEnvironment} from '../../../create-mock-environment'
import {asMockHook} from '../../../mocks/stub-utilities'

jest.mock('../../../../client/pages/insights/hooks/use-insights-configuration-pane')

const getWrapper = () => {
  createMockEnvironment()
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <ThemeProvider>{children}</ThemeProvider>
  )
  return wrapper
}

describe('InvalidConfigError', () => {
  beforeEach(() => {
    asMockHook(useInsightsConfigurationPane).mockReturnValue({
      openPane: jest.fn(),
    })
  })
  it('prompts the user to update or delete the invalid chart', () => {
    const wrapper = getWrapper()
    render(<InvalidConfigError />, {wrapper})

    const ctaText = screen.getByText(
      'A required field may have been deleted. Update the configuration or delete the chart.',
    )
    expect(ctaText).toBeInTheDocument()
    const updateConfigButton = screen.getByText('Update configuration')
    expect(updateConfigButton).toBeInTheDocument()
  })
})
