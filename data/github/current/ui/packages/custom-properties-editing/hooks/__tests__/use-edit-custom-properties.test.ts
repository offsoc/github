import type {PropertyDefinition, PropertyValue, PropertyValuesRecord} from '@github-ui/custom-properties-types'
import {act, renderHook, waitFor} from '@testing-library/react'

import {useEditCustomProperties} from '../use-edit-custom-properties'

const githubProperties = {
  env: 'production',
  framework: 'rails',
  platform: ['ios', 'web'],
}

const smileProperties = {
  env: 'test',
  framework: 'rails',
  team: 'monas',
  platform: ['android', 'web'],
}

describe('useEditCustomProperties - multiple repos', () => {
  const reposProperties = [githubProperties, smileProperties]
  it('returns correct initial list', () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('returns correct initial list many repos', () => {
    const {result} = renderUseEditCustomProperties([githubProperties, smileProperties, githubProperties])

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('returns correct initial list when repo has no properties', () => {
    const {result} = renderUseEditCustomProperties([githubProperties, {}])

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: true, value: undefined, changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
    ])
  })

  it('updates property value', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('updates property value to the same value must not be marked as `changed`', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('framework', 'rails'))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('updates property value to null', () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    act(() => result.current.setPropertyValue('env', ''))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: '', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('reverts property value', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])

    act(() => result.current.revertPropertyValue('env'))
    act(() => result.current.revertPropertyValue('platform'))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('resets state if dependency changes', async () => {
    const {result, rerender} = renderUseEditCustomProperties(reposProperties, [], ['a'])

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])

    rerender({reposProperties, definitions: [], deps: ['b']})

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })

  it('preserves state if dependency is unchanged', async () => {
    const deps = [{propertyName: 'foo'}]
    const {result, rerender} = renderUseEditCustomProperties(reposProperties, [], deps)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    const expected = [
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ]

    expect(Object.values(result.current.propertyValuesMap)).toEqual(expected)

    rerender({reposProperties, definitions: [], deps})

    expect(Object.values(result.current.propertyValuesMap)).toEqual(expected)
  })

  it('preserves state if dependency is not provided', async () => {
    const {result, rerender} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    const expected = [
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ]

    expect(Object.values(result.current.propertyValuesMap)).toEqual(expected)

    rerender({reposProperties, definitions: [], deps: []})

    expect(Object.values(result.current.propertyValuesMap)).toEqual(expected)
  })

  it('resets state if discard is called', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])

    act(() => result.current.discardChanges())

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: true, value: undefined, changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: true, value: undefined, changed: false},
      {propertyName: 'team', mixed: true, value: undefined, changed: false},
    ])
  })
})

describe('useEditCustomProperties - single repo', () => {
  const reposProperties = [githubProperties]
  it('returns correct initial list', () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'production', changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['ios', 'web'], changed: false},
    ])
  })

  it('returns correct initial when no properties', () => {
    const {result} = renderUseEditCustomProperties([{}])

    expect(Object.values(result.current.propertyValuesMap)).toEqual([])
  })

  it('updates property value', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    act(() => result.current.setPropertyValue('platform', ['windows', 'macOS']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'staging', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['windows', 'macOS'], changed: true},
    ])
  })

  it('updates property value to null', () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    act(() => result.current.setPropertyValue('env', ''))
    act(() => result.current.setPropertyValue('platform', []))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: '', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: [], changed: true},
    ])
  })

  it('updates property value to the same value must not be marked as `changed`', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('framework', 'rails'))
    act(() => result.current.setPropertyValue('platform', ['ios', 'web']))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'production', changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['ios', 'web'], changed: false},
    ])
  })

  it('reverts property value', () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    act(() => result.current.setPropertyValue('env', ''))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: '', changed: true},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['ios', 'web'], changed: false},
    ])

    act(() => result.current.revertPropertyValue('env'))

    expect(Object.values(result.current.propertyValuesMap)).toEqual([
      {propertyName: 'env', mixed: false, value: 'production', changed: false},
      {propertyName: 'framework', mixed: false, value: 'rails', changed: false},
      {propertyName: 'platform', mixed: false, value: ['ios', 'web'], changed: false},
    ])
  })

  it('validates property value', async () => {
    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'invalid"value'))

    await waitFor(() =>
      expect(Object.values(result.current.propertyValuesMap)).toEqual([
        {
          propertyName: 'env',
          value: 'invalid"value',
          changed: true,
          mixed: false,
          error: 'Contains invalid characters: "',
        },
        {propertyName: 'framework', value: 'rails', mixed: false, changed: false},
        {propertyName: 'platform', mixed: false, value: ['ios', 'web'], changed: false},
      ]),
    )
  })
})

