import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import SystemSettings from '../SystemSettings'
import State, {SavingStatus, type Sections} from '../../components/State'

const saveData = (section: Sections, formData: FormData) => {
  return formData
}

const successState = () => {
  return <State status={SavingStatus.SUCCESS} />
}

const systemSettings = (
  <SystemSettings
    continuousIntegration={{}}
    vulnerability={{}}
    deployKeyAlert={[]}
    vulnerabilitySubscription={'daily'}
    saveData={saveData}
    renderState={successState}
    actionsUrl={'/features/actions'}
    dependabotHelpUrl={'/help/dependabot'}
  />
)

describe('SystemSettings', () => {
  test('renders the system table header', () => {
    render(systemSettings)

    expect(screen.getByText('System')).toBeVisible()
    expect(screen.getAllByRole('heading', {level: 2})[0]).toBeInTheDocument()
  })

  test('renders the System table titles', () => {
    render(systemSettings)

    expect(screen.getByText('Actions')).toBeVisible()
    expect(screen.getByText('Dependabot alerts: New vulnerabilities')).toBeVisible()
    expect(screen.getByText("'Deploy key' alert email")).toBeVisible()
  })

  test('renders the System table subtitles', () => {
    render(systemSettings)

    expect(
      screen.getByText(
        'When you are given admin permissions to an organization, automatically receive notifications when a new deploy key is added.',
      ),
    ).toBeVisible()
  })

  test('renders the System table subtitles with the links', () => {
    render(systemSettings)

    expect(screen.getAllByRole('link', {name: 'GitHub Actions'})[0]).toHaveAttribute('href', '/features/actions')
    expect(screen.getAllByRole('link', {name: 'Dependabot alerts'})[0]).toHaveAttribute('href', '/help/dependabot')
  })

  test('renders the System table buttons', () => {
    render(systemSettings)

    expect(screen.queryAllByText("Don't notify").length).toEqual(2)
  })

  test('renders the System table toggles', () => {
    render(systemSettings)

    expect(screen.getByLabelText(`'Deploy key' alert email`)).toHaveAttribute('aria-pressed', 'false')
  })

  test('renders the toggle content for deploy key alert)', () => {
    render(
      <SystemSettings
        deployKeyAlert={['email']}
        continuousIntegration={{}}
        vulnerability={{}}
        vulnerabilitySubscription={'daily'}
        saveData={saveData}
        renderState={successState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )

    expect(screen.getByLabelText(`'Deploy key' alert email`)).toHaveAttribute('aria-pressed', 'true')
  })

  test('renders the dropdown content for continuousIntegration', () => {
    const {container} = render(
      <SystemSettings
        continuousIntegration={{
          continuousIntegrationEmail: true,
          continuousIntegrationFailuresOnly: true,
          continuousIntegrationWeb: false,
        }}
        vulnerability={{}}
        deployKeyAlert={[]}
        vulnerabilitySubscription={'daily'}
        saveData={saveData}
        renderState={successState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )

    expect(container).toHaveTextContent('Notify me: Email. (Failed workflows only)')
  })

  test('renders the dropdown content for vulnerability', () => {
    const {container} = render(
      <SystemSettings
        continuousIntegration={{}}
        vulnerability={{vulnerabilityCli: true, vulnerabilityEmail: true}}
        deployKeyAlert={[]}
        vulnerabilitySubscription={'daily'}
        saveData={saveData}
        renderState={successState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )

    expect(container).toHaveTextContent('Notify me: Email, CLI')
  })

  test('renders the state section with success', () => {
    render(
      <SystemSettings
        continuousIntegration={{}}
        vulnerability={{vulnerabilityCli: true, vulnerabilityEmail: true}}
        deployKeyAlert={[]}
        vulnerabilitySubscription={'daily'}
        saveData={saveData}
        renderState={successState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )

    expect(screen.getByText('Saved')).toBeVisible()
  })

  test('renders the state section with error', () => {
    const errorState = () => {
      return <State status={SavingStatus.ERROR} />
    }
    render(
      <SystemSettings
        continuousIntegration={{}}
        vulnerability={{vulnerabilityCli: true, vulnerabilityEmail: true}}
        deployKeyAlert={[]}
        vulnerabilitySubscription={'daily'}
        saveData={saveData}
        renderState={errorState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )

    expect(screen.getByText('Oops, something went wrong.')).toBeVisible()
  })

  test('triggers the saveData correctly)', async () => {
    const calls: string[] = []
    const saveDataCallback = (section: Sections, formData: FormData) => {
      calls.push('called')
      return formData
    }
    const {user} = render(
      <SystemSettings
        continuousIntegration={{}}
        vulnerability={{vulnerabilityCli: true, vulnerabilityEmail: true}}
        deployKeyAlert={[]}
        vulnerabilitySubscription={'daily'}
        saveData={saveDataCallback}
        renderState={successState}
        actionsUrl={'/features/actions'}
        dependabotHelpUrl={'/help/dependabot'}
      />,
    )
    await user.click(screen.getByText('Email, CLI'))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByText('Email'))

    // Ensure that we only call save when the save button is clicked
    expect(calls.length).toEqual(0)

    // Click the save button for setting
    await user.click(within(dialog).getByText('Save'))

    expect(calls.length).toEqual(1)
    expect(calls[0]).toBe('called')
  })
})
