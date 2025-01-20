import {buildQueryForProperty, buildQueryForAllProperties} from '../custom-properties-query'
import type {PropertyConfiguration, RepositoryPropertyParameters} from '../../types/rules-types'

describe('buildQueryForAllProperties', () => {
  const properties: RepositoryPropertyParameters = {
    include: [
      {
        name: 'language',
        source: 'system',
        property_values: ['go'],
      },
    ],
    exclude: [
      {
        name: 'database',
        source: 'custom',
        property_values: ['postgresql'],
      },
    ],
  }

  it('builds a query for a repo with no properties', () => {
    expect(buildQueryForAllProperties({include: [], exclude: []} as RepositoryPropertyParameters)).toEqual('')
  })

  it('builds a query for a repo', () => {
    expect(buildQueryForAllProperties(properties)).toEqual('language:go -props.database:postgresql')
  })

  it('builds a query for a repo with multiple include properties', () => {
    const multiValueProperties: RepositoryPropertyParameters = {
      include: [
        ...properties.include,
        {
          name: 'database',
          source: 'custom',
          property_values: ['mysql', 'postgresql'],
        },
      ],
      exclude: [],
    }

    expect(buildQueryForAllProperties(multiValueProperties)).toEqual('language:go props.database:mysql,postgresql')
  })

  it('builds a query for a repo with space in the value', () => {
    const valueWithSpaceProperties: RepositoryPropertyParameters = {
      include: [
        ...properties.include,
        {
          name: 'database',
          source: 'custom',
          property_values: ['dim grey', 'blue', 'carbon black'],
        },
      ],
      exclude: [],
    }

    expect(buildQueryForAllProperties(valueWithSpaceProperties)).toEqual(
      'language:go props.database:"dim grey",blue,"carbon black"',
    )
  })
})

describe('buildQueryForProperty', () => {
  it('builds a query for a system property', () => {
    const property: PropertyConfiguration = {
      name: 'fork',
      source: 'system',
      property_values: ['true'],
    }
    expect(buildQueryForProperty(property, '')).toEqual('fork:true')
    expect(buildQueryForProperty(property, '-')).toEqual('-fork:true')
  })

  it('builds a query for a custom property', () => {
    const property: PropertyConfiguration = {
      name: 'database',
      source: 'custom',
      property_values: ['mysql'],
    }
    expect(buildQueryForProperty(property, '')).toEqual('props.database:mysql')
    expect(buildQueryForProperty(property, '-')).toEqual('-props.database:mysql')
  })

  it('builds a query for multiple values', () => {
    const property: PropertyConfiguration = {
      name: 'database',
      source: 'custom',
      property_values: ['mysql', 'postgresql'],
    }
    expect(buildQueryForProperty(property, '')).toEqual('props.database:mysql,postgresql')
    expect(buildQueryForProperty(property, '-')).toEqual('-props.database:mysql,postgresql')
  })

  it('builds a query for properties with space in the value', () => {
    const property: PropertyConfiguration = {
      name: 'database',
      source: 'custom',
      property_values: ['dim grey', 'blue', 'carbon black'],
    }
    expect(buildQueryForProperty(property, '')).toEqual('props.database:"dim grey",blue,"carbon black"')
    expect(buildQueryForProperty(property, '-')).toEqual('-props.database:"dim grey",blue,"carbon black"')
  })
})
