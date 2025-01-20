import type React from 'react'
import {useState, useId} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Box, Link} from '@primer/react'
import Table from './Table'
import Header from './table/Header'
import Row, {type RowProps} from './table/Row'
import MultipleSelect from './dropdown/MultipleSelect'
import SingleSelect from './dropdown/SingleSelect'
import ToggleBox from './ToggleBox'
import {
  defaultOption,
  defaultPrefix,
  actionsDropdownOptions,
  actionsDisplayOptions,
  actionsDropdownVariants,
  vulnerabilityDropdownOptions,
  vulnerabilityDisplayOptions,
  digestOptions,
  getSelectedOptionsAndVariants,
  actionsDisplayVariants,
} from '../helpers/selectors'
import {Sections} from '../components/State'

const actionsRow: RowProps = {
  title: 'Actions',
}

const dependabotAlertsRow: RowProps = {
  title: 'Dependabot alerts: New vulnerabilities',
  separator: false,
}

const emailWeeklyDigestRow: RowProps = {
  title: 'Email weekly digest',
  subtitle: 'Email a weekly summary summarizing alerts for up to 10 of your repositories.',
  sx: {pt: 0},
}

const deployKeyAlertRow: RowProps = {
  title: "'Deploy key' alert email",
  subtitle:
    'When you are given admin permissions to an organization, automatically receive notifications when a new deploy key is added.',
  separator: false,
}

function ActionsSelect(props: {
  selected: {[key: string]: boolean}
  saveData: (section: Sections, formData: FormData) => void
}) {
  const [selectedOptions, selectedVariants] = getSelectedOptionsAndVariants(
    props.selected,
    actionsDropdownOptions,
    actionsDropdownVariants,
  )
  const [continuousIntegrationSelectedOptions, setContinuousIntegrationSelectedOptions] = useState<string[]>(
    selectedOptions || [],
  )
  const [continuousIntegrationSelectedVariants, setContinuousIntegrationSelectedVariants] = useState<string[]>(
    selectedVariants || [],
  )

  const onSaveCallback = (onSaveSelectedOptions: string[], onSaveSelectedVariants: string[]) => {
    const newSelectedVariants = onSaveSelectedOptions.length > 0 ? onSaveSelectedVariants : []
    const formData = new FormData()
    formData.set('continuous_integration_web', onSaveSelectedOptions.includes('continuousIntegrationWeb') ? '1' : '0')
    formData.set(
      'continuous_integration_email',
      onSaveSelectedOptions.includes('continuousIntegrationEmail') ? '1' : '0',
    )
    formData.set(
      'continuous_integration_failures_only',
      newSelectedVariants.includes('continuousIntegrationFailuresOnly') ? '1' : '0',
    )
    props.saveData(Sections.System, formData)

    setContinuousIntegrationSelectedOptions(onSaveSelectedOptions)
    setContinuousIntegrationSelectedVariants(newSelectedVariants)
  }
  return (
    <MultipleSelect
      title="Select notification channels"
      menuButtonPrefix={defaultPrefix}
      defaultMenuButtonOption={defaultOption}
      menuButtonOptions={actionsDisplayOptions}
      menuButtonVariants={actionsDisplayVariants}
      listOptions={actionsDropdownOptions}
      listVariants={actionsDropdownVariants}
      selectedListOptions={continuousIntegrationSelectedOptions}
      selectedListVariants={continuousIntegrationSelectedVariants}
      onSaveCallback={onSaveCallback}
    />
  )
}

