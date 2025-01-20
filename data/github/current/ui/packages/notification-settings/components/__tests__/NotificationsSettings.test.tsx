import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import NotificationsSettings from '../NotificationsSettings'
import type {Sections} from '../../components/State'

const saveData = (section: Sections, formData: FormData) => {
  return formData
}

const settings = (
  <NotificationsSettings
    autoSubscribeRepositories={true}
    autoSubscribeTeams={false}
    emails={[]}
    defaultEmail={''}
    saveData={saveData}
  />
)

describe('NotificationsSettings', () => {
  test('renders the Notifications Settings default email section)', () => {
    render(settings)

    expect(screen.getByText('Default notifications email')).toBeVisible()
  })

  test('renders the Notifications Settings email content)', () => {
    render(
      <NotificationsSettings
        autoSubscribeRepositories={false}
        autoSubscribeTeams={false}
        emails={['first@email.com', 'second@email.com']}
        defaultEmail={'second@email.com'}
        saveData={saveData}
      />,
    )

    expect(screen.getByText('second@email.com')).toBeVisible()
  })

  test('renders the Notifications Settings toggles titles)', () => {
    render(settings)

    expect(screen.getByText('Automatically watch repositories')).toBeVisible()
    expect(screen.getByText('Automatically watch teams')).toBeVisible()
  })

  test('renders the Notifications Settings toggles subtitles)', () => {
    render(settings)

    expect(
      screen.getByText("When you're given push access to a repository, automatically receive notifications for it."),
    ).toBeVisible()
    expect(
      screen.getByText(
        'Anytime you join a new team, you will automatically be subscribed to updates and receive notification when that team is @mentioned.',
      ),
    ).toBeVisible()
  })

  test('renders the Notifications Settings email selector button)', () => {
    render(settings)

    expect(screen.getAllByRole('button')[0]).toBeInTheDocument()
  })

  test('renders the Notifications Settings custom routing button)', () => {
    render(settings)

    expect(screen.getByRole('link', {name: 'Custom routing'})).toBeInTheDocument()
  })

  test('renders the Notifications Settings toggles)', () => {
    render(settings)

    expect(screen.getByRole('button', {name: 'Automatically watch repositories'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Automatically watch teams'})).toBeInTheDocument()
  })

  test('renders the toggles content)', () => {
    render(
      <NotificationsSettings
        autoSubscribeRepositories={true}
        autoSubscribeTeams={false}
        emails={[]}
        defaultEmail={''}
        saveData={saveData}
      />,
    )

    expect(screen.getByRole('button', {name: 'Automatically watch repositories'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Automatically watch teams'})).toBeInTheDocument()
  })

  test('by default the email is editable', () => {
    render(
      <NotificationsSettings
        autoSubscribeRepositories={true}
        autoSubscribeTeams={false}
        saveData={saveData}
        emails={['foobar@example.com']}
        defaultEmail={'foobar@example.com'}
      />,
    )

    // there are multiple buttons on the page, we want the one with email
    const button = screen.getByRole('button', {name: 'foobar@example.com'})
    expect(button).not.toHaveAttribute('disabled')
  })

  test('can toggle email readonly props', () => {
    render(
      <NotificationsSettings
        autoSubscribeRepositories={true}
        autoSubscribeTeams={false}
        saveData={saveData}
        // Mock EMU like options
        emails={['foobar@example.com']}
        defaultEmail={'foobar+stub@example.com'}
        isEmailReadonly={true}
      />,
    )

    // there are multiple buttons on the page, we want the one with email
    const button = screen.getByRole('button', {name: 'foobar+stub@example.com'})
    expect(button).toHaveAttribute('disabled')
  })

  test('removes custom routing button if email is readonly', () => {
    render(
      <NotificationsSettings
        autoSubscribeRepositories={true}
        autoSubscribeTeams={false}
        saveData={saveData}
        // Mock EMU like options
        emails={['foobar@example.com']}
        defaultEmail={'foobar+stub@example.com'}
        isEmailReadonly={true}
      />,
    )

    expect(screen.queryByText('Custom routing')).not.toBeInTheDocument()
  })
})
