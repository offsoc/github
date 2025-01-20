import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {StopIcon} from '@primer/octicons-react'
import {Box, Button, ConfirmationDialog, FormControl, Heading, Octicon, Text, TextInput} from '@primer/react'
import {memo, useCallback, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'

import {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {
  SettingsFieldDelete,
  SettingsFieldDeleteUI,
  SettingsFieldRename,
  SettingsFieldRenameSettingsUI,
} from '../../../api/stats/contracts'
import {getColumnIcon, getColumnText} from '../../../components/column-detail-helpers'
import {Blankslate} from '../../../components/common/blankslate'
import {errorStyle} from '../../../components/common/state-style-decorators'
import {SingleSelectOptions} from '../../../components/fields/single-select/single-select-options'
import {useHorizontalGroupedBy} from '../../../features/grouping/hooks/use-horizontal-grouped-by'
import {getColumnWarning} from '../../../helpers/get-column-warning'
import {isColumnUserEditable} from '../../../helpers/is-column-editable'
import {not_typesafe_nonNullAssertion} from '../../../helpers/non-null-assertion'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useAutosave} from '../../../hooks/use-autosave'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useViews} from '../../../hooks/use-views'
import {useVisibleFields} from '../../../hooks/use-visible-fields'
import type {ColumnModel} from '../../../models/column-model'
import {useNavigate} from '../../../router'
import {useProjectRouteParams} from '../../../router/use-project-route-params'
import {PROJECT_SETTINGS_FIELD_ROUTE} from '../../../routes'
import {useCountItemsWithColumnValue} from '../../../state-providers/column-values/use-count-items-with-column-value'
import {useAllColumns} from '../../../state-providers/columns/use-all-columns'
import {useSetColumnName} from '../../../state-providers/columns/use-set-column-name'
import {useCustomFieldsSettings} from '../../../state-providers/settings/use-custom-fields-settings'
import {useWorkflows} from '../../../state-providers/workflows/use-workflows'
import {Resources} from '../../../strings'
import {CONTENT_WIDTH} from '../constants'
import {ColumnSettingsBanner} from './column-settings-banner'
import {IterationConfigurationView} from './iteration-configuration-view'
import {ProgressConfigurationView} from './progress-configuration-view'

export const ColumnSettingsView: React.FC = () => {
  const {allColumns} = useAllColumns()
  const {sub_issues} = useEnabledFeatures()
  const {fieldId} = useParams<'fieldId'>()
  const navigate = useNavigate()
  const projectRouteParams = useProjectRouteParams()
  const userEditableColumns = useMemo(() => {
    return allColumns.filter(column => {
      return isColumnUserEditable(column, {sub_issues})
    })
  }, [allColumns, sub_issues])

  const column = useMemo(
    () => (fieldId !== undefined ? userEditableColumns.find(c => `${c.id}` === fieldId) : undefined),
    [userEditableColumns, fieldId],
  )

  const headingName = `${column?.name} field settings`

  const {setCurrentColumnTitle} = useCustomFieldsSettings()
  setCurrentColumnTitle(headingName)

  const {postStats} = usePostStats()
  const {updateName} = useSetColumnName()

  const onUpdateColumnName = useCallback(
    async (name: string) => {
      if (!column) return
      if (name === column.name) return

      await updateName(column, name)

      postStats({
        name: SettingsFieldRename,
        ui: SettingsFieldRenameSettingsUI,
        context: `new name: ${name}, original name: ${column.name}`,
        memexProjectColumnId: column.id,
      })
    },
    [column, postStats, updateName],
  )

  const {localValue, isError, isSuccess, inputProps} = useAutosave({
    initialValue: column?.name ?? '',
    commitFn: onUpdateColumnName,
  })

  const autocompleteProps = useEmojiAutocomplete()

  if (!column) {
    return <NoFieldFound />
  }

  const Icon = getColumnIcon(column.dataType)
  const columnWarning = getColumnWarning(column)

  return (
    <Box sx={{flexDirection: 'column', flex: 1, display: 'flex'}} {...testIdProps(`column-settings-${column.name}`)}>
      {columnWarning && <ColumnSettingsBanner warning={columnWarning} column={column} />}
      <Box
        sx={{
          borderBottomColor: 'border.muted',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          mb: 3,
        }}
      >
        <Heading
          as="h2"
          sx={{
            fontSize: 4,
            fontWeight: 'normal',
          }}
        >
          {headingName}
        </Heading>
        {column.userDefined ? (
          <DeleteField
            column={column}
            numberOfColumns={userEditableColumns.length}
            onDeleteColumn={() => {
              const index = userEditableColumns.findIndex(col => col.id === column.id)

              navigate(
                PROJECT_SETTINGS_FIELD_ROUTE.generatePath({
                  ...projectRouteParams,
                  fieldId: not_typesafe_nonNullAssertion(userEditableColumns[Math.max(0, index - 1)]).id,
                }),
                {replace: true},
              )
            }}
          />
        ) : null}
      </Box>
      <Box sx={{pb: 2, mb: 2}}>
        <FormControl>
          <FormControl.Label>Field name</FormControl.Label>

          {column.userDefined ? (
            <InlineAutocomplete {...autocompleteProps}>
              {/* NOTE: The error styles are passed in manually here, but FormControl automatically
                    supplies this when an error validation is visible. For some reason, the InlineAutocomplete
                    component interrupts this and stops it from working. */}
              <TextInput
                key={column.id}
                value={localValue}
                {...inputProps}
                sx={{width: CONTENT_WIDTH, ...(isError ? errorStyle : {})}}
              />
            </InlineAutocomplete>
          ) : (
            <TextInput sx={{width: CONTENT_WIDTH}} disabled value={column.name} />
          )}
          {!column.userDefined && (
            <FormControl.Caption>{column.name} fields are created by GitHub and cannot be renamed.</FormControl.Caption>
          )}
          {isError && (
            <FormControl.Validation variant="error">
              {localValue.length === 0 ? Resources.requiredFieldErrorMessage : Resources.genericErrorMessage}
            </FormControl.Validation>
          )}
          {isSuccess && <FormControl.Validation variant="success">Saved!</FormControl.Validation>}
        </FormControl>
      </Box>
      <div>
        <Box sx={{fontWeight: 'bold', mb: 1}}>Field type</Box>
        <Button leadingVisual={Icon} disabled>
          {getColumnText(column.dataType)}
        </Button>
      </div>
      <ConfigurationOptions column={column} />
    </Box>
  )
}

