import {attr, controller, target, targets} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'

interface PolicyData {
  id?: number
  name: string
  policyConstraints: PolicyConstraint[]
  policyTargetType: string
}

interface AllowableValue {
  display_name: string
  name: string
  cpus: number
  displayText: string
}

interface HostSetupParams {
  repo?: string
  branch?: string
  path?: string
}

interface NetworkConfigurationParams {
  id?: string
  name?: string
}

type Params = HostSetupParams | NetworkConfigurationParams

interface PolicyConstraint {
  name: string
  value_type?: string
  enabled_value?: string
  maximum_value?: number
  maximum_allowable_value?: number
  minimum_value?: number
  allowed_values?: string[]
  allowable_values?: AllowableValue[]
  disabled?: boolean
  global_target_only?: boolean
  params?: Params
  isolate_constraint_to_a_single_policy?: boolean
}

const MachineTypesConstraintName = 'codespaces.allowed_machine_types'
const PortPrivacyConstraintName = 'codespaces.allowed_port_privacy_settings'
const RetentionPeriodConstraintName = 'codespaces.allowed_maximum_retention_period'
const HostSetupConstraintName = 'codespaces.host_setup'
const NetworkConfigurationConstraintName = 'codespaces.network_configuration'
// eslint-disable-next-line i18n-text/no-en
const HostSetupMultiplePerRepoNotErrorMsg = 'Host setup can only be applied once per repository.'
// eslint-disable-next-line i18n-text/no-en
const NetworkConfigurationMultiplePerRepoNotErrorMsg = 'Network configurations can only applied once per repository.'

function hideElement(element: HTMLElement | null): void {
  if (element !== null) {
    element.hidden = true
  }
}

function showElement(element: HTMLElement | null): void {
  if (element !== null) {
    element.hidden = false
  }
}

const TargetAllReposType = 'User' // When an org policy applies to all repos, we define a target at the org level (Ruby subclass of User)
const TargetSelectedReposType = 'Repository' // When an org policy applies to selected repos, we define a number of Repository targets
const TargetAllOrgsType = 'Business' // When an enterprise policy applies to all orgs, we define a target at the enterprise level (Business class)
const TargetSelectedOrgsType = 'User' // When an enterprise policy applies to selected orgs, we define a number of org targets (Ruby subclass of User)

@controller
class CodespacesPolicyFormElement extends HTMLElement {
  @target constraintList: HTMLElement
  @target addConstraintInfo: HTMLElement
  @target addConstraintDropdownList: HTMLDetailsElement
  @target saveButton: HTMLButtonElement
  @target saveErrorElement: HTMLElement
  @target spinnerElement: HTMLElement
  @target selectReposHostSetupWarning: HTMLElement
  @target selectReposNetworkConfigurationWarning: HTMLElement

  @targets activeConstraintsListRows: HTMLElement[]

  // Targets for MachineType constraint elements
  @target machineTypeConstraintElement: HTMLElement
  @target noSelectedAllowedValuesTextForMachineTypes: HTMLElement
  @target selectedAllowedValuesTextForMachineTypes: HTMLElement
  @targets constraintAllowableValueCheckboxesForMachineTypes: HTMLInputElement[]

  // Targets for PortPrivacy constraint elements
  @target portPrivacyConstraintElement: HTMLElement
  @target noSelectedAllowedValuesTextForPortPrivacySettings: HTMLElement
  @target selectedAllowedValuesTextForPortPrivacySettings: HTMLElement
  @targets constraintAllowableValueCheckboxesForPortPrivacySettings: HTMLInputElement[]

  // Targets for Repository selection elements
  @target selectedTargetsCountTextElement: HTMLElement
  @target targetSelector: HTMLElement
  @target dynamicRepositorySelectionEl: HTMLElement
  @target allRepositoriesDescriptionEl: HTMLElement
  @target selectedRepositoriesDescriptionEl: HTMLElement
  @target hostSetupRepoIds: HTMLElement
  @target targetSelectorAll: HTMLElement
  @target targetSelectorSelected: HTMLElement
  @target targetSelectorDisabledAll: HTMLElement
  @target targetSelectorDisabledSelected: HTMLElement
  @target networkConfigurationRepoIds: HTMLElement
  @target policyURLNetworkConfigurationAllRepos: HTMLElement

