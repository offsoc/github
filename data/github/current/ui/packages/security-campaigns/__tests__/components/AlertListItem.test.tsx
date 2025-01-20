import {screen, within} from '@testing-library/react'
import {ListView} from '@github-ui/list-view'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {createSecurityCampaignAlert} from '../../test-utils/mock-data'
import {SecuritySeverity} from '../../types/security-campaign-alert'
import {AlertListItem, type AlertListItemProps} from '../../components/AlertListItem'

// A ListItem can only be rendered within a ListView, so we'll need to create a wrapper component
const Wrapper = ({children}: {children?: React.ReactNode}) => (
  <ListView isSelectable={true} title="">
    {children}
  </ListView>
)
const render = (props?: Partial<AlertListItemProps>) =>
  reactRender(<AlertListItem alert={alert} isSelected={false} onSelect={jest.fn()} {...props} />, {wrapper: Wrapper})

const alert = createSecurityCampaignAlert({
  number: 125,
  title: 'Code injection',
  securitySeverity: SecuritySeverity.Medium,
  truncatedPath: 'app/controllers/application_controller.r...',
  startLine: 27,
  createdAt: '2024-05-22T13:20:25.947Z',
})

it('renders', () => {
  render()
  const listItem = within(screen.getByRole('listitem'))
  expect(listItem.getByRole('heading')).toHaveTextContent('Code injection')
  expect(listItem.getByRole('link')).toHaveTextContent('Code injection')
  expect(listItem.getByRole('link')).toHaveAttribute('href', '/github/security-campaigns/security/code-scanning/125')
  expect(listItem.getByTestId('list-view-item-main-content')).toHaveTextContent(
    '#125 · detected by CodeQL May 22, 2024 in app/controllers/application_controller.r...:27',
  )
  expect(listItem.getByText('Status: Open.')).toBeInTheDocument()
})

it('renders the status for dismissed alerts', () => {
  render({alert: {...alert, isDismissed: true}})
  expect(screen.getByText('Status: Dismissed.')).toBeInTheDocument()
})

it('renders the status for fixed alerts', () => {
  render({alert: {...alert, isFixed: true}})
  expect(screen.getByText('Status: Fixed.')).toBeInTheDocument()
})

it('renders the status for dismissed and fixed alerts', () => {
  render({alert: {...alert, isDismissed: true, isFixed: true}})
  expect(screen.getByText('Status: Fixed.')).toBeInTheDocument()
})

it('renders the severity label for medium severity when the label should be shown', () => {
  render({showSeverityLabel: true})
  expect(screen.getByText('Medium')).toBeInTheDocument()
})

it('renders the severity label for critical severity when the label should be shown', () => {
  render({alert: {...alert, securitySeverity: SecuritySeverity.Critical}, showSeverityLabel: true})
  expect(screen.getByText('Critical')).toBeInTheDocument()
})

it('does not render the severity label for critical severity when the label should not be shown', () => {
  render({alert: {...alert, securitySeverity: SecuritySeverity.Critical}, showSeverityLabel: false})
  expect(screen.queryByText('Critical')).not.toBeInTheDocument()
})

it('does not render the autofix label when no suggested fix is available', () => {
  render({showSuggestedFixLabel: true})
  expect(screen.queryByText('Autofix')).not.toBeInTheDocument()
})

it('renders the autofix label when a suggested fix is available and the label should be shown', () => {
  render({alert: {...alert, hasSuggestedFix: true}, showSuggestedFixLabel: true})
  expect(screen.getByText('Autofix')).toBeInTheDocument()
})

it('does not render the autofix label when a suggested fix is available and the label should not be shown', () => {
  render({alert: {...alert, hasSuggestedFix: true}, showSuggestedFixLabel: false})
  expect(screen.queryByText('Autofix')).not.toBeInTheDocument()
})

it('fires given onSelect handler when checking checkbox', async () => {
  const onSelect = jest.fn()

  const {user} = render({isSelected: false, onSelect})

  expect(onSelect).not.toHaveBeenCalled()

  const checkbox = screen.getByRole('checkbox')

  await user.click(checkbox)

  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenCalledWith(true)
})
