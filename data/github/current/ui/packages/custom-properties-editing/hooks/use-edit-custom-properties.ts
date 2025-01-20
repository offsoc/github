import type {PropertyDefinition, PropertyValue, PropertyValuesRecord} from '@github-ui/custom-properties-types'
import {areEqualValues, getEmptyValueByType, isPropertyValueArray} from '@github-ui/custom-properties-types/helpers'
import {useDebounce} from '@github-ui/use-debounce'
import {type DependencyList, useCallback, useEffect, useMemo, useState} from 'react'

import {validateValue} from '../components/validate'

export interface PropertyField {
  value?: PropertyValue
  mixed: boolean
  changed: boolean
  propertyName: string
  error?: string
}

export function useEditCustomProperties(
  reposProperties: PropertyValuesRecord[],
  definitions: PropertyDefinition[],
  deps: DependencyList = [],
) {
  const [originalMergedValues, setOriginalMergedValues] = useState(() => mergeProperties(reposProperties))

  const regexPatternMap = useMemo(
    () => new Map(definitions.map(definition => [definition.propertyName, definition.regex || undefined])),
    [definitions],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [modifiedProperties, setModifiedProperties] = useState<Record<string, {value: PropertyValue}>>({})
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the implementation is the same as for the `useEffect` hook
  useEffect(() => setModifiedProperties({}), deps)

  function setPropertyValue(property: string, value: PropertyValue) {
    setModifiedProperties({...modifiedProperties, [property]: {value}})
    debouncedValidateError(property, value)
  }

  function revertPropertyValue(property: string) {
    const updatedProperties = {...modifiedProperties}
    delete updatedProperties[property]
    setModifiedProperties(updatedProperties)
    const updatedErrors = {...errors}
    delete updatedErrors[property] // the original value should be valid
    setErrors(updatedErrors)
  }

  function discardChanges() {
    setModifiedProperties({})
  }

  function commitChanges() {
    const modifiedPropertiesToCommit = Object.entries(modifiedProperties).reduce<Record<string, MergedValue>>(
      (acc, [propertyName, mergedValue]) => {
        acc[propertyName] = {value: mergedValue.value}
        return acc
      },
      {},
    )

    const committedProperties = {...originalMergedValues, ...modifiedPropertiesToCommit}

    setOriginalMergedValues(committedProperties)
    setModifiedProperties({})
  }

  const validateErrors = useCallback(
    async (propertyName: string, value?: PropertyValue) => {
      const error =
        value && !isPropertyValueArray(value) && (await validateValue(value, regexPatternMap.get(propertyName)))
      const updatedErrors = {...errors}
      delete updatedErrors[propertyName]
      if (error) {
        updatedErrors[propertyName] = error
      }
      setErrors(updatedErrors)
    },
    [errors, regexPatternMap],
  )

  const debouncedValidateError = useDebounce(validateErrors, 300, {onChangeBehavior: 'cancel'})

  const propertyValuesMap = useMemo<Record<string, PropertyField>>(() => {
    const propertyValuesWithoutErrors = Object.entries({...originalMergedValues, ...modifiedProperties}).reduce<
      Record<string, PropertyField>
    >((acc, [propertyName, update]) => {
      const originalValue = originalMergedValues[propertyName]
      const isModified = propertyName in modifiedProperties

      const mixed = isModified ? false : !!originalValue?.mixed

      if (mixed) {
        acc[propertyName] = {propertyName, changed: false, mixed: true}
      } else {
        const changed = isModified && (originalValue?.mixed || !areEqualValues(originalValue?.value, update.value))
        const value = isModified ? update.value : originalValue?.value
        const newEntry: PropertyField = {value, changed, propertyName, mixed: false}

        acc[propertyName] = newEntry
      }

      return acc
    }, {})

    for (const entry of Object.entries(errors)) {
      const [propertyName, error] = entry
      const valueMap = propertyValuesWithoutErrors[propertyName]
      if (valueMap) {
        valueMap.error = error
      }
    }

    return propertyValuesWithoutErrors
  }, [modifiedProperties, originalMergedValues, errors])

  return {propertyValuesMap, setPropertyValue, revertPropertyValue, discardChanges, commitChanges}
}

interface MergedValue {
  value?: PropertyValue
  mixed?: boolean
}

function mergeProperties(reposProperties: PropertyValuesRecord[]): Record<string, MergedValue> {
  const mergedValues: Record<string, MergedValue> = {}
  const propertiesCounter: Record<string, number> = {}
  for (const repoProperties of reposProperties) {
    for (const [propertyName, value] of Object.entries(repoProperties)) {
      const propertyValue = mergedValues[propertyName]
      if (!propertyValue) {
        mergedValues[propertyName] = {value}
      } else if (!areEqualValues(propertyValue.value, value)) {
        mergedValues[propertyName] = {mixed: true}
      }

      // Detect properties that are only present on some repos to consider them in the "mixed" state
      propertiesCounter[propertyName] ||= 0
      propertiesCounter[propertyName]++
    }
  }

  for (const [name, count] of Object.entries(propertiesCounter)) {
    const propertyValue = mergedValues[name]
    if (propertyValue && count < reposProperties.length) {
      mergedValues[name] = {mixed: true}
    }
  }

  return mergedValues
}

export function propertyFieldsToChangedPropertiesMap(
  definitions: PropertyDefinition[],
  valuesMap: Record<string, PropertyField>,
): PropertyValuesRecord {
  return definitions.reduce<PropertyValuesRecord>((acc, def) => {
    const field = valuesMap[def.propertyName]

    if (field?.changed) {
      acc[def.propertyName] = field.value || getEmptyValueByType(def.valueType)
    }

    return acc
  }, {})
}