const DeleteField = ({
  column,
  numberOfColumns,
  onDeleteColumn,
}: {
  column: ColumnModel
  numberOfColumns: number
  onDeleteColumn: () => void
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button variant="danger" onClick={() => setIsDialogOpen(true)}>
        Delete field
      </Button>
      <DeleteFieldDialog
        numberOfColumns={numberOfColumns}
        columnModel={column}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        onDeleteColumn={onDeleteColumn}
      />
    </>
  )
}

const ConfigurationOptions: React.FC<{column: ColumnModel}> = memo(function ConfigurationOptions({column}) {
  switch (column.dataType) {
    case MemexColumnDataType.Iteration: {
      return <IterationConfigurationView column={column} />
    }
    case MemexColumnDataType.SingleSelect: {
      return <SingleSelectOptions column={column} />
    }
    case MemexColumnDataType.SubIssuesProgress: {
      return <ProgressConfigurationView column={column} />
    }
    default: {
      return null
    }
  }
})

const NoFieldFound = memo(function NoFieldFound() {
  return (
    <Blankslate
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        display: 'flex',
        flexGrow: 1,
        my: 3,
      }}
    >
      <Octicon icon={StopIcon} size={30} sx={{color: 'danger.fg'}} />
      <h2>This field no longer exists</h2>
      <Text as="p" sx={{color: 'fg.muted'}}>
        Select another field to view settings.
      </Text>
    </Blankslate>
  )
})

type BodyTextProps = {
  columnModel: ColumnModel
}

const BodyText = ({columnModel}: BodyTextProps) => {
  const {getCountOfItemsWithColumnValue} = useCountItemsWithColumnValue()

  const rowCount = getCountOfItemsWithColumnValue(columnModel.id)
  const workFlowsCount = useWorkflows().workflows.filter(wf =>
    wf.actions.some(action => action.arguments.fieldId === columnModel.databaseId),
  ).length

  const initialText = Resources.deleteField(columnModel.name)

  const isUsedInRowsOrWorkflows = rowCount > 0 || workFlowsCount > 0

  if (!isUsedInRowsOrWorkflows) {
    return <>{initialText}.</>
  }

  const rowsAreAffected = rowCount > 0
  const automationsAreAffected = workFlowsCount > 0

  const bodyText = (
    <>
      and remove its data from{' '}
      {rowsAreAffected ? (
        <strong>
          {rowCount} {rowCount !== 1 ? 'items' : 'item'}
        </strong>
      ) : null}
      {rowsAreAffected && automationsAreAffected ? ' and ' : null}
      {automationsAreAffected ? (
        <strong>
          {workFlowsCount} {workFlowsCount !== 1 ? 'workflows' : 'workflow'}
        </strong>
      ) : null}
      .
    </>
  )

  return (
    <>
      <p>
        {initialText} {bodyText}
      </p>
      <p>
        <Text sx={{fontWeight: 'bold'}}>Permanently delete data from this project?</Text>
      </p>
    </>
  )
}

const DeleteFieldDialog = ({
  isDialogOpen,
  columnModel,
  numberOfColumns,
  setIsDialogOpen,
  onDeleteColumn,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  columnModel: ColumnModel
  numberOfColumns: number
  onDeleteColumn?: () => void
}) => {
  const {currentView} = useViews()
  const {removeField} = useVisibleFields()
  const {postStats} = usePostStats()
  const {groupedByColumn, clearGroupedBy} = useHorizontalGroupedBy()

  const deleteColumn = useCallback(() => {
    const {id, name: columnName, dataType} = columnModel

    const isGroupedByColumn = currentView && groupedByColumn?.id === id

    if (isGroupedByColumn) {
      clearGroupedBy(currentView.number)
    }

    removeField(columnModel)

    postStats({
      name: SettingsFieldDelete,
      ui: SettingsFieldDeleteUI,
      context: `name: ${columnName}, dataType: ${dataType}, total fields: ${numberOfColumns}`,
      memexProjectColumnId: id,
    })
    onDeleteColumn?.()
  }, [
    columnModel,
    onDeleteColumn,
    numberOfColumns,
    currentView,
    groupedByColumn?.id,
    removeField,
    postStats,
    clearGroupedBy,
  ])

  const closeDialog = useCallback(
    (gesture: string) => {
      setIsDialogOpen(false)
      if (gesture === 'confirm') {
        deleteColumn()
      }
    },
    [deleteColumn, setIsDialogOpen],
  )

  if (!isDialogOpen) return null
  return (
    <ConfirmationDialog
      onClose={closeDialog}
      title={Resources.deleteFieldDialogTitle}
      confirmButtonContent="Delete field and data"
      confirmButtonType="danger"
    >
      <BodyText columnModel={columnModel} />
    </ConfirmationDialog>
  )
}