  // Targets for Network Configuration constraint elements
  @target noSelectedNetworkConfigurationText: HTMLElement
  @target selectedNetworkConfigurationText: HTMLElement
  @target networkConfigurationMenu: HTMLElement

  @target addConstraintDropdownUrl: HTMLElement
  @target genericError: HTMLElement
  @target allReposHostSetupPolicyExists: HTMLElement
  @target allReposNetworkConfigurationPolicyExists: HTMLElement

  // Required for data-* attributes
  @attr constraint = ''
  @attr addedConstraintName = ''
  @attr constraintButtonName = ''
  @attr constraintButtonInfo = ''
  @attr existingPolicy = ''
  @attr existingPolicyConstraints = ''
  @attr removedConstraintName = ''
  @attr selector = ''

  policyData: PolicyData = {
    name: '',
    policyTargetType: TargetAllReposType,
    policyConstraints: [],
  }
  policyOwnerType: string = 'Organization'
  machineTypeConstraint: PolicyConstraint = {name: MachineTypesConstraintName}
  portPrivacyConstraint: PolicyConstraint = {name: PortPrivacyConstraintName}
  isolatedConstraintsList: string[] = []
  disabledSelectedRepositoryConstraintsList: string[] = []
  hostSetupRepoIdsList: number[] = []
  allReposHostSetupPolicyExistsValue: boolean
  networkConfigurationRepoIdsList: number[] = []
  allReposNetworkConfigurationPolicyExistsValue: boolean
  selectedRepoList: number[] = []
  unsavedChangesWarning: string | null

  connectedCallback(): void {
    this.unsavedChangesWarning = this.getAttribute('data-unsaved-changes-warning')
    this.policyOwnerType = this.getAttribute('data-owner-type') || 'Organization'
    const machineTypeConstraintInfo = JSON.parse(this.machineTypeConstraintElement.getAttribute('data-value') as string)
    this.machineTypeConstraint = {
      ...machineTypeConstraintInfo,
      allowable_values: machineTypeConstraintInfo.allowable_values.map((value: {display_name: string}) => ({
        ...value,
        displayText: value.display_name,
      })),
    }
    const portPrivacyConstraintInfo = JSON.parse(this.portPrivacyConstraintElement.getAttribute('data-value') as string)
    this.portPrivacyConstraint = {
      ...portPrivacyConstraintInfo,
      allowable_values: portPrivacyConstraintInfo.allowable_values.map((value: {display_name: string}) => ({
        ...value,
        displayText: value.display_name,
      })),
    }
    const existingPolicy = this.constraintList.getAttribute('data-existing-policy') as string

    if (existingPolicy === null) {
      return
    }

    this.policyData = {
      ...JSON.parse(existingPolicy),
      policyConstraints: this.parseExistingConstraints(
        this.constraintList.getAttribute('data-existing-policy-constraints') as string,
      ),
      policyTargetType: this.fetchPolicyTargetType(),
    }

    this.initializeVariables()
    this.updateChangePolicyTargetButtons()
  }

  parseExistingConstraints = (existingConstraints: string): PolicyConstraint[] => {
    const parsedConstraints = JSON.parse(existingConstraints)
    if (!parsedConstraints) {
      return []
    }

    const constraints = parsedConstraints.map((policyConstraint: PolicyConstraint) => {
      if (policyConstraint.name === RetentionPeriodConstraintName && policyConstraint.maximum_value) {
        policyConstraint.maximum_value = policyConstraint.maximum_value / 24 / 60 // Convert minutes to days
      }
      return policyConstraint
    })
    return constraints
  }

  handlePolicyNameChange(event: Event): void {
    const currentTarget = event.currentTarget as HTMLInputElement
    this.policyData = {
      ...this.policyData,
      name: currentTarget.value.trim(),
    }
    this.updateSaveButton()
  }

