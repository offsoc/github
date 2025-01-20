import type {FC} from 'react'
import type React from 'react'
import {useCallback, useMemo, useState} from 'react'
import type {
  ConditionParameters,
  PropertyConfiguration,
  PropertyDescriptor,
  PropertySource,
  RepositoryPropertyParameters,
  RulesetTarget,
} from '../../../types/rules-types'
import {TargetsTable, type IncludeExcludeType} from '../TargetsTable'
import {ActionList, ActionMenu, Flash, Octicon} from '@primer/react'
import {PlusCircleIcon, XCircleIcon} from '@primer/octicons-react'
import {AddPropertyDialog} from './AddPropertyDialog'
import {useRelativeNavigation} from '../../../hooks/use-relative-navigation'
import {getAvailableProperties} from '../../../services/api'

export interface RepositoryPropertyTargetProps {
  parameters: RepositoryPropertyParameters
  readOnly: boolean
  updateParameters: (parameters: ConditionParameters) => void
  headerRowText?: string
  rulesetTarget: RulesetTarget
  blankslate: {
    heading: string
    description?: React.ReactNode
  }
}

const INCLUDE_EXCLUDE_VALUES: IncludeExcludeType[] = ['include', 'exclude']

export const RepositoryPropertyTarget: FC<RepositoryPropertyTargetProps> = ({
  readOnly,
  parameters,
  updateParameters,
  headerRowText,
  rulesetTarget,
  blankslate,
}) => {
  const [selectedActionType, setSelectedActionType] = useState<IncludeExcludeType>('include')
  const [addPropertyVisible, setAddPropertyVisible] = useState(false)
  const [properties, setProperties] = useState<PropertyDescriptor[]>([])
  const [arePropertiesFetched, setPropertiesFetched] = useState(false)

  const {resolvePath} = useRelativeNavigation()

  const onActionSelect = async (actionType: IncludeExcludeType) => {
    setSelectedActionType(actionType)
    setAddPropertyVisible(true)
    if (!arePropertiesFetched) {
      const result = await getAvailableProperties(resolvePath('../available_properties'), rulesetTarget)
      setProperties(result.properties)
      setPropertiesFetched(true)
    }
  }

  const showLanguageWarning = useMemo(
    () =>
      parameters.include.some(p => p.name === 'language' && p.source === 'system') ||
      parameters.exclude.some(p => p.name === 'language' && p.source === 'system'),
    [parameters],
  )

  const addProperty = (name: string, source: PropertySource, values: string[]) => {
    if (readOnly || name.length === 0 || values.length === 0) {
      return
    }

    switch (selectedActionType) {
      case 'include':
        if (!parameters.include.some(p => isSameProperty(name, source, p))) {
          updateParameters({
            ...parameters,
            include: [...parameters.include, {name, source, property_values: values}],
          })
        }
        break
      case 'exclude':
        if (!parameters.exclude.some(p => isSameProperty(name, source, p))) {
          updateParameters({
            ...parameters,
            exclude: [...parameters.exclude, {name, source, property_values: values}],
          })
        }
        break
    }
  }

  const removeProperty = useCallback(
    (type: IncludeExcludeType, name: string, source: PropertySource | undefined) => {
      if (readOnly || !name) {
        return
      }

      switch (type) {
        case 'include':
          updateParameters({
            ...parameters,
            include: parameters.include.filter(p => !isSameProperty(name, source, p)),
          })
          break
        case 'exclude':
          updateParameters({
            ...parameters,
            exclude: parameters.exclude.filter(p => !isSameProperty(name, source, p)),
          })
          break
      }
    },
    [parameters, readOnly, updateParameters],
  )

  const targets = useMemo(() => {
    function toTargetItem(property: PropertyConfiguration, type: IncludeExcludeType) {
      const value = property.property_values.join(', ')

      const prefix = property.source === 'system' ? property.name : `props.${property.name}`

      return {
        type,
        prefix,
        value,
        display: property.property_values,
        onRemove: () => removeProperty(type, property.name, property.source),
      }
    }

    return [
      ...parameters.include.map(p => toTargetItem(p, 'include')),
      ...parameters.exclude.map(p => toTargetItem(p, 'exclude')),
    ]
  }, [parameters, removeProperty])

  const filteredProperties: PropertyDescriptor[] = properties.filter(p => {
    const existingProperties = selectedActionType === 'include' ? parameters.include : parameters.exclude
    return !existingProperties.some(ep => ep.name === p.name && (ep.source || 'custom') === p.source)
  })

  return (
    <>
      <TargetsTable
        renderTitle={() => <h3 className="Box-title">Target by repository properties</h3>}
        renderAction={() => (
          <ActionMenu>
            <ActionMenu.Button>Add a target</ActionMenu.Button>

            <ActionMenu.Overlay width="medium">
              <ActionList>
                {INCLUDE_EXCLUDE_VALUES.map(includeOrExclude => (
                  <ActionList.Item key={includeOrExclude} onSelect={() => onActionSelect(includeOrExclude)}>
                    <ActionList.LeadingVisual>
                      {includeOrExclude === 'include' ? (
                        <Octicon icon={PlusCircleIcon} sx={{color: 'success.fg'}} />
                      ) : (
                        <Octicon icon={XCircleIcon} sx={{color: 'danger.fg'}} />
                      )}
                    </ActionList.LeadingVisual>
                    {includeOrExclude === 'include' ? 'Include by property' : 'Exclude by property'}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
        blankslate={blankslate}
        headerRowText={headerRowText}
        targets={targets}
        readOnly={readOnly}
      />

      {readOnly || !addPropertyVisible ? null : (
        <AddPropertyDialog
          properties={filteredProperties}
          onAdd={(name, source, values) => {
            addProperty(name, source, values)
            setAddPropertyVisible(false)
          }}
          onClose={() => setAddPropertyVisible(false)}
          includeOrExclude={selectedActionType}
        />
      )}

      {showLanguageWarning && (
        <Flash
          sx={{
            fontSize: 0,
            p: 2,
            my: 2,
            borderRadius: 2,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'warning.muted',
          }}
        >
          Please note that the &apos;language&apos; property is determined by the current contents of the repository. As
          new commits are made the language may change, which could affect the evaluation of this property.
        </Flash>
      )}
    </>
  )
}

function isSameProperty(name: string, source: PropertySource = 'custom', property: PropertyConfiguration) {
  return property.name === name && (property.source || 'custom') === source
}
