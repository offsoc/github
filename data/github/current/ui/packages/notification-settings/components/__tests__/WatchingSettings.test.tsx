import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import WatchingSettings from '../WatchingSettings'
import State, {SavingStatus, Sections} from '../../components/State'

const saveData = (section: Sections, formData: FormData) => {
  return formData
}

const successState = () => {
  return <State status={SavingStatus.SUCCESS} />
}

const watchingSettings = (
  <WatchingSettings
    subscribedSettings={[]}
    participatingSettings={[]}
    emailNotificationPreferences={{}}
    saveData={saveData}
    renderState={successState}
    watchingUrl={'/watching'}
  />
)

describe('WatchingSettings', () => {
  test('renders the watching table titles', () => {
    render(watchingSettings)

    expect(screen.getByText('Watching')).toBeVisible()
    expect(screen.getByText('Participating, @mentions and custom')).toBeVisible()
    expect(screen.getByText('Ignored repositories')).toBeVisible()
  })

  test('renders the watching table subtitles', () => {
    render(watchingSettings)

    expect(
      screen.getByText("Notifications for all repositories, teams, or conversations you're watching."),
    ).toBeVisible()
    expect(
      screen.getByText(
        'Notifications for the conversations you are participating in, or if someone cites you with an @mention. Also for all activity when subscribed to specific events.',
      ),
    ).toBeVisible()
    expect(screen.getByText("You'll never be notified.")).toBeVisible()
  })

  test('renders the watching table subtitles with the links', () => {
    render(watchingSettings)

    expect(screen.getAllByRole('link', {name: 'View watched repositories'})[0]).toHaveAttribute('href', '/watching')
    expect(screen.getAllByRole('link', {name: 'View ignored repositories'})[0]).toHaveAttribute('href', '/watching')
  })

  test('renders the watching table buttons', () => {
    render(watchingSettings)

    expect(screen.queryAllByText("Don't notify").length).toEqual(2)
  })

  test('renders the watching dropdown content for subscribed settings)', () => {
    const {container} = render(
      <WatchingSettings
        subscribedSettings={['email', 'web']}
        participatingSettings={[]}
        emailNotificationPreferences={{}}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )
    expect(container).toHaveTextContent('Notify me: on GitHub, Email')
  })

  test('renders email preference table buttons if email is selected in participating settings', () => {
    render(
      <WatchingSettings
        subscribedSettings={[]}
        participatingSettings={['email']}
        emailNotificationPreferences={{
          pullRequestReview: true,
        }}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )

    expect(screen.queryAllByText('Reviews').length).toEqual(1)
  })

  test('renders email preference table buttons if email is selected in subscribed settings', () => {
    render(
      <WatchingSettings
        subscribedSettings={['email']}
        participatingSettings={[]}
        emailNotificationPreferences={{
          pullRequestReview: true,
        }}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )

    expect(screen.queryAllByText('Reviews').length).toEqual(1)
  })

  test('renders email preference dropdown default value as "No additional events"', () => {
    render(
      <WatchingSettings
        subscribedSettings={['email']}
        participatingSettings={[]}
        emailNotificationPreferences={{
          pullRequestReview: false,
          pullRequestPush: false,
          commentEmail: false,
          ownViaEmail: false,
        }}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )

    expect(screen.queryAllByText('No additional events').length).toEqual(1)
  })

  test('renders the watching dropdown content for subscribed settings', () => {
    expect(() =>
      render(
        <WatchingSettings
          subscribedSettings={['email', 'web']}
          participatingSettings={[]}
          emailNotificationPreferences={{}}
          saveData={saveData}
          renderState={successState}
          watchingUrl={''}
        />,
      ),
    ).not.toThrow()
  })

  test('renders the watching dropdown content for all settings', () => {
    const {container} = render(
      <WatchingSettings
        subscribedSettings={['web']}
        participatingSettings={['email', 'web']}
        emailNotificationPreferences={{}}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )

    expect(container).toHaveTextContent('Notify me: on GitHub, Email')
    expect(container).toHaveTextContent('Notify me: on GitHub')
  })

  test('renders the watching dropdown content for email preferences', () => {
    render(
      <WatchingSettings
        subscribedSettings={['email']}
        participatingSettings={['email']}
        emailNotificationPreferences={{
          pullRequestReview: true,
          pullRequestPush: true,
          commentEmail: true,
          ownViaEmail: true,
        }}
        saveData={saveData}
        renderState={successState}
        watchingUrl={''}
      />,
    )

    expect(screen.queryAllByText('Reviews, Pushes, Comments, My own updates').length).toEqual(1)
  })

  test('triggers the saveData correctly', async () => {
    const calls: string[] = []
    const saveDataCallback = (section: Sections, formData: FormData) => {
      calls.push('called')
      return formData
    }
    const {user} = render(
      <WatchingSettings
        subscribedSettings={['web']}
        participatingSettings={['email', 'web']}
        emailNotificationPreferences={{
          pullRequestReview: true,
          pullRequestPush: true,
          commentEmail: true,
          ownViaEmail: true,
        }}
        saveData={saveDataCallback}
        renderState={successState}
        watchingUrl={''}
      />,
    )
    await user.click(screen.getByText('on GitHub'))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByText('Email'))

    // Ensure that we only call save when the save button is clicked
    expect(calls.length).toEqual(0)

    // Click the save button for setting
    await user.click(within(dialog).getByText('Save'))

    expect(calls.length).toEqual(1)
    expect(calls[0]).toBe('called')
  })

  test('triggers the saveData correctly when selecting an email preference', async () => {
    const call: {section: string; formData: FormData; saved: boolean} = {
      section: '',
      formData: new FormData(),
      saved: false,
    }
    const saveDataCallback = (section: Sections, formData: FormData) => {
      call['section'] = section
      call['formData'] = formData
      call['saved'] = true
      return formData
    }
    const {user} = render(
      <WatchingSettings
        subscribedSettings={['web']}
        participatingSettings={['email', 'web']}
        emailNotificationPreferences={{
          pullRequestReview: true,
          pullRequestPush: false,
          commentEmail: false,
          ownViaEmail: false,
        }}
        saveData={saveDataCallback}
        renderState={successState}
        watchingUrl={''}
      />,
    )
    await user.click(screen.getByText('Reviews'))
    await user.click(screen.getByText('Pull Request reviews'))
    await user.click(screen.getByText('Comments on Issues and Pull Requests'))

    // Click the save button for setting
    expect(call.saved).toBeFalsy()

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByText('Save'))

    expect(call.saved).toBeTruthy()
    expect(call.section).toEqual(Sections.Watching)
    expect(call.formData).not.toBeNull()
    expect(call.formData.get('notify_pull_request_review_email')).toEqual('0')
    expect(call.formData.get('notify_pull_request_push_email')).toEqual('0')
    expect(call.formData.get('notify_comment_email')).toEqual('1')
    expect(call.formData.get('notify_own_via_email')).toEqual('0')
  })

  test('renders the state section with error', () => {
    const errorState = () => {
      return <State status={SavingStatus.ERROR} />
    }
    render(
      <WatchingSettings
        subscribedSettings={['email', 'web']}
        participatingSettings={[]}
        emailNotificationPreferences={{}}
        saveData={saveData}
        renderState={errorState}
        watchingUrl={''}
      />,
    )

    expect(screen.getByText('Oops, something went wrong.')).toBeVisible()
  })
})
