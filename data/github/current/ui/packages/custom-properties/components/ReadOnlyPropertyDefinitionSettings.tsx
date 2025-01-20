import type {PropertyDefinition} from '@github-ui/custom-properties-types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {clsx} from 'clsx'
import type {PropsWithChildren} from 'react'

import {definitionTypeLabels} from '../helpers/definition-type-labels'
import styles from './ReadOnlyPropertyDefinitionSettings.module.css'

interface Props {
  definition: PropertyDefinition
}

export function ReadOnlyPropertyDefinitionSettings({definition}: Props) {
  const isText = definition.valueType === 'string'
  const isRegexSupported = useFeatureFlag('custom_properties_regex') && isText

  return (
    <div data-hpc className="border rounded-2">
      <div className="border-bottom text-bold bgColor-inset rounded-top-2 p-3">Property definition attributes</div>
      <DataRow label="Name" value={definition.propertyName} />
      <DataRow label="Description" value={definition.description || ''} />
      <DataRow label="Type" value={definitionTypeLabels[definition.valueType]} />
      {definition.allowedValues && (
        <DataRow label="Options" indent>
          {definition.allowedValues.join(', ')}
        </DataRow>
      )}
      {isRegexSupported && (
        <>
          <DataRow label="Match regular expression" value={definition.regex ? 'Enabled' : 'Disabled'} />
          {definition.regex && <DataRow label="Expression" value={definition.regex} indent />}
        </>
      )}
      <DataRow
        label="Allow repository actors to set this property"
        value={definition.valuesEditableBy === 'org_and_repo_actors' ? 'Enabled' : 'Disabled'}
      />
      <DataRow
        label="Require this property for new repositories"
        value={definition.defaultValue ? 'Enabled' : 'Disabled'}
      />
      {definition.defaultValue && (
        <DataRow label="Default value" indent>
          {Array.isArray(definition.defaultValue) ? definition.defaultValue.join(', ') : definition.defaultValue}
        </DataRow>
      )}
    </div>
  )
}

type DataRowProps = PropsWithChildren<{
  label: string
  value?: string | null
  indent?: boolean
}>

function DataRow({label, value, indent, children}: DataRowProps) {
  return (
    <div className={clsx(styles.dataRow, 'd-flex flex-row mx-3')}>
      <div className={clsx(styles.dataRowTitle, 'text-bold my-2', indent && 'pl-3')}>{label}</div>
      <div className="flex-1 my-2">{value || children}</div>
    </div>
  )
}
