import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import type {DefaultSetupPayload} from '../routes/DefaultSetup'
import {DefaultSetup} from '../routes/DefaultSetup'
import {getDefaultSetupRoutePayload} from '../test-utils/mock-data'

test('renders a form', () => {
  const routePayload = getDefaultSetupRoutePayload()
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByTestId('default-setup-form')).toHaveAttribute('action', routePayload.formUrl)
})

test('marks selected languages as checked', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectedLanguages: ['javascript', 'python'],
  }
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.getByLabelText('Python')).toBeChecked()
  expect(screen.getByLabelText('Ruby')).not.toBeChecked()
})

test('includes checkbox for all selectable and selected languages', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectableLanguages: ['javascript', 'python', 'ruby'],
    selectedLanguages: ['javascript', 'go'],
  }
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.getByLabelText('Python')).not.toBeChecked()
  expect(screen.getByLabelText('Ruby')).not.toBeChecked()
  expect(screen.getByLabelText('Go')).toBeChecked()
})

test('includes selected languages in form data', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectableLanguages: ['javascript', 'python', 'ruby', 'go'],
    selectedLanguages: ['javascript', 'go'],
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.getByLabelText('Go')).toBeChecked()

  const form = screen.getByTestId<HTMLFormElement>('default-setup-form')
  const formData = new FormData(form)

  expect(formData.getAll('config[languages][]')).toEqual(['go', 'javascript'])
})

test('sorts languages', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectableLanguages: ['java-kotlin', 'javascript', 'python'],
    selectedLanguages: ['javascript'],
  }
  render(<DefaultSetup />, {routePayload})

  const languageLabels = screen.getAllByTestId('language-display-name')
  expect(languageLabels.length).toEqual(3)
  expect(languageLabels[0]).toHaveTextContent('Java / Kotlin *')
  expect(languageLabels[1]).toHaveTextContent('JavaScript / TypeScript')
  expect(languageLabels[2]).toHaveTextContent('Python')
})

test('labels high failure languages', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectableLanguages: ['java-kotlin', 'javascript-typescript', 'swift'],
    selectedLanguages: ['java-kotlin', 'javascript-typescript'],
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.getByLabelText('Java / Kotlin *')).toBeChecked()
  expect(screen.getByLabelText('Swift *Beta')).not.toBeChecked()
  expect(screen.getByText(/These languages may/)).toBeInTheDocument()
})

test('* explanation is not present when there are no high failure languages', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectableLanguages: ['javascript-typescript'],
    selectedLanguages: ['javascript-typescript'],
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.queryByText(/These languages may/)).not.toBeInTheDocument()
})

test('checkbox for swift is disabled and explanation extended if mac OS runner is not present', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    hasMacOsRunner: false,
    selectableLanguages: ['java-kotlin', 'javascript', 'swift'],
    selectedLanguages: ['javascript'],
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByLabelText('JavaScript / TypeScript')).toBeChecked()
  expect(screen.getByLabelText('Java / Kotlin *')).not.toBeChecked()
  expect(screen.getByLabelText('Swift *Beta')).toBeDisabled()
  expect(screen.getByText(/These languages may/)).toBeInTheDocument()
  expect(screen.getByText(/Swift requires/)).toBeInTheDocument()
})

test('marks selected query suite as checked', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectedQuerySuite: 'extended',
    recommendedQuerySuite: 'default',
  }
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByTestId('querySuiteActionMenuLabel').textContent).toEqual('Extended')
})

test('marks org-recommended query suite as recommended', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectedQuerySuite: 'extended',
    recommendedQuerySuite: 'extended',
  }
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByTestId('querySuiteActionMenuLabel').textContent).toEqual('Extended')
})

test('marks selected threat model as checked', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectedThreatModel: 'remote_local',
  }
  render(<DefaultSetup />, {routePayload})
  expect(screen.getByTestId('threatModelActionModelLabel').textContent).toEqual('Remote and local sources')
})

test('includes selected threat model in form data', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    selectedThreatModel: 'remote_local',
  }
  render(<DefaultSetup />, {routePayload})

  const form = screen.getByTestId<HTMLFormElement>('default-setup-form')
  const formData = new FormData(form)

  expect(formData.get('config[threat_model]')).toEqual('remote_local')
})

test('includes schedule information when present and active', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    isDefaultSetupEnabled: true,
    nextScheduledRunAt: '2014-04-01T16:30:00-08:00',
    isRepoActive: true,
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByText(/On a weekly schedule/)).toBeInTheDocument()
  expect(screen.getByText(/Next scan of/)).toBeInTheDocument()
})

test('not includes schedule information when not present', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    isDefaultSetupEnabled: true,
    nextScheduledRunAt: null,
    isRepoActive: true,
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByText(/On a weekly schedule/)).toBeInTheDocument()
  expect(screen.queryByText(/Next scan of/)).not.toBeInTheDocument()
})

test('includes schedule row when onboarding', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    isDefaultSetupEnabled: false,
    nextScheduledRunAt: null,
    isRepoActive: false,
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.getByText(/On a weekly schedule/)).toBeInTheDocument()
  expect(screen.queryByText(/Next scan of/)).not.toBeInTheDocument()
})

test('not includes schedule information when not active', () => {
  const routePayload: DefaultSetupPayload = {
    ...getDefaultSetupRoutePayload(),
    isDefaultSetupEnabled: true,
    nextScheduledRunAt: null,
    isRepoActive: false,
  }
  render(<DefaultSetup />, {routePayload})

  expect(screen.queryByText(/On a weekly schedule/)).not.toBeInTheDocument()
  expect(screen.queryByText(/Next scan of/)).not.toBeInTheDocument()
})