  async addConstraint(event: Event): Promise<void> {
    window.onbeforeunload = () => this.unsavedChangesWarning
    const currentTarget = event.currentTarget as HTMLElement
    const constraint = JSON.parse(currentTarget.getAttribute('data-constraint-button-info') as string)

    if (constraint === null) {
      return
    }
    this.addConstraintToPolicyFormData(constraint)
    this.updateConstraintDropdown()

    hideElement(this.addConstraintInfo)
    this.showConstraintListRow(constraint.name)
    this.handleDisplayedDefaultsForPolicyConstraint(constraint)

    this.updateSaveButton()
    this.updateChangePolicyTargetButtons()
    this.updateHostSetupOverrideNote()
    this.updateNetworkConfigurationOverrideNote()
  }

  async updateConstraintDropdown(): Promise<void> {
    const addConstraintUrl = this.addConstraintDropdownUrl.getAttribute('data-value') as string
    const policyConstraintParam = new URLSearchParams({
      current_policy_constraints: JSON.stringify(
        this.policyData.policyConstraints.map(policyConstraint => policyConstraint.name),
      ),
      all_repos_target: JSON.stringify(this.policyData.policyTargetType === TargetAllReposType),
      all_repos_host_setup_policy_exists: JSON.stringify(
        this.allReposHostSetupPolicyExists.getAttribute('data-value') === 'true',
      ),
      all_repos_network_configuration_policy_exists: JSON.stringify(
        this.allReposNetworkConfigurationPolicyExists.getAttribute('data-value') === 'true',
      ),
    })
    const response = await fetch(`${addConstraintUrl}?${policyConstraintParam}`)
    if (response.ok) {
      const updatedDropdown = parseHTML(document, await response.text())
      this.addConstraintDropdownList.replaceWith(updatedDropdown)
    } else {
      showElement(this.genericError)
    }
  }

  private updateSaveButton(): void {
    if (this.policyData.policyConstraints.length > 0 && this.policyData.name) {
      this.saveButton.disabled = false
    } else {
      this.saveButton.disabled = true
    }
  }

  private initializeVariables() {
    this.hostSetupRepoIdsList = JSON.parse(this.hostSetupRepoIds.getAttribute('data-value') as string)
    this.networkConfigurationRepoIdsList = JSON.parse(
      this.networkConfigurationRepoIds.getAttribute('data-value') as string,
    )
    this.allReposHostSetupPolicyExistsValue = this.allReposHostSetupPolicyExists.getAttribute('data-value') === 'true'
    this.allReposNetworkConfigurationPolicyExistsValue =
      this.allReposNetworkConfigurationPolicyExists.getAttribute('data-value') === 'true'
  }

  private getTargetCheckboxes() {
    if (this.policyOwnerType === 'Business') {
      // We filter by unique values here to avoid double-counting in the UI and redundantly sending two of the same IDs,
      // this is because our reuse of the  means the hidden, preloaded selectlist has a different DOM structure than
      // the interactive OrganizationSelectionComponent dialog.
      const uniqueValues = new Set()
      const els = Array.from(
        document.querySelectorAll<HTMLInputElement>(
          'input[name="organization_ids[]"]:checked, input[name="enable[]"][data-form-field-name="codespaces-policy-group-target-ids"]',
        ),
      )
      return els.filter(el => {
        if (uniqueValues.has(el.value)) {
          return false
        }
        uniqueValues.add(el.value)
        return true
      })
    } else {
      return document.querySelectorAll<HTMLInputElement>(
        'input[name="enable[]"][data-form-field-name="codespaces-policy-group-target-ids"]',
      )
    }
  }

  private updateChangePolicyTargetButtons(): void {
    if (this.shouldDisableSelectedTargets()) {
      hideElement(this.targetSelectorSelected)
      showElement(this.targetSelectorDisabledSelected)
    } else {
      hideElement(this.targetSelectorDisabledSelected)
      showElement(this.targetSelectorSelected)
    }

    if (this.hasDisabledAllRepositoriesPolicyTarget()) {
      hideElement(this.targetSelectorAll)
      showElement(this.targetSelectorDisabledAll)
    } else {
      hideElement(this.targetSelectorDisabledAll)
      showElement(this.targetSelectorAll)
    }
  }