describe('useEditCustomProperties - initial propertyValuesMap', () => {
  it('returns correct initial list for one repo', () => {
    expectValuesMap([{}]).toEqual({})

    expectValuesMap([{one: '1'}]).toEqual({
      one: {value: '1'},
    })

    expectValuesMap([{one: '1', two: '2', three: '3'}]).toEqual({
      one: {value: '1'},
      two: {value: '2'},
      three: {value: '3'},
    })
  })

  it('returns correct initial list for two repos with one property', () => {
    expectValuesMap([{one: '1'}, {}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: 'XYZ'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: '1'}]).toEqual({
      one: {value: '1'},
    })
  })

  it('returns correct initial list for three repos with one property', () => {
    expectValuesMap([{one: '1'}, {}, {one: '1'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: '1'}, {}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{}, {one: '1'}, {one: '1'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: 'XYZ'}, {one: '1'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: '1'}, {one: 'XYZ'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: 'XYZ'}, {one: '1'}, {one: '1'}]).toEqual({
      one: {value: undefined, mixed: true},
    })

    expectValuesMap([{one: '1'}, {one: '1'}, {one: '1'}]).toEqual({
      one: {value: '1'},
    })
  })

  it('returns correct initial list for two repos with two properties', () => {
    expectValuesMap([{one: '1'}, {two: '2'}]).toEqual({
      one: {value: undefined, mixed: true},
      two: {value: undefined, mixed: true},
    })

    expectValuesMap([
      {one: '1', two: 'XYZ'},
      {one: 'XYZ', two: '2'},
    ]).toEqual({
      one: {value: undefined, mixed: true},
      two: {value: undefined, mixed: true},
    })

    expectValuesMap([
      {one: '1', two: '2'},
      {one: '1', two: '2'},
    ]).toEqual({
      one: {value: '1'},
      two: {value: '2'},
    })
  })
})

describe('useEditCustomProperties - saving', () => {
  it('commitProperties does not have pending changes on commit', async () => {
    const reposProperties = [githubProperties, smileProperties]

    const {result} = renderUseEditCustomProperties(reposProperties)

    await act(async () => result.current.setPropertyValue('env', 'staging'))
    expect(Object.values(result.current.propertyValuesMap).some(p => p.changed)).toBeTruthy()

    await act(async () => result.current.commitChanges())
    expect(Object.values(result.current.propertyValuesMap).some(p => p.changed)).toBeFalsy()
  })

  it('commitProperties has no effect for no changes', async () => {
    const reposProperties = [githubProperties, smileProperties]

    const {result} = renderUseEditCustomProperties(reposProperties)

    expect(Object.values(result.current.propertyValuesMap).some(p => p.changed)).toBeFalsy()

    await act(async () => result.current.commitChanges())
    expect(Object.values(result.current.propertyValuesMap).some(p => p.changed)).toBeFalsy()
  })
})

function expectValuesMap(initialProps: PropertyValuesRecord[]): jest.Matchers {
  const {result} = renderUseEditCustomProperties(initialProps)
  const map = result.current.propertyValuesMap
  const simpleMap = Object.keys(map).reduce<Record<string, {value?: PropertyValue; mixed?: true}>>((acc, key) => {
    acc[key] = {value: map[key]!.value}
    if (map[key]!.mixed) {
      acc[key].mixed = true
    }
    return acc
  }, {})
  // eslint-disable-next-line jest/valid-expect
  return expect(simpleMap)
}

function renderUseEditCustomProperties(
  reposProperties: PropertyValuesRecord[],
  definitions: PropertyDefinition[] = [],
  deps: unknown[] = [],
) {
  return renderHook(props => useEditCustomProperties(props.reposProperties, props.definitions, props.deps), {
    initialProps: {reposProperties, definitions, deps},
  })
}
