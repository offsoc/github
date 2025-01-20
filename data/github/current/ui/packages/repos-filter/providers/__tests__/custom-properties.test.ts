import {FilterProviderType} from '@github-ui/filter'

import {getCustomPropertiesProviders, type PropertyDefinition} from '../custom-properties'

const sampleDefinitions: PropertyDefinition[] = [
  {
    propertyName: 'env',
    allowedValues: ['dev', 'prod', 'test'],
    valueType: 'single_select',
    required: true,
  },
  {
    propertyName: 'owner',
    valueType: 'string',
  },
  {
    propertyName: 'yesno',
    valueType: 'true_false',
  },
  {
    propertyName: 'platform',
    valueType: 'multi_select',
    allowedValues: ['android', 'ios', 'web'],
  },
]

describe('getCustomPropertiesProviders', () => {
  test('creates one provider per definition, shows None if `no` qualifier is disabled', () => {
    const providers = getCustomPropertiesProviders(sampleDefinitions)

    expect(providers).toHaveLength(4)

    const selectProvider = providers[0]!
    expect(selectProvider.displayName).toEqual('Property: env')
    expect(selectProvider.key).toEqual('props.env')
    expect(selectProvider.type).toBe(FilterProviderType.Select)
    expect(selectProvider.filterValues.map(item => item.value)).toEqual(['dev', 'prod', 'test'])

    const textProvider = providers[1]!
    expect(textProvider.displayName).toEqual('Property: owner')
    expect(textProvider.key).toEqual('props.owner')
    expect(textProvider.type).toBe(FilterProviderType.Text)
    expect(textProvider.filterValues).toEqual([])

    const boolProvider = providers[2]!
    expect(boolProvider.displayName).toEqual('Property: yesno')
    expect(boolProvider.key).toEqual('props.yesno')
    expect(boolProvider.type).toBe(FilterProviderType.Boolean)
    expect(boolProvider.filterValues.map(item => item.value)).toEqual(['true', 'false'])

    const multiSelectProvider = providers[3]!
    expect(multiSelectProvider.displayName).toEqual('Property: platform')
    expect(multiSelectProvider.key).toEqual('props.platform')
    expect(multiSelectProvider.type).toBe(FilterProviderType.Select)
    expect(multiSelectProvider.filterValues.map(item => item.value)).toEqual(['android', 'ios', 'web'])
  })

  test('shows no: qualifier only for non-required properties', () => {
    const providers = getCustomPropertiesProviders(sampleDefinitions)

    expect(providers).toHaveLength(4)

    const selectProvider = providers[0]!
    expect(selectProvider.options.filterTypes.valueless).toBeFalsy()

    const textProvider = providers[1]!
    expect(textProvider.options.filterTypes.valueless).toBeTruthy()

    const boolProvider = providers[2]!
    expect(boolProvider.options.filterTypes.valueless).toBeTruthy()

    const multiSelectProvider = providers[3]!
    expect(multiSelectProvider.options.filterTypes.valueless).toBeTruthy()
  })
})