  private shouldDisableSelectedTargets(): boolean {
    return this.policyData.policyConstraints.some(el => el.global_target_only)
  }

  private hasDisabledAllRepositoriesPolicyTarget(): boolean {
    const applicableConstraintSelected = this.policyData.policyConstraints.some(el =>
      [HostSetupConstraintName, NetworkConfigurationConstraintName].includes(el.name),
    )

    return (
      applicableConstraintSelected &&
      (this.allReposHostSetupPolicyExistsValue || this.allReposNetworkConfigurationPolicyExistsValue)
    )
  }

  private addConstraintToPolicyFormData(constraint: PolicyConstraint): void {
    this.policyData = {
      ...this.policyData,
      policyConstraints: this.policyData.policyConstraints.concat({
        ...constraint,
        allowed_values: constraint.allowable_values?.map((value: {name: string}) => value.name),
        maximum_value: constraint.maximum_allowable_value,
      }),
    }
  }

  private handleDisplayedDefaultsForPolicyConstraint(constraint: PolicyConstraint): void {
    switch (constraint.name) {
      case MachineTypesConstraintName:
        this.showAllAllowedValuesTextFor(MachineTypesConstraintName)
        this.checkAllAllowableValues(MachineTypesConstraintName)
        break
      case PortPrivacyConstraintName:
        this.showAllAllowedValuesTextFor(PortPrivacyConstraintName)
        this.checkAllAllowableValues(PortPrivacyConstraintName)
        break
      default:
        null
    }
  }

  private handleDisplayingAllowedValuesTextForConstraint(constraintName: string, allowedValues: string[]): void {
    let allowedValuesTextElement: HTMLElement | null = null
    let noAllowedValuesTextElement: HTMLElement | null = null
    let constraint: PolicyConstraint | null = null

    switch (constraintName) {
      case MachineTypesConstraintName:
        allowedValuesTextElement = this.selectedAllowedValuesTextForMachineTypes
        noAllowedValuesTextElement = this.noSelectedAllowedValuesTextForMachineTypes
        constraint = this.machineTypeConstraint
        break
      case PortPrivacyConstraintName:
        allowedValuesTextElement = this.selectedAllowedValuesTextForPortPrivacySettings
        noAllowedValuesTextElement = this.noSelectedAllowedValuesTextForPortPrivacySettings
        constraint = this.portPrivacyConstraint
        break
      default:
        return
    }

    if (allowedValues.length === 0) {
      showElement(noAllowedValuesTextElement)
      hideElement(allowedValuesTextElement)

      return
    }

    if (allowedValues.length > 0) {
      allowedValuesTextElement.textContent =
        constraint?.allowable_values
          ?.filter((value: {name: string}) => allowedValues.includes(value.name))
          .map((value: {displayText: string}) => value.displayText)
          .join(', ') || ''
      showElement(allowedValuesTextElement)
      hideElement(noAllowedValuesTextElement)
    }
  }

  private showAllAllowedValuesTextFor(constraintName: string): void {
    let allowedValuesText: HTMLElement | null = null
    let noAllowedValuesText: HTMLElement | null = null
    let constraint: PolicyConstraint | null = null

    switch (constraintName) {
      case MachineTypesConstraintName:
        allowedValuesText = this.selectedAllowedValuesTextForMachineTypes
        noAllowedValuesText = this.noSelectedAllowedValuesTextForMachineTypes
        constraint = this.machineTypeConstraint
        break
      case PortPrivacyConstraintName:
        allowedValuesText = this.selectedAllowedValuesTextForPortPrivacySettings
        noAllowedValuesText = this.noSelectedAllowedValuesTextForPortPrivacySettings
        constraint = this.portPrivacyConstraint
        break
      default:
        return
    }

    allowedValuesText.textContent = constraint?.allowable_values?.map(value => value.displayText).join(', ') || ''
    showElement(allowedValuesText)
    hideElement(noAllowedValuesText)
  }

