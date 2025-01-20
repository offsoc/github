import type {ControlGroupDropDownOption} from '../components/ControlGroupDropDown'
import {useDialogContext} from '../contexts/DialogContext'

type UseNewRepoPolicyDropdownArgs = {
  hasPublicRepos: boolean
}

interface UseNewRepoPolicyDropdownReturns {
  options: ControlGroupDropDownOption[]
  onSelect: (option: ControlGroupDropDownOption) => void
}

export const useNewRepoPolicyDropdown = ({
  hasPublicRepos,
}: UseNewRepoPolicyDropdownArgs): UseNewRepoPolicyDropdownReturns => {
  const {configurationPolicy, setConfigurationPolicy} = useDialogContext()

  const options: ControlGroupDropDownOption[] = hasPublicRepos
    ? [
        {
          id: 'none',
          name: 'None',
          selected: !configurationPolicy.defaultForNewPublicRepos && !configurationPolicy.defaultForNewPrivateRepos,
        },
        {
          id: 'public',
          name: 'Public',
          selected: configurationPolicy.defaultForNewPublicRepos && !configurationPolicy.defaultForNewPrivateRepos,
        },
        {
          id: 'private_and_internal',
          name: 'Private and internal',
          selected: !configurationPolicy.defaultForNewPublicRepos && configurationPolicy.defaultForNewPrivateRepos,
        },
        {
          id: 'all',
          name: 'All repositories',
          selected: configurationPolicy.defaultForNewPublicRepos && configurationPolicy.defaultForNewPrivateRepos,
        },
      ]
    : [
        {
          id: 'not_default',
          name: 'Not default',
          selected: !configurationPolicy.defaultForNewPrivateRepos,
        },
        {id: 'default', name: 'Default', selected: configurationPolicy.defaultForNewPrivateRepos},
      ]

  const onSelect = (option: ControlGroupDropDownOption) => {
    let newDefaultForNewPublicRepos = configurationPolicy.defaultForNewPublicRepos
    let newDefaultForNewPrivateRepos = configurationPolicy.defaultForNewPrivateRepos

    switch (option.id) {
      case 'none':
      case 'not_default':
        newDefaultForNewPublicRepos = false
        newDefaultForNewPrivateRepos = false
        break
      case 'default':
      case 'private_and_internal':
        newDefaultForNewPublicRepos = false
        newDefaultForNewPrivateRepos = true
        break
      case 'public':
        newDefaultForNewPublicRepos = true
        newDefaultForNewPrivateRepos = false
        break
      case 'all':
        newDefaultForNewPublicRepos = true
        newDefaultForNewPrivateRepos = true
        break
      default:
        break
    }

    setConfigurationPolicy({
      defaultForNewPublicRepos: newDefaultForNewPublicRepos,
      defaultForNewPrivateRepos: newDefaultForNewPrivateRepos,
      enforcement: configurationPolicy.enforcement,
    })
  }

  return {
    options,
    onSelect,
  }
}
