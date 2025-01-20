import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {screen, waitFor, within} from '@testing-library/react'

import {
  renderPropertyDefinitionsComponent,
  renderPropertyDefinitionsComponentAtEnterpriseLevel,
} from '../../test-utils/Render'
import {PropertyDefinitionSettings} from '../PropertyDefinitionSettings'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

// Jest does not support scrollIntoView
jest.mock('@primer/behaviors')
jest.setTimeout(45_000)

beforeEach(navigateFn.mockClear)

const defaultProps: React.ComponentProps<typeof PropertyDefinitionSettings> = {
  existingPropertyNames: [],
  setFormError: jest.fn(),
}

const validateRegexPatternPath = '/repos/validate_regex/pattern'
const validateRegexValuePath = '/repos/validate_regex/value'

describe('PropertyDefinitionSettings', () => {
  describe('validation', () => {
    it('shows validation error if empty and focuses on save', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      const field = screen.getByLabelText('Name *')

      await user.clear(field)
      await user.click(screen.getByText('Save property'))

      await screen.findByText('Name is required')
      await waitFor(() => expect(field).toHaveFocus())
    })

    it('shows validation error if name contains invalid chars', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.type(screen.getByLabelText('Name *'), 'invalid value')
      await user.tab()

      await expect(screen.findByText('Name contains invalid characters: whitespace')).resolves.toBeInTheDocument()
    })

    it('shows validation error if name already exists', async () => {
      const {user} = renderPropertyDefinitionsComponent(
        <PropertyDefinitionSettings {...defaultProps} existingPropertyNames={['environment']} />,
      )

      await user.type(screen.getByLabelText('Name *'), 'environment')
      await user.tab()

      await expect(screen.findByText('Name already exists')).resolves.toBeInTheDocument()
    })

    it('shows validation error if name is too long', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.type(screen.getByLabelText('Name *'), 'a'.repeat(76))
      await user.tab()

      await expect(screen.findByText('Name cannot be longer than 75 characters')).resolves.toBeInTheDocument()
    })

    it('shows validation error if description is too long and focuses on save', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.type(screen.getByLabelText('Name *'), 'env')

      const field = screen.getByLabelText('Description')

      await user.type(field, 'a'.repeat(256))
      await user.click(screen.getByText('Save property'))

      await screen.findByText('Description cannot be longer than 255 characters')
      expect(field).toHaveFocus()
    })

    it('shows validation error for allowed value. Cannot add to the list if invalid', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.click(screen.getByRole('button', {name: 'Type: Text'}))
      await user.click(screen.getByText('Single select'))

      const field = await screen.findByLabelText('Options')

      await user.type(field, 'invalid"value')
      await user.click(screen.getByText('Add'))

      await screen.findByText('Option contains invalid characters: "')
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
      expect(field).toHaveFocus()
    })

    it('checks if value is empty only when user attempts to add it to the list', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.click(screen.getByRole('button', {name: 'Type: Text'}))
      await user.click(screen.getByText('Single select'))
      const field = await screen.findByLabelText('Options')

      expect(screen.queryByText('Option cannot be empty')).not.toBeInTheDocument()

      await user.click(screen.getByText('Add'))

      await screen.findByText('Option cannot be empty')
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
      expect(field).toHaveFocus()
    })

    it('checks if allowed values are entered and focuses field', async () => {
      const setFormErrorMock = jest.fn()

      const {user} = renderPropertyDefinitionsComponent(
        <PropertyDefinitionSettings {...{...defaultProps, setFormError: setFormErrorMock}} />,
      )

      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByRole('button', {name: 'Type: Text'}))
      await user.click(screen.getByText('Single select'))

      await user.click(screen.getByText('Save property'))

      expect(setFormErrorMock).toHaveBeenCalledWith('Property must have at least one option')
      const field = await screen.findByLabelText('Options')
      expect(field).toHaveFocus()
    })

    it('validates form even if inputs were not touched', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.click(screen.getByText('Save property'))
      await expect(screen.findByText('Name is required')).resolves.toBeInTheDocument()
    })

    it('shows validation error for a required string definition if the default_value is empty and focuses the field', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)
      await user.type(screen.getByLabelText('Name *'), 'env')

      const requireCheckBox = screen.getByLabelText('Require this property for all repositories')
      expect(requireCheckBox).toBeInTheDocument()
      expect(
        screen.getByText(
          "Repositories that don't have an explicit value for this property will inherit the default value.",
        ),
      ).toBeInTheDocument()

      await user.click(requireCheckBox)

      await user.click(screen.getByText('Save property'))
      await screen.findByText('Cannot be empty for a required property')

      const defaultValueInput = screen.getByLabelText('Default value *')
      expect(defaultValueInput).toHaveFocus()
    })

    it('shows validation error for a required string definition if the default_value is invalid', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)
      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByText('Require this property for all repositories'))

      const defaultValueInput = screen.getByLabelText('Default value *')
      await user.type(defaultValueInput, 'invalid🦦value')

      await expect(screen.findByText('Contains invalid characters: 🦦')).resolves.toBeInTheDocument()
    })

    it('shows validation error for a required boolean definition if the default_value is empty', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

      await user.type(screen.getByLabelText('Name *'), 'env')
      await user.click(screen.getByRole('button', {name: 'Type: Text'}))
      await user.click(screen.getByText('True/false'))

      await user.click(screen.getByText('Require this property for all repositories'))

      await user.click(screen.getByText('Save property'))

      await screen.findByText('Cannot be empty for a required property')
      expect(screen.getByRole('button', {name: 'Choose an option'})).toHaveAttribute('aria-invalid', 'true')
    })

    it('shows validation error for a required single-select definition if the default_value is empty and focuses the field', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)
      await user.type(screen.getByLabelText('Name *'), 'env')
      await user.click(screen.getByRole('button', {name: 'Type: Text'}))
      await user.click(screen.getByText('Single select'))
      await user.type(await screen.findByLabelText('Options'), 'production')
      await user.click(screen.getByText('Add'))

      await user.click(screen.getByText('Require this property for all repositories'))

      await user.click(screen.getByText('Save property'))
      await screen.findByText('Cannot be empty for a required property')

      const defaultValueSelect = screen.getByLabelText('Default value *')
      expect(defaultValueSelect).toHaveFocus()
    })

    it('shows validation error for empty regex field when regex is selected', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })
      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))

      await user.click(screen.getByText('Save property'))

      expect(screen.getByText('Regular expression pattern is required')).toBeInTheDocument()
      expect(screen.getByLabelText('Regular expression input')).toHaveFocus()
    })

    it('sends one validation request for multiple regex pattern updates in quick succession', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))
      const regexInput = screen.getByLabelText('Regular expression input')

      await user.type(regexInput, 'abc')

      await waitFor(() =>
        expectMockFetchCalledWith(validateRegexPatternPath, {
          pattern: 'abc',
        }),
      )

      expectMockFetchCalledTimes(validateRegexPatternPath, 1)
    })

    it('shows validation error for invalid regex pattern on submit and focuses', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })

      mockFetch.mockRoute(validateRegexPatternPath, undefined, {
        ok: false,
        status: 400,
        json: async () => ({
          valid: false,
        }),
      })

      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))
      const regexInput = screen.getByLabelText('Regular expression input')

      await user.type(regexInput, '(abc')

      await user.click(screen.getByText('Save property'))

      await waitFor(() =>
        expectMockFetchCalledWith(validateRegexPatternPath, {
          pattern: '(abc',
        }),
      )

      expect(await screen.findByText('Invalid pattern')).toBeInTheDocument()
      await waitFor(() => expect(regexInput).toHaveFocus())
    })

    it('does not validate regex default value against invalid pattern', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })

      mockFetch.mockRoute(validateRegexPatternPath, undefined, {
        ok: false,
        status: 400,
        json: async () => ({
          valid: false,
        }),
      })

      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))

      const regexInput = screen.getByLabelText('Regular expression input')
      await user.type(regexInput, '(123')

      await waitFor(() =>
        expectMockFetchCalledWith(validateRegexPatternPath, {
          pattern: '(123',
        }),
      )

      await user.click(screen.getByText('Require this property for all repositories'))
      const defaultValueInput = screen.getByLabelText('Default value *')
      await user.type(defaultValueInput, 'abc')

      expect(await screen.findByText('Invalid pattern')).toBeInTheDocument()

      await user.click(screen.getByText('Save property'))

      expectMockFetchCalledTimes(validateRegexValuePath, 0)

      await waitFor(() => expect(regexInput).toHaveFocus())
    })

    it.skip('validates regex default value against valid pattern', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })

      mockFetch.mockRoute(validateRegexPatternPath, undefined, {
        ok: true,
        json: async () => ({
          valid: true,
        }),
      })

      mockFetch.mockRoute(validateRegexValuePath, undefined, {
        ok: false,
        status: 400,
        json: async () => ({
          valid: false,
        }),
      })

      await user.type(screen.getByLabelText('Name *'), 'env')

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))

      await user.type(screen.getByLabelText('Regular expression input'), '123')

      await waitFor(() =>
        expectMockFetchCalledWith(validateRegexPatternPath, {
          pattern: '123',
        }),
      )

      await user.click(screen.getByText('Require this property for all repositories'))
      const defaultValueInput = screen.getByLabelText('Default value *')
      await user.type(defaultValueInput, 'abc')

      await user.click(screen.getByText('Save property'))

      await waitFor(() =>
        expectMockFetchCalledWith(validateRegexValuePath, {
          pattern: '123',
          value: 'abc',
        }),
      )

      expectMockFetchCalledTimes(validateRegexValuePath, 1)

      expect(await screen.findByText('Value does not match pattern')).toBeInTheDocument()
      await waitFor(() => expect(defaultValueInput).toHaveFocus())
    })

    it('displays org conflict overlay', async () => {
      mockFetch.mockRouteOnce('/enterprises/acme-corp/settings/property_definition_name_check/env', {
        status: 'exists_in_business_orgs',
        orgConflicts: {
          totalUsageCount: 1,
          usages: [
            {
              name: 'acme',
              avatarUrl: 'avatar.com',
              propertyType: 'single_select',
            },
          ],
        },
      })

      const {user} = renderPropertyDefinitionsComponentAtEnterpriseLevel(
        <PropertyDefinitionSettings {...defaultProps} />,
      )

      await user.type(screen.getByLabelText('Name *'), 'env')

      const orgConflictsLink = await screen.findByRole('link', {name: 'organizations'})
      await user.click(orgConflictsLink)

      const overlayDialog = within(screen.getByRole('dialog'))

      expect(await overlayDialog.findByRole('heading', {name: 'Conflicts'})).toBeInTheDocument()
      expect(await overlayDialog.findByText('acme')).toBeInTheDocument()
      expect(await overlayDialog.findByText('Single select')).toBeInTheDocument()
    })
  })

  describe('test regex', () => {
    it('opens dialog and mirrors form regex pattern field', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
        appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
      })

      await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))

      await user.type(screen.getByLabelText('Regular expression input'), '123')

      const testValuesButton = screen.getByRole('button', {name: 'Test values…'})

      await user.click(testValuesButton)

      const dialog = screen.getByRole('dialog')

      const dialogRegexPatternInput = within(dialog).getByLabelText('Regular expression input')

      expect(dialogRegexPatternInput).toHaveValue('123')
      await user.type(dialogRegexPatternInput, 'abc')

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Regular expression input')).toHaveValue('123abc')

      expect(testValuesButton).toHaveFocus()
    })
  })

  it('creates new definition', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.type(screen.getByLabelText('Description'), '  Deploy environment  ')
    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        valueType: 'string',
        required: false,
        defaultValue: null,
        description: 'Deploy environment',
        allowedValues: null,
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates new definition with regex', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
      appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
    })

    mockFetch.mockRoute(validateRegexPatternPath, undefined, {
      ok: true,
      json: async () => ({
        valid: true,
      }),
    })

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')

    await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))
    await user.type(screen.getByRole('textbox', {name: 'Regular expression input'}), '.*')

    await user.type(screen.getByLabelText('Description'), '  Deploy environment  ')
    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        valueType: 'string',
        required: false,
        defaultValue: null,
        description: 'Deploy environment',
        allowedValues: null,
        regex: '.*',
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates new definition with null regex if box unchecked after inputting pattern', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />, {
      appPayload: {['enabled_features']: {['custom_properties_regex']: true}},
    })

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')

    await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))
    await user.type(screen.getByRole('textbox', {name: 'Regular expression input'}), '.*')

    await user.click(screen.getByRole('checkbox', {name: 'Use regular expression'}))

    await user.type(screen.getByLabelText('Description'), '  Deploy environment  ')
    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        valueType: 'string',
        required: false,
        defaultValue: null,
        description: 'Deploy environment',
        allowedValues: null,
        regex: null,
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates new definition with allowed values', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')

    await user.click(screen.getByRole('button', {name: 'Type: Text'}))
    await user.click(screen.getByText('Single select'))

    await user.type(await screen.findByLabelText('Options'), 'production')
    await user.click(screen.getByText('Add'))
    await user.type(screen.getByLabelText('Options'), 'development{Enter}')

    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    // Remove first option -> 'production'
    await user.click(screen.getByRole('button', {name: 'More options for production'}))
    await user.click(screen.getByRole('menuitem', {name: 'Delete'}))

    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        description: null,
        allowedValues: ['development'],
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates a new required definition with default value', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.click(screen.getByText('Require this property for all repositories'))
    await user.type(screen.getByLabelText('Default value *'), 'production')
    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        valueType: 'string',
        required: true,
        defaultValue: 'production',
        allowedValues: null,
        valuesEditableBy: 'org_actors',
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates multi_select property', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'platform')

    await user.click(screen.getByRole('button', {name: 'Type: Text'}))
    await user.click(screen.getByText('Multi select'))

    await user.type(screen.getByLabelText('Options'), 'ios{Enter}')
    await user.type(screen.getByLabelText('Options'), 'web{Enter}')

    await user.click(screen.getByText('Require this property for all repositories'))

    await user.click(screen.getByRole('button', {name: 'Select platform'}))
    await user.click(screen.getByRole('option', {name: 'ios'}))

    const iosRow = within(screen.getByRole('listitem', {name: 'ios'}))
    expect(iosRow.getByText('Default')).toBeInTheDocument()
    const webRow = within(screen.getByRole('listitem', {name: 'web'}))
    expect(webRow.queryByText('Default')).not.toBeInTheDocument()

    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'platform',
        valueType: 'multi_select',
        required: true,
        defaultValue: ['ios'],
        allowedValues: ['ios', 'web'],
        valuesEditableBy: 'org_actors',
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates a new definition with repo admin editing allowed', async () => {
    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.click(screen.getByText('Allow repository actors to set this property'))
    await user.click(screen.getByText('Save property'))

    await waitFor(() => {
      expectMockFetchCalledWith(
        '/organizations/acme/settings/custom-properties',
        {
          propertyName: 'environment',
          valueType: 'string',
          required: false,
          allowedValues: null,
          description: null,
          defaultValue: null,
          valuesEditableBy: 'org_and_repo_actors',
          regex: null,
        },
        'equal',
      )
    })

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('creates a new required single-select definition with default value', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')
    await user.click(screen.getByRole('button', {name: 'Type: Text'}))
    await user.click(screen.getByText('Single select'))
    await user.type(await screen.findByLabelText('Options'), 'production')
    await user.click(screen.getByText('Add'))
    await user.type(screen.getByLabelText('Options'), 'development')
    await user.click(screen.getByText('Add'))

    await user.click(screen.getByText('Require this property for all repositories'))
    await user.selectOptions(screen.getByLabelText('Default value *'), ['development'])

    const developmentRow = within(screen.getByRole('listitem', {name: 'development'}))
    expect(developmentRow.getByText('Default')).toBeInTheDocument()
    const productionRow = within(screen.getByRole('listitem', {name: 'production'}))
    expect(productionRow.queryByText('Default')).not.toBeInTheDocument()

    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'environment',
        valueType: 'single_select',
        required: true,
        defaultValue: 'development',
        allowedValues: ['production', 'development'],
        valuesEditableBy: 'org_actors',
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('works in edit mode if definition is provided', async () => {
    const {user} = renderPropertyDefinitionsComponent(
      <PropertyDefinitionSettings
        {...defaultProps}
        definition={{
          propertyName: 'team',
          description: 'project owners',
          valueType: 'string',
          required: false,
          defaultValue: null,
          allowedValues: null,
          valuesEditableBy: 'org_actors',
          regex: null,
        }}
      />,
    )

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRouteOnce('/organizations/acme/settings/custom-properties')

    expect(screen.queryByLabelText('Name *')).toBeDisabled()
    expect(screen.getByRole('button', {name: 'Type: Text'}).getAttribute('data-inactive')).toEqual('true')

    const descriptionInput = screen.getByLabelText('Description')
    expect(descriptionInput).toHaveValue('project owners')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, '  Deploy environment  ')

    await user.click(screen.getByText('Save property'))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties', {
        propertyName: 'team',
        description: 'Deploy environment',
        allowedValues: null,
        valueType: 'string',
      }),
    )

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
  })

  it('shows empty list placeholder if no options were added', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    await user.click(screen.getByRole('button', {name: 'Type: Text'}))
    await user.click(screen.getByText('Single select'))
    expect(screen.getByText('No options')).toBeInTheDocument()
  })

  it('prevents multiple submissions while the request is in flight', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})
    mockFetch.mockRoute('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), 'environment')

    await user.click(screen.getByText('Save property'))
    await user.click(await screen.findByText('Saving...'))

    await waitFor(() => expect(navigateFn).toHaveBeenCalled())
    expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties', 1)
  })

  it('prevents saving invalid value', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertyDefinitionSettings {...defaultProps} />)

    mockFetch.mockRoute('/organizations/acme/settings/custom-properties')

    await user.type(screen.getByLabelText('Name *'), '@ invalid value')

    await user.click(screen.getByText('Save property'))
    expect(screen.queryByText('Saving...')).not.toBeInTheDocument()

    expect(navigateFn).not.toHaveBeenCalled()
    expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties', 0)
  })
})