  private checkAllAllowableValues(constraintName: string): void {
    let checkboxesToCheck: HTMLInputElement[]

    switch (constraintName) {
      case MachineTypesConstraintName:
        checkboxesToCheck = this.constraintAllowableValueCheckboxesForMachineTypes
        break
      case PortPrivacyConstraintName:
        checkboxesToCheck = this.constraintAllowableValueCheckboxesForPortPrivacySettings
        break
      default:
        checkboxesToCheck = []
    }

    for (const checkbox of checkboxesToCheck) {
      checkbox.checked = true
    }
  }

  selectAllowableValueForConstraint(event: Event): void {
    const currentTarget = event.currentTarget as HTMLInputElement
    const constraintName = currentTarget.getAttribute('data-constraint-name') as string
    const newAllowedValue = currentTarget?.value
    const constraintIndex = this.findConstraintIndexInPolicyData(constraintName)
    const constraintIsStored = constraintIndex !== -1

    if (!constraintIsStored) {
      return
    }

    const currentConstraintStored = this.policyData.policyConstraints[constraintIndex]!
    const currentNameIsStored = currentConstraintStored.allowed_values?.find(value => value === newAllowedValue)
    const currentAllowedValues = currentConstraintStored.allowed_values || []
    const updatedAllowedValues = currentNameIsStored
      ? currentAllowedValues.filter(value => value !== newAllowedValue)
      : currentAllowedValues.concat(newAllowedValue)

    this.updatePolicyDataConstraintAtIndex(constraintIndex, {
      ...currentConstraintStored,
      allowed_values: updatedAllowedValues,
    })
    this.handleDisplayingAllowedValuesTextForConstraint(constraintName, updatedAllowedValues)
  }

  selectNetworkConfigForConstraint(event: Event): void {
    const currentTarget = event.currentTarget as HTMLInputElement
    const configurationId = currentTarget.getAttribute('data-config-id') as string
    const configurationName = currentTarget.getAttribute('data-config-name') as string
    const constraintName = currentTarget.getAttribute('data-constraint-name') as string
    const constraintIndex = this.findConstraintIndexInPolicyData(constraintName)
    const currentConstraintStored = this.policyData.policyConstraints[constraintIndex]!
    this.updatePolicyDataConstraintAtIndex(constraintIndex, {
      ...currentConstraintStored,
      params: {
        id: configurationId,
        name: configurationName,
      },
    })
    this.handleDisplayingUpdatedNetworkConfigSelection(configurationId, configurationName)
  }

  handleDisplayingUpdatedNetworkConfigSelection(configurationId: string, configurationName: string): void {
    let networkHasBeenSelected = false
    const networkConfigurationMenuItems = this.networkConfigurationMenu.querySelectorAll('.network-config-menu-item')
    for (const item of networkConfigurationMenuItems) {
      const itemConfigId = item.getAttribute('data-config-id') as string
      if (itemConfigId === configurationId) {
        networkHasBeenSelected = true
      }
    }

    if (networkHasBeenSelected) {
      this.selectedNetworkConfigurationText.textContent = configurationName
      hideElement(this.noSelectedNetworkConfigurationText)
      showElement(this.selectedNetworkConfigurationText)
    } else {
      hideElement(this.selectedNetworkConfigurationText)
      showElement(this.noSelectedNetworkConfigurationText)
    }
  }

  updatePolicyDataConstraintAtIndex(index: number, constraint: PolicyConstraint): void {
    window.onbeforeunload = () => this.unsavedChangesWarning
    this.policyData = {
      ...this.policyData,
      policyConstraints: [
        ...this.policyData.policyConstraints.slice(0, index),
        constraint,
        ...this.policyData.policyConstraints.slice(index + 1),
      ],
    }
  }

  saveMaximumValueConstraintChange(event: CustomEvent): void {
    const {value, constraintName} = event.detail

    const constraintIndex = this.findConstraintIndexInPolicyData(constraintName)
    const constraintIsStored = constraintIndex !== -1

    if (!constraintIsStored) {
      return
    }
    const currentConstraintStored = this.policyData.policyConstraints[constraintIndex]!
    const newMaxValue = parseInt(value)

    this.updatePolicyDataConstraintAtIndex(constraintIndex, {
      ...currentConstraintStored,
      maximum_value: newMaxValue,
    })
  }