function VulnerabilitySelect(props: {
  selected: {[key: string]: boolean}
  saveData: (section: Sections, formData: FormData) => void
}) {
  const [selectedOptions] = getSelectedOptionsAndVariants(props.selected, vulnerabilityDropdownOptions, {})
  const [vulnerabilitySelectedOptions, setVulnerabilitySelectedOptions] = useState<string[]>(selectedOptions || [])

  const onSaveCallback = (onSaveSelectedOptions: string[]) => {
    const formData = new FormData()
    formData.set('vulnerability_web', onSaveSelectedOptions.includes('vulnerabilityWeb') ? '1' : '0')
    formData.set('vulnerability_cli', onSaveSelectedOptions.includes('vulnerabilityCli') ? '1' : '0')
    formData.set('vulnerability_email', onSaveSelectedOptions.includes('vulnerabilityEmail') ? '1' : '0')
    props.saveData(Sections.System, formData)

    setVulnerabilitySelectedOptions(onSaveSelectedOptions)
  }

  return (
    <MultipleSelect
      title="Select notification channels"
      menuButtonPrefix={defaultPrefix}
      defaultMenuButtonOption={defaultOption}
      menuButtonOptions={vulnerabilityDisplayOptions}
      listOptions={vulnerabilityDropdownOptions}
      selectedListOptions={vulnerabilitySelectedOptions}
      onSaveCallback={onSaveCallback}
    />
  )
}

interface Props {
  sx?: BetterSystemStyleObject
  continuousIntegration: {[key: string]: boolean}
  vulnerability: {[key: string]: boolean}
  vulnerabilitySubscription: string
  deployKeyAlert: string[]
  actionsUrl: string
  dependabotHelpUrl: string
  saveData: (section: Sections, formData: FormData) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderState: (section: Sections) => React.ComponentElement<any, any>
}

function SystemSettings(props: Props) {
  const actionsDesciption = (
    <>
      Notifications for workflow runs on repositories set up with&nbsp;
      <Link inline href={props.actionsUrl}>
        GitHub Actions
      </Link>
      .
    </>
  )
  const dependabotDesciption = (
    <>
      When you&apos;re given access to&nbsp;
      <Link inline href={props.dependabotHelpUrl}>
        Dependabot alerts
      </Link>
      &nbsp;automatically receive notifications when a new vulnerability is found in one of your dependencies.
    </>
  )
  const saveEmailWeeklyDigest = (data: string) => {
    const formData = new FormData()
    if (data.includes('weekly') || data.includes('daily')) {
      formData.set('vulnerability_digest', '1')
      formData.set('subscription_kind', data.includes('weekly') ? 'weekly' : 'daily')
    } else {
      formData.set('vulnerability_digest', '0')
    }
    props.saveData(Sections.System, formData)
  }

  const saveDeployKeyAlert = (value: boolean) => {
    const formData = new FormData()
    formData.append(`org_deploy_key_settings[email]`, value ? '1' : '0')
    props.saveData(Sections.System, formData)
  }

  const deployKeyToggleLabelId = useId()

  return (
    <Box sx={props.sx}>
      <Table>
        <Header style={{display: 'flex', alignItems: 'center'}}>
          System
          {props.renderState(Sections.System)}
        </Header>
        <Row
          {...actionsRow}
          action={<ActionsSelect selected={props.continuousIntegration} saveData={props.saveData} />}
          subtitle={actionsDesciption}
        />
        <Row
          {...dependabotAlertsRow}
          action={<VulnerabilitySelect selected={props.vulnerability} saveData={props.saveData} />}
          subtitle={dependabotDesciption}
        />
        <Row
          {...emailWeeklyDigestRow}
          action={
            <SingleSelect
              options={Object.values(digestOptions)}
              defaultOption={digestOptions[(props.vulnerabilitySubscription as keyof typeof digestOptions) || 'none']}
              onChange={saveEmailWeeklyDigest}
            />
          }
        />
        <Row
          {...deployKeyAlertRow}
          labelId={deployKeyToggleLabelId}
          action={
            <ToggleBox
              checked={props.deployKeyAlert.includes('email')}
              onChange={saveDeployKeyAlert}
              labelId={deployKeyToggleLabelId}
            />
          }
        />
      </Table>
    </Box>
  )
}

export default SystemSettings
