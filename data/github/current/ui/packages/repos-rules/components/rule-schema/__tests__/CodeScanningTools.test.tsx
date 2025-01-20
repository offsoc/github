import {render, type User} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {screen, act, within} from '@testing-library/react'
import {CodeScanningTools} from '../CodeScanningTools'

jest.useFakeTimers()

const renderComponent = ({...props}: Partial<Parameters<typeof CodeScanningTools>[0]> = {}) => {
  return render(
    <div id="__primerPortalRoot__">
      <CodeScanningTools
        rulesetId={1}
        sourceType="repository"
        value={[]}
        errors={[]}
        readOnly={false}
        onValueChange={jest.fn()}
        field={{
          name: 'code_scanning_tools',
          display_name: 'Alert thresholds',
          description:
            'Configure per-tool thresholds for alert severities which must be met before a pull request can be merged.',
          type: 'array',
          required: true,
          default_value: [{alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'}],
          content_type: 'object',
          content_object: {
            name: 'required_status_checks',
            fields: [
              {
                type: 'string',
                name: 'tool',
                display_name: 'Limit to specific tools',
                description: 'The name of a code scanning tool',
                default_value: 'CodeQL',
                required: true,
              },
              {
                type: 'string',
                name: 'security_alerts',
                display_name: 'Security alerts',
                description: 'description',
                required: true,
                allowed_options: [
                  {value: 'none', display_name: 'None'},
                  {value: 'critical', display_name: 'Critical'},
                  {value: 'high_or_higher', display_name: 'High or higher'},
                  {value: 'medium_or_higher', display_name: 'Medium or higher'},
                  {value: 'all', display_name: 'All'},
                ],
              },
              {
                type: 'string',
                name: 'alerts',
                display_name: 'Alerts',
                description: 'description',
                required: true,
                allowed_options: [
                  {value: 'none', display_name: 'None'},
                  {value: 'errors', display_name: 'Errors'},
                  {value: 'errors_and_warnings', display_name: 'Errors and Warnings'},
                  {value: 'all', display_name: 'All'},
                ],
              },
            ],
          },
        }}
        {...props}
      />
    </div>,
  )
}

interface ToolResponse {
  value: string
}

const openToolSearch = async (user: User, response: ToolResponse[] = []) => {
  await user.click(screen.getByRole('button', {name: /^Add tool/}))

  await act(async () => {
    jest.runAllTimers()
    await mockFetch.resolvePendingRequest(`/security/code-scanning/tools.json`, response)
  })
}

const inputSearch = async (user: User, filter: string) => {
  await user.type(screen.getByPlaceholderText(/^Enter the name of a code scanning tool/), filter)
}

describe('CodeScanningTools', () => {
  test('should allow a user to add a tool without a suggestion', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })
    await openToolSearch(user)

    await inputSearch(user, 'New Tool')

    await user.click(await screen.findByRole('option', {selected: false, name: 'New Tool'}))

    expect(onValueChange).toHaveBeenCalledWith([{tool: 'New Tool', security_alerts: undefined, alerts: undefined}])
  })

  test('should allow filter and select without deslecting already selected tools', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      onValueChange,
    })
    await openToolSearch(user)

    await inputSearch(user, 'New Tool')

    await user.click(await screen.findByRole('option', {selected: false, name: 'New Tool'}))

    expect(onValueChange).toHaveBeenCalledWith([
      {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
      {tool: 'New Tool', security_alerts: undefined, alerts: undefined},
      {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
    ])
  })

  test('should render tools and levels from value', async () => {
    renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
    })

    const codeqlRow = within(await screen.findByTestId('li-CodeQL', undefined))
    const otherRow = within(await screen.findByTestId('li-Other', undefined))

    await codeqlRow.findByText('CodeQL')
    expect(await codeqlRow.findByTestId('security_alerts-value')).toHaveTextContent('High or higher')
    expect(await codeqlRow.findByTestId('alerts-value')).toHaveTextContent('Errors')

    await otherRow.findByText('Other')
    expect(await otherRow.findByTestId('security_alerts-value')).toHaveTextContent('Critical')
    expect(await otherRow.findByTestId('alerts-value')).toHaveTextContent('All')
  })

  test('existing and suggested tools are populated in tool search', async () => {
    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
    })

    await openToolSearch(user, [{value: 'CodeQL'}, {value: 'NotSelected'}])

    expect(await screen.findByRole('option', {selected: true, name: 'CodeQL'})).toBeVisible()
    expect(await screen.findByRole('option', {selected: true, name: 'Other'})).toBeVisible()
    expect(await screen.findByRole('option', {selected: false, name: 'NotSelected'})).toBeVisible()
  })

  test('clicking tool delete button removes tool', async () => {
    const onValueChange = jest.fn()
    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      onValueChange,
    })

    const codeqlRow = within(await screen.findByTestId('li-CodeQL', undefined))

    await user.click(await codeqlRow.findByTestId('delete-tool-button'))

    expect(onValueChange).toHaveBeenCalledWith([{alerts: 'all', security_alerts: 'critical', tool: 'Other'}])
  })

  test('deselecting tool from tool picker removes tool', async () => {
    const onValueChange = jest.fn()
    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      onValueChange,
    })

    await openToolSearch(user, [{value: 'CodeQL'}, {value: 'NotSelected'}])

    await user.click(await screen.findByRole('option', {selected: true, name: 'CodeQL'}))

    expect(onValueChange).toHaveBeenCalledWith([{alerts: 'all', security_alerts: 'critical', tool: 'Other'}])
  })

  test('readonly mode renders with no edit controls', async () => {
    renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      readOnly: true,
    })

    const buttons = screen.queryAllByRole('button')
    const options = screen.queryAllByRole('option')
    const radioButtons = screen.queryAllByRole('menuitemradio')

    // No buttons or options rendered
    expect(buttons).toEqual([])
    expect(options).toEqual([])
    expect(radioButtons).toEqual([])

    // Rows still displayed with correct values
    const codeqlRow = within(await screen.findByTestId('li-CodeQL', undefined))
    const otherRow = within(await screen.findByTestId('li-Other', undefined))

    await codeqlRow.findByText('CodeQL')
    expect(await codeqlRow.findByTestId('security_alerts-value')).toHaveTextContent('High or higher')
    expect(await codeqlRow.findByTestId('alerts-value')).toHaveTextContent('Errors')

    await otherRow.findByText('Other')
    expect(await otherRow.findByTestId('security_alerts-value')).toHaveTextContent('Critical')
    expect(await otherRow.findByTestId('alerts-value')).toHaveTextContent('All')
  })

  test('can adjust alert levels for tools', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      onValueChange,
    })

    const codeqlRow = within(await screen.findByTestId('li-CodeQL', undefined))
    expect(await codeqlRow.findByTestId('alerts-value')).toHaveTextContent('Errors')

    await user.click(await codeqlRow.findByTestId('alerts-button'))

    await act(async () => {
      jest.runAllTimers()
    })

    // options render in a portal so must find in screen
    await user.click(await screen.findByRole('menuitemradio', {name: 'Errors and Warnings'}))

    expect(onValueChange).toHaveBeenCalledWith([
      {alerts: 'errors_and_warnings', security_alerts: 'high_or_higher', tool: 'CodeQL'},
      {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
    ])
  })

  test('can adjust security_alert levels for tools', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      value: [
        {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
        {alerts: 'all', security_alerts: 'critical', tool: 'Other'},
      ],
      onValueChange,
    })

    const otherRow = within(await screen.findByTestId('li-Other', undefined))
    expect(await otherRow.findByTestId('security_alerts-value')).toHaveTextContent('Critical')

    await user.click(await otherRow.findByTestId('security_alerts-button'))

    await act(async () => {
      jest.runAllTimers()
    })

    // options render in a portal so must find in screen
    await user.click(await screen.findByRole('menuitemradio', {name: 'None'}))

    expect(onValueChange).toHaveBeenCalledWith([
      {alerts: 'errors', security_alerts: 'high_or_higher', tool: 'CodeQL'},
      {alerts: 'all', security_alerts: 'none', tool: 'Other'},
    ])
  })
})