  saveAllowedValuesConstraintChange(event: CustomEvent): void {
    const {values, constraintName} = event.detail

    const constraintIndex = this.findConstraintIndexInPolicyData(constraintName)
    const constraintIsStored = constraintIndex !== -1
    if (!constraintIsStored) {
      return
    }
    const currentConstraintStored = this.policyData.policyConstraints[constraintIndex]!

    this.updatePolicyDataConstraintAtIndex(constraintIndex, {
      ...currentConstraintStored,
      allowed_values: values,
    })
  }

  saveHostSetupConstraintChange(event: CustomEvent): void {
    const {hostSetup, constraintName} = event.detail
    const constraintIndex = this.findConstraintIndexInPolicyData(constraintName)
    const constraintIsStored = constraintIndex !== -1
    if (!constraintIsStored) {
      return
    }
    const currentConstraintStored = this.policyData.policyConstraints[constraintIndex]!
    this.updatePolicyDataConstraintAtIndex(constraintIndex, {
      ...currentConstraintStored,
      params: hostSetup,
    })
  }

  private findConstraintIndexInPolicyData(constraintName: string): number {
    return this.policyData.policyConstraints.findIndex(constraint => constraint.name === constraintName)
  }

  async removeConstraint(event: Event): Promise<void> {
    window.onbeforeunload = () => this.unsavedChangesWarning
    const currentTarget = event.currentTarget as HTMLElement
    const constraintName = currentTarget.getAttribute('data-removed-constraint-name') as string

    if (constraintName === null) {
      return
    }

    const constraintIdx = this.policyData.policyConstraints.findIndex(c => c.name === constraintName)
    this.policyData = {
      ...this.policyData,
      policyConstraints: [
        ...this.policyData.policyConstraints.slice(0, constraintIdx),
        ...this.policyData.policyConstraints.slice(constraintIdx + 1),
      ],
    }

    this.hideConstraintListRow(constraintName)
    this.updateConstraintDropdown()

    if (this.policyData.policyConstraints.length === 0) {
      showElement(this.addConstraintInfo)
    }
    this.updateSaveButton()
    this.updateChangePolicyTargetButtons()
    this.updateHostSetupOverrideNote()
    this.updateNetworkConfigurationOverrideNote()
  }

  private hideConstraintListRow(constraintName: string): void {
    for (const row of this.activeConstraintsListRows) {
      if (row.getAttribute('data-added-constraint-name') === constraintName) {
        hideElement(row)
      }
    }
  }

  private showConstraintListRow(constraintName: string): void {
    for (const row of this.activeConstraintsListRows) {
      if (row.getAttribute('data-added-constraint-name') === constraintName) {
        showElement(row)
      }
    }
  }

  selectOrganizations(): void {
    window.onbeforeunload = () => this.unsavedChangesWarning
    const targetCheckboxes = this.getTargetCheckboxes()
    this.selectedTargetsCountTextElement.textContent = `${targetCheckboxes.length.toString()} selected`
    showElement(this.selectedTargetsCountTextElement)
  }

  selectRepositories(): void {
    window.onbeforeunload = () => this.unsavedChangesWarning
    const repoCheckboxes = this.getTargetCheckboxes()
    this.selectedRepoList = []
    for (const checkbox of repoCheckboxes) {
      this.selectedRepoList.push(parseInt(checkbox.value))
    }
    this.selectedTargetsCountTextElement.textContent = `${repoCheckboxes.length.toString()} selected`
    showElement(this.selectedTargetsCountTextElement)

    this.updateHostSetupOverrideNote()
    this.updateNetworkConfigurationOverrideNote()
  }

