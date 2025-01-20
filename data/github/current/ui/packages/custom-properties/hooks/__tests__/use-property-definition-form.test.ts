import type {PropertyDefinition} from '@github-ui/custom-properties-types'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {act, renderHook, waitFor} from '@testing-library/react'

import {businessCustomPropertiesRoute, definitionsRoute} from '../../custom-properties'
import {getRouteWrapper} from '../../test-utils/RouteWrapper'
import {usePropertyDefinitionForm} from '../use-property-definition-form'

const definition: PropertyDefinition = {
  propertyName: 'env',
  valueType: 'single_select',
  allowedValues: ['prod', 'env'],
  description: 'description',
  required: true,
  defaultValue: 'prod',
  valuesEditableBy: 'org_and_repo_actors',
  regex: 'pattern',
}

const sampleProps = {
  existingPropertyNames: [],
}
describe('usePropertyDefinitionForm', () => {
  it('correctly inits fields in edit mode', () => {
    const {result} = renderOrgUsePropertyDefinitionFormHook({definition, ...sampleProps})

    const {
      propertyNameField,
      descriptionField,
      valueTypeField,
      allowedValuesField,
      defaultValueField,
      repoActorsEditingAllowedField,
      requiredField,
      regexField,
      regexEnabledField,
    } = result.current

    expect(propertyNameField.value).toEqual(definition.propertyName)
    expect(descriptionField.value).toEqual(definition.description)
    expect(valueTypeField.value).toEqual(definition.valueType)
    expect(allowedValuesField.value).toEqual(definition.allowedValues)
    expect(requiredField.value).toEqual(definition.required)
    expect(defaultValueField.value).toEqual(definition.defaultValue)
    expect(repoActorsEditingAllowedField.value).toEqual(definition.valuesEditableBy === 'org_and_repo_actors')
    expect(regexField.value).toEqual('pattern')
    expect(regexEnabledField.value).toEqual(true)
  })

  it('has correct init state', () => {
    const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

    const {
      propertyNameField,
      descriptionField,
      valueTypeField,
      allowedValuesField,
      defaultValueField,
      repoActorsEditingAllowedField,
      requiredField,
      newAllowedValueField,
    } = result.current

    expect(propertyNameField.value).toEqual('')
    expect(descriptionField.value).toEqual('')
    expect(valueTypeField.value).toEqual('string')
    expect(allowedValuesField.value).toEqual([])
    expect(requiredField.value).toEqual(false)
    expect(defaultValueField.value).toEqual('')
    expect(repoActorsEditingAllowedField.value).toEqual(false)
    expect(newAllowedValueField.value).toEqual('')
  })

  describe('validation', () => {
    it('skips validating property name if editing existing definition', async () => {
      const {result} = renderOrgUsePropertyDefinitionFormHook({
        definition,
        existingPropertyNames: [definition.propertyName],
      })

      await act(() => result.current.propertyNameField.validate())
      expect(result.current.propertyNameField.validationError).toBeUndefined()
    })

    it('displays duplicate message when returned from server for new business property name', async () => {
      const {result} = renderBizUsePropertyDefinitionFormHook(sampleProps)

      mockFetch.mockRouteOnce('/enterprises/acme-inc/settings/property_definition_name_check/environment', {
        status: 'already_exists',
        orgConflicts: null,
      })

      await act(async () => await result.current.propertyNameField.update('environment'))
      await waitFor(() =>
        expectMockFetchCalledTimes('/enterprises/acme-inc/settings/property_definition_name_check/environment', 1),
      )

      expect(result.current.propertyNameField.validationError).toEqual({message: 'Name already exists'})
    })

    it('displays "exists in org" message when returned from server for new business property name', async () => {
      const {result} = renderBizUsePropertyDefinitionFormHook(sampleProps)
      mockFetch.mockRouteOnce('/enterprises/acme-inc/settings/property_definition_name_check/environment', {
        status: 'exists_in_business_orgs',
        orgConflicts: null,
      })

      // Check debounce on inputs
      await act(async () => await result.current.propertyNameField.update('env'))
      await act(async () => await result.current.propertyNameField.update('environ'))
      await act(async () => await result.current.propertyNameField.update('environment'))
      await waitFor(() =>
        expectMockFetchCalledTimes('/enterprises/acme-inc/settings/property_definition_name_check/environment', 1),
      )

      expectMockFetchCalledTimes('/enterprises/acme-inc/settings/property_definition_name_check/env', 0)
      expectMockFetchCalledTimes('/enterprises/acme-inc/settings/property_definition_name_check/environ', 0)

      expect(result.current.propertyNameField.validationError).toEqual({
        message: 'The property environment already exists in this enterprise',
        orgConflicts: null,
      })
    })
  })

  describe('changing allowed values', () => {
    describe('single_select', () => {
      it('resets default value if selected value removed', async () => {
        const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

        await act(async () => await result.current.defaultValueField.update('value'))
        expect(result.current.defaultValueField.value).toEqual('value')

        await act(async () => await result.current.allowedValuesField.update(['another_values']))
        expect(result.current.allowedValuesField.value).toEqual(['another_values'])
        expect(result.current.defaultValueField.value).toEqual('')
      })

      it('keeps value if selected option remains valid', async () => {
        const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

        await act(async () => await result.current.defaultValueField.update('value'))
        expect(result.current.defaultValueField.value).toEqual('value')

        await act(async () => await result.current.allowedValuesField.update(['value', 'another_values']))
        expect(result.current.allowedValuesField.value).toEqual(['value', 'another_values'])
        expect(result.current.defaultValueField.value).toEqual('value')
      })

      it('validates empty allowed values', async () => {
        const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

        await act(async () => await result.current.valueTypeField.update('single_select'))
        await act(async () => await result.current.defaultValueField.update(['prod', 'dev']))
        expect(result.current.valueTypeField.value).toEqual('single_select')
        expect(result.current.defaultValueField.value).toEqual(['prod', 'dev'])

        await act(async () => await result.current.allowedValuesField.update([]))
        expect(result.current.defaultValueField.value).toEqual([])
        expect(result.current.allowedValuesField.validationError).toEqual('Property must have at least one option')
      })
    })

    describe('multi_select', () => {
      it('removes values that became invalid', async () => {
        const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

        await act(async () => await result.current.defaultValueField.update(['ios', 'web', 'macOS']))
        expect(result.current.defaultValueField.value).toEqual(['ios', 'web', 'macOS'])

        await act(async () => await result.current.allowedValuesField.update(['ios', 'web']))
        expect(result.current.allowedValuesField.value).toEqual(['ios', 'web'])
        expect(result.current.defaultValueField.value).toEqual(['ios', 'web'])
      })

      it('validates empty allowed values', async () => {
        const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

        await act(async () => await result.current.valueTypeField.update('multi_select'))
        await act(async () => await result.current.defaultValueField.update(['ios', 'web']))
        expect(result.current.valueTypeField.value).toEqual('multi_select')
        expect(result.current.defaultValueField.value).toEqual(['ios', 'web'])

        await act(async () => await result.current.allowedValuesField.update([]))
        expect(result.current.defaultValueField.value).toEqual([])
        expect(result.current.allowedValuesField.validationError).toEqual('Property must have at least one option')
      })
    })
  })

  describe('changing value type', () => {
    it('resets default value to the correct empty state', async () => {
      const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

      await act(async () => await result.current.defaultValueField.update('value'))
      expect(result.current.defaultValueField.value).toEqual('value')

      await act(async () => await result.current.valueTypeField.update('multi_select'))
      await act(async () => await result.current.allowedValuesField.update(['ios, web']))

      expect(result.current.valueTypeField.value).toEqual('multi_select')
      expect(result.current.defaultValueField.value).toEqual([])
      expect(result.current.allowedValuesField.value).toEqual(['ios, web'])

      await act(async () => await result.current.valueTypeField.update('string'))
      expect(result.current.valueTypeField.value).toEqual('string')
      expect(result.current.defaultValueField.value).toEqual('')
      // Preserves allowed values in case user switches back to single_select or multi_select
      expect(result.current.allowedValuesField.value).toEqual(['ios, web'])
    })

    it('resets regex fields', async () => {
      const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

      mockFetch.mockRoute('/repos/validate_regex/pattern', undefined, {
        ok: true,
        json: async () => ({
          valid: true,
        }),
      })

      await act(async () => await result.current.regexEnabledField.update(true))
      await act(async () => await result.current.regexField.update('pattern'))
      expect(result.current.regexEnabledField.value).toEqual(true)
      expect(result.current.regexField.value).toEqual('pattern')

      await act(async () => await result.current.valueTypeField.update('single_select'))
      expect(result.current.regexEnabledField.value).toEqual(false)
      expect(result.current.regexField.value).toEqual('')
    })
  })

  describe('changing required', () => {
    it('clears default value when property becomes non-required', async () => {
      const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

      expect(result.current.valueTypeField.value).toEqual('string')
      expect(result.current.requiredField.value).toEqual(false)
      expect(result.current.defaultValueField.value).toEqual('')

      await act(async () => await result.current.requiredField.update(true))
      expect(result.current.requiredField.value).toEqual(true)

      await act(async () => await result.current.defaultValueField.update('value'))
      expect(result.current.defaultValueField.value).toEqual('value')

      await act(async () => await result.current.requiredField.update(false))
      expect(result.current.requiredField.value).toEqual(false)
      expect(result.current.defaultValueField.value).toEqual('')
    })

    it('clears default value when property becomes for multi_select', async () => {
      const {result} = renderOrgUsePropertyDefinitionFormHook(sampleProps)

      await act(async () => await result.current.valueTypeField.update('multi_select'))
      await act(async () => await result.current.requiredField.update(true))
      expect(result.current.valueTypeField.value).toEqual('multi_select')
      expect(result.current.requiredField.value).toEqual(true)

      await act(async () => await result.current.defaultValueField.update(['ios', 'web']))
      expect(result.current.defaultValueField.value).toEqual(['ios', 'web'])

      await act(async () => await result.current.requiredField.update(false))
      expect(result.current.requiredField.value).toEqual(false)
      expect(result.current.defaultValueField.value).toEqual([])
    })
  })
})

const renderOrgUsePropertyDefinitionFormHook = (initialProps?: {
  definition?: PropertyDefinition
  existingPropertyNames: string[]
}) =>
  renderHook(usePropertyDefinitionForm, {
    initialProps,
    wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
  })

const renderBizUsePropertyDefinitionFormHook = (initialProps?: {
  definition?: PropertyDefinition
  existingPropertyNames: string[]
}) =>
  renderHook(usePropertyDefinitionForm, {
    initialProps,
    wrapper: getRouteWrapper('/enterprises/acme-inc/settings/custom-properties', businessCustomPropertiesRoute),
  })
