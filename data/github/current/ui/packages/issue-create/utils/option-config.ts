import {VALUES} from '../constants/values'
import {DisplayMode} from './display-mode'
import type {IssueCreateArguments} from './template-args'

type ScopedRepository = {
  id: string
  name: string
  owner: string
}

type ScopedAssignee = {
  avatarUrl: string
  login: string
}

// Separate out the options that are required to have default non-undefined values
type RequiredOptionConfig = {
  pasteUrlsAsPlainText?: boolean
  useMonospaceFont?: boolean
  singleKeyShortcutsEnabled?: boolean
  showFullScreenButton?: boolean
  navigateToFullScreenOnTemplateChoice?: boolean
  insidePortal?: boolean
  storageKeyPrefix?: string
}

type UndefinableOptionConfig = {
  scopedRepository?: ScopedRepository
  scopedOrganization?: string
  scopedProjectTitle?: string
  scopedIssueType?: string
  scopedMilestone?: string
  scopedAssignees?: ScopedAssignee[]
  issueCreateArguments?: IssueCreateArguments
  defaultDisplayMode?: DisplayMode
  returnFocusRef?: React.RefObject<HTMLElement>
  emojiSkinTonePreference?: number
}

// Additional helper properties
type OptionConfigProperties = {
  showRepositoryPicker: boolean
  getDefaultDisplayMode: (fallback: DisplayMode | undefined) => DisplayMode
}

export type OptionConfig = RequiredOptionConfig & UndefinableOptionConfig

export type SafeOptionConfig = Readonly<
  Required<RequiredOptionConfig> & UndefinableOptionConfig & OptionConfigProperties
>

const OPTION_DEFAULT_CONFIG: Omit<SafeOptionConfig, keyof OptionConfigProperties> = {
  pasteUrlsAsPlainText: false,
  useMonospaceFont: false,
  singleKeyShortcutsEnabled: false,
  showFullScreenButton: false,
  navigateToFullScreenOnTemplateChoice: false,
  insidePortal: true, // Assume true given most cases are inside the dialog
  storageKeyPrefix: '',
}

// This method is used to ensure we only default on values that weren't explicitly specified.
export const getSafeConfig = (config: OptionConfig | undefined): SafeOptionConfig => {
  const filledConfig = {
    ...OPTION_DEFAULT_CONFIG,
    ...config,
  }

  // These are values we want to override before returning, as they take precedence over the default values
  // and depend on the values of other config properties.
  const overrides = {
    storageKeyPrefix:
      filledConfig.scopedRepository?.id ?? filledConfig.storageKeyPrefix ?? VALUES.storageKeyPrefixes.defaultFallback,
  }

  const configProperties: OptionConfigProperties = {
    showRepositoryPicker: !filledConfig.scopedRepository,
    getDefaultDisplayMode: (fallback: DisplayMode | undefined) =>
      filledConfig.defaultDisplayMode ?? fallback ?? DisplayMode.TemplatePicker,
  }

  return {
    ...filledConfig,
    ...overrides,
    ...configProperties,
  }
}

export const getDefaultConfig = (): SafeOptionConfig => getSafeConfig(undefined)