  updateHostSetupOverrideNote(): void {
    if (this.selectReposHostSetupWarning === undefined) {
      return
    }
    const onSelectRepoTargetType = this.policyData.policyTargetType !== TargetAllReposType
    const hostPolicySelected = this.policyData.policyConstraints.some(el => el.name === HostSetupConstraintName)

    const shouldShowWarning = this.allReposHostSetupPolicyExistsValue && onSelectRepoTargetType && hostPolicySelected
    if (shouldShowWarning) {
      showElement(this.selectReposHostSetupWarning)
    } else {
      hideElement(this.selectReposHostSetupWarning)
    }
  }

  updateNetworkConfigurationOverrideNote(): void {
    if (this.selectReposNetworkConfigurationWarning === undefined) {
      return
    }
    const allReposNetworkPolicyExists =
      this.allReposNetworkConfigurationPolicyExists.getAttribute('data-value') === 'true'
    const onSelectRepoTargetType = this.policyData.policyTargetType !== TargetAllReposType
    const networkPolicySelected = this.policyData.policyConstraints.some(
      el => el.name === NetworkConfigurationConstraintName,
    )

    const shouldShowWarning = allReposNetworkPolicyExists && onSelectRepoTargetType && networkPolicySelected
    if (shouldShowWarning) {
      showElement(this.selectReposNetworkConfigurationWarning)
    } else {
      hideElement(this.selectReposNetworkConfigurationWarning)
    }
  }

  updateRepositoriesTargetType(event: Event): void {
    window.onbeforeunload = () => this.unsavedChangesWarning
    const storedTarget = this.policyData.policyTargetType
    const newTarget = (event.currentTarget as HTMLInputElement)?.getAttribute('value')

    if (storedTarget !== newTarget) {
      this.policyData = {
        ...this.policyData,
        policyTargetType: newTarget!,
      }
      this.updateConstraintDropdown()
      this.updateHostSetupOverrideNote()
      this.updateNetworkConfigurationOverrideNote()
    }

    if (this.policyOwnerType === 'Organization') {
      switch (newTarget) {
        case TargetAllReposType:
          hideElement(this.dynamicRepositorySelectionEl)
          hideElement(this.selectedRepositoriesDescriptionEl)
          showElement(this.allRepositoriesDescriptionEl)
          break
        case TargetSelectedReposType:
          hideElement(this.allRepositoriesDescriptionEl)
          showElement(this.dynamicRepositorySelectionEl)
          showElement(this.selectedRepositoriesDescriptionEl)
          break
      }
    } else if (this.policyOwnerType === 'Business') {
      switch (newTarget) {
        case TargetAllOrgsType:
          hideElement(this.dynamicRepositorySelectionEl)
          hideElement(this.selectedRepositoriesDescriptionEl)
          showElement(this.allRepositoriesDescriptionEl)
          break
        case TargetSelectedOrgsType:
          hideElement(this.allRepositoriesDescriptionEl)
          showElement(this.dynamicRepositorySelectionEl)
          showElement(this.selectedRepositoriesDescriptionEl)
          break
      }
    }
  }

  fetchPolicyTargetType(): string {
    const targetSelectionText = this.targetSelector
      .querySelector('[data-selector="policy-selection"]')
      ?.textContent?.trim()

    switch (targetSelectionText) {
      case 'All repositories':
        return TargetAllReposType
      case 'Selected repositories':
        return TargetSelectedReposType
      case 'All organizations':
        return TargetAllOrgsType
      case 'Selected organizations':
        return TargetSelectedOrgsType
      default:
        return TargetAllReposType
    }
  }

  updateHostSetupMultiplePerRepoNotErrorVisbility() {
    if (this.saveErrorElement.textContent === HostSetupMultiplePerRepoNotErrorMsg) {
      hideElement(this.saveErrorElement)
      this.saveErrorElement.textContent = ''
    }
  }

  updateNetworkConfigurationMultiplePerRepoNotErrorVisbility() {
    if (this.saveErrorElement.textContent === NetworkConfigurationMultiplePerRepoNotErrorMsg) {
      hideElement(this.saveErrorElement)
      this.saveErrorElement.textContent = ''
    }
  }

