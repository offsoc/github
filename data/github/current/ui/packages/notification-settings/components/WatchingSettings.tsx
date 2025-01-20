import {useState} from 'react'
import {Box, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import Table from './Table'
import Header from './table/Header'
import Row, {type RowProps} from './table/Row'
import MultiSelect from './dropdown/MultipleSelect'
import {
  emailNotificationPreferenceDropdownOptions,
  emailNotificationPreferenceDisplayOptions,
  watchingDropdownOptions,
  watchingDisplayOptions,
  defaultOption,
  defaultEmailNotificationPreferenceOption,
  defaultPrefix,
  getSelectedOptionsAndVariants,
} from '../helpers/selectors'
import {Sections} from '../components/State'

const watchingRow: RowProps = {
  title: 'Watching',
}

const participatingRow: RowProps = {
  title: 'Participating, @mentions and custom',
  subtitle:
    'Notifications for the conversations you are participating in, or if someone cites you with an @mention. Also for all activity when subscribed to specific events.',
}

const emailNotificationPreferencesRow: RowProps = {
  title: 'Customize email updates',
  subtitle: "Choose which additional events you'll receive emails for when participating or watching.",
}

const ignoredRow: RowProps = {
  title: 'Ignored repositories',
  separator: false,
}

function EmailPreferencesSelect(props: {selected: string[]; onSaveCallback: {(selectedOptions: string[]): void}}) {
  const {selected, onSaveCallback} = props

  return (
    <MultiSelect
      title="Select events"
      listOptions={emailNotificationPreferenceDropdownOptions}
      menuButtonOptions={emailNotificationPreferenceDisplayOptions}
      defaultMenuButtonOption={defaultEmailNotificationPreferenceOption}
      selectedListOptions={selected}
      onSaveCallback={onSaveCallback}
      width="medium"
    />
  )
}

function Select(props: {selected: string[]; onSaveCallback: {(selectedOptions: string[]): void}}) {
  const {selected, onSaveCallback} = props
  return (
    <MultiSelect
      title="Select notification channels"
      menuButtonPrefix={defaultPrefix}
      defaultMenuButtonOption={defaultOption}
      menuButtonOptions={watchingDisplayOptions}
      listOptions={watchingDropdownOptions}
      selectedListOptions={selected}
      onSaveCallback={onSaveCallback}
    />
  )
}

interface Props {
  sx?: BetterSystemStyleObject
  subscribedSettings: string[]
  participatingSettings: string[]
  saveData: (section: Sections, formData: FormData) => void
  emailNotificationPreferences: {[key: string]: boolean}
  watchingUrl: string
  renderState: (section: Sections) => void
}

function WatchingSettings(props: Props) {
  const watchingDescription = (
    <>
      <span>Notifications for all repositories, teams, or conversations you&apos;re watching.&nbsp;</span>
      <Link inline href={props.watchingUrl}>
        View watched repositories
      </Link>
      .
    </>
  )
  const ignoredDescription = (
    <>
      <span>You&apos;ll never be notified.&nbsp;</span>
      <Link inline href={props.watchingUrl}>
        View ignored repositories
      </Link>
      .
    </>
  )
  const {sx, emailNotificationPreferences} = props

  const [subscribedSettings, setSubscribedSettings] = useState<string[]>(props.subscribedSettings || [])
  const [participatingSettings, setParticipatingSettings] = useState<string[]>(props.participatingSettings || [])

  const [selectedEmailPreferenceOptions] = getSelectedOptionsAndVariants(
    emailNotificationPreferences,
    emailNotificationPreferenceDropdownOptions,
    {},
  )
  const [selectedEmailDeliveryPreferences, setSelectedEmailDeliveryPreferences] = useState<string[]>(
    selectedEmailPreferenceOptions || [],
  )

  // Callbacks called by multiple select component
  const saveSetting = (setting: string, selected: string[]) => {
    const formData = new FormData()
    formData.append(`${setting}[web]`, selected.includes('web') ? '1' : '0')
    formData.append(`${setting}[email]`, selected.includes('email') ? '1' : '0')
    props.saveData(Sections.Watching, formData)
  }

  // Subscribed
  const onSaveSubscribedCallback = (onSaveSelectedOptions: string[]) => {
    saveSetting('subscribed_settings', onSaveSelectedOptions)
    setSubscribedSettings(onSaveSelectedOptions)
  }

  // Participating
  const onSaveParticipatingCallback = (onSaveSelectedOptions: string[]) => {
    saveSetting('participating_settings', onSaveSelectedOptions)
    setParticipatingSettings(onSaveSelectedOptions)
  }

  // Email Notification Preferences
  const onSaveEmailNotificationPreferencesCallback = (onSaveSelectedOptions: string[]) => {
    const formData = new FormData()
    formData.append('notify_own_via_email', onSaveSelectedOptions.includes('ownViaEmail') ? '1' : '0')
    formData.append('notify_comment_email', onSaveSelectedOptions.includes('commentEmail') ? '1' : '0')
    formData.append('notify_pull_request_review_email', onSaveSelectedOptions.includes('pullRequestReview') ? '1' : '0')
    formData.append('notify_pull_request_push_email', onSaveSelectedOptions.includes('pullRequestPush') ? '1' : '0')
    props.saveData(Sections.Watching, formData)
    setSelectedEmailDeliveryPreferences(onSaveSelectedOptions)
  }

  return (
    <Box sx={sx}>
      <Table>
        <Header style={{display: 'flex', alignItems: 'center'}}>
          Subscriptions
          {props.renderState(Sections.Watching)}
        </Header>
        <Row
          {...watchingRow}
          action={<Select selected={subscribedSettings} onSaveCallback={onSaveSubscribedCallback} />}
          subtitle={watchingDescription}
        />
        <Row
          {...participatingRow}
          action={<Select selected={participatingSettings} onSaveCallback={onSaveParticipatingCallback} />}
        />
        {(subscribedSettings.includes('email') || participatingSettings.includes('email')) && (
          <Row
            {...emailNotificationPreferencesRow}
            action={
              <EmailPreferencesSelect
                selected={selectedEmailDeliveryPreferences}
                onSaveCallback={onSaveEmailNotificationPreferencesCallback}
              />
            }
          />
        )}
        <Row {...ignoredRow} subtitle={ignoredDescription} />
      </Table>
    </Box>
  )
}

export default WatchingSettings
