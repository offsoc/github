import type React from 'react'
import {ControlGroup} from '@github-ui/control-group'
import ControlGroupDropDown, {type ControlGroupDropDownOption} from '../ControlGroupDropDown'
import {useDialogContext} from '../../contexts/DialogContext'
import {useNewRepoPolicyDropdown} from '../../hooks/UseNewRepoPolicyDropdown'
import {useAppContext} from '../../contexts/AppContext'
import {Box, Text} from '@primer/react'

const SecurityConfigurationPolicySection: React.FC = () => {
  const appContext = useAppContext()
  const {configurationPolicy, setConfigurationPolicy} = useDialogContext()

  const NewRepoDefaultRow = () => {
    const {options, onSelect} = useNewRepoPolicyDropdown({hasPublicRepos: appContext.capabilities.hasPublicRepos})

    const newRepoDefaultProps = {
      title: 'Use as default for newly created repositories',
      testId: 'repo-default',
      options,
      onSelect,
    }

    return <ControlGroupDropDown {...newRepoDefaultProps} />
  }

  const enforcementRow = () => {
    const options: ControlGroupDropDownOption[] = [
      {name: "Don't enforce", id: 'not_enforced', selected: configurationPolicy.enforcement === 'not_enforced'},
      {name: 'Enforce', id: 'enforced', selected: configurationPolicy.enforcement === 'enforced'},
    ]
    const onSelect = (option: ControlGroupDropDownOption) => {
      // The option's ID map to expected values of 'enforced' / 'not_enforced' so we can use it directly:
      setConfigurationPolicy({...configurationPolicy, enforcement: option.id})
    }

    const enforcementRowProps = {
      title: 'Enforce configuration',
      description:
        'Block repository owners from changing features that are enabled or disabled by this configuration. Repository owners will still be able to change features that are not set.',
      testId: '',
      options,
      onSelect,
    }

    return <ControlGroupDropDown {...enforcementRowProps} />
  }

  return (
    <>
      <Box sx={{my: 3}}>
        <Text as="strong" sx={{fontSize: 4}}>
          Policy
        </Text>
      </Box>
      <ControlGroup>
        {NewRepoDefaultRow()}
        {enforcementRow()}
      </ControlGroup>
    </>
  )
}

export default SecurityConfigurationPolicySection