  validatePolicyForHostSetup() {
    this.updateHostSetupMultiplePerRepoNotErrorVisbility()

    if (this.policyData && this.policyData.policyConstraints) {
      for (const policyConstraint of this.policyData.policyConstraints) {
        if (policyConstraint.name === HostSetupConstraintName && policyConstraint.params) {
          if (this.selectedRepoList.some(item => this.hostSetupRepoIdsList.includes(item))) {
            this.saveErrorElement.textContent = HostSetupMultiplePerRepoNotErrorMsg
            hideElement(this.spinnerElement)
            showElement(this.saveErrorElement)
            return false
          }
        }
      }
    }

    return true
  }

  async savePolicy(event: Event): Promise<void> {
    window.onbeforeunload = null
    if (this.policyData.policyTargetType === TargetSelectedReposType) {
      if (!this.validatePolicyForHostSetup()) {
        return
      }
    }

    showElement(this.spinnerElement)
    const currentTarget = event.currentTarget as HTMLElement
    const csrfToken = currentTarget.getAttribute('data-csrf') || ''
    const url = currentTarget.getAttribute('data-submit-url') || ''
    const redirectUrl = currentTarget.getAttribute('data-redirect-url') || ''
    let method = 'post'
    const formData = this.buildFormData(csrfToken)

    if (this.policyData.id) {
      method = 'put'
    }

    try {
      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.status === 200) {
        window.location.href = redirectUrl
        return
      }

      const data = await response.json()

      if (data.error && data.error.length > 0) {
        this.saveErrorElement.textContent = data.error
      }

      hideElement(this.spinnerElement)
      showElement(this.saveErrorElement)
    } catch (err) {
      hideElement(this.spinnerElement)
      showElement(this.saveErrorElement)
    }
  }

  private buildFormData(csrfToken: string): FormData {
    const formData = new FormData()

    // eslint-disable-next-line github/authenticity-token
    formData.set('authenticity_token', csrfToken)

    formData.append(`policy_group[name]`, this.policyData.name)

    const targetCheckboxes = this.getTargetCheckboxes()
    if (this.policyOwnerType === 'Organization') {
      formData.append(
        `policy_group[all_repositories]`,
        JSON.stringify(this.policyData.policyTargetType === TargetAllReposType),
      )
      for (const checkbox of targetCheckboxes) {
        formData.append(`policy_group[repository_ids][]`, checkbox.value)
      }
    } else if (this.policyOwnerType === 'Business') {
      formData.append(
        `policy_group[all_organizations]`,
        JSON.stringify(this.policyData.policyTargetType === TargetAllOrgsType),
      )
      for (const checkbox of targetCheckboxes) {
        formData.append(`policy_group[organization_ids][]`, checkbox.value)
      }
    }

    for (const policyConstraint of this.policyData.policyConstraints) {
      formData.append(`policy_group[constraints][][name]`, policyConstraint.name)
      if (policyConstraint.allowed_values) {
        for (const constraintValue of policyConstraint.allowed_values) {
          formData.append(`policy_group[constraints][][value][]`, constraintValue)
        }
      }

      if (policyConstraint.maximum_value) {
        let value = policyConstraint.maximum_value
        if (policyConstraint.name === RetentionPeriodConstraintName) {
          value = value * 24 * 60 // convert to minutes
        }
        formData.append(`policy_group[constraints][][value]`, value.toString())
      }

      if (policyConstraint.name === HostSetupConstraintName && policyConstraint.params) {
        const hostSetupParams = policyConstraint.params as HostSetupParams
        const hostConfigData = {
          repo: hostSetupParams.repo?.toString(),
          branch: hostSetupParams.branch?.toString(),
          path: hostSetupParams.path?.toString(),
        }

        formData.append(`policy_group[constraints][][value]`, JSON.stringify(hostConfigData))
      }

      if (policyConstraint.name === NetworkConfigurationConstraintName && policyConstraint.params) {
        const networkConfigParams = policyConstraint.params as NetworkConfigurationParams
        const networkConfigData = {
          id: networkConfigParams.id?.toString(),
          name: networkConfigParams.name?.toString(),
        }

        formData.append(`policy_group[constraints][][value]`, JSON.stringify(networkConfigData))
      }
    }

    return formData
  }
}
