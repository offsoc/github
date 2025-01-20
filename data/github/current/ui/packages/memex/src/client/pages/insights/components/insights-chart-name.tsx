import {testIdProps} from '@github-ui/test-id-props'
import {PencilIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, FormControl, Heading, IconButton, TextInput} from '@primer/react'
import {memo, type RefObject, useCallback, useRef, useState} from 'react'
import type {SpaceProps, TypographyProps} from 'styled-system'

import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import type {ChartState} from '../../../state-providers/charts/use-charts'
import {useInsightsChartName} from '../hooks/use-insights-chart-name'

interface InsightsChartNameProps {
  chart: ChartState
}

export const InsightsChartName = memo(function InsightsChartName({
  chart,
}: TypographyProps & SpaceProps & InsightsChartNameProps) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {chartName} = useInsightsChartName(chart)

  const [isEditingName, setIsEditingName] = useState(false)
  const editButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 1,
            mx: -1,
          }}
        >
          <Box sx={{fontSize: 3, fontWeight: 600}} {...testIdProps('insights-chart-name')}>
            {chartName}
          </Box>
          {hasWritePermissions && (
            <IconButton
              ref={editButtonRef}
              icon={PencilIcon}
              onClick={() => setIsEditingName(true)}
              variant="invisible"
              aria-label="Edit chart name"
              {...testIdProps('chart-name-edit-button')}
            />
          )}
        </Box>
      </Box>
      <ChartNameEditorDialog
        chart={chart}
        isOpen={isEditingName}
        setIsOpen={setIsEditingName}
        returnFocusRef={editButtonRef}
      />
    </>
  )
})

const ChartNameEditorDialog = ({
  chart,
  isOpen,
  setIsOpen,
  returnFocusRef,
}: {
  chart: ChartState
  isOpen: boolean
  setIsOpen: React.Dispatch<boolean>
  returnFocusRef: RefObject<HTMLButtonElement>
}) => {
  const {chartName, setLocalChartName, revertChartName, saveChartName} = useInsightsChartName(chart)
  const inputRef = useRef<HTMLInputElement>(null)
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setLocalChartName(event.target.value),
    [setLocalChartName],
  )

  const handleNameChange = useCallback(() => {
    setIsOpen(false)
    saveChartName()
  }, [saveChartName, setIsOpen])

  const closeDialog = useCallback(() => {
    revertChartName()
    setIsOpen(false)
  }, [revertChartName, setIsOpen])

  return (
    <Dialog
      isOpen={isOpen}
      initialFocusRef={inputRef}
      returnFocusRef={returnFocusRef}
      onDismiss={closeDialog}
      aria-labelledby="chart-name-editor-header"
      key={isOpen ? 'open' : 'closed'}
    >
      <Dialog.Header sx={{background: 'none', border: 'none'}} id="chart-name-editor-header">
        <Heading as="h3" sx={{fontSize: 3}}>
          Edit chart name
        </Heading>
      </Dialog.Header>
      <Box sx={{px: 3}}>
        <FormControl sx={{flex: 1}}>
          <FormControl.Label>Chart name</FormControl.Label>
          <TextInput
            ref={inputRef}
            name="chartName"
            value={chartName}
            onChange={onChange}
            sx={{width: '100%'}}
            {...testIdProps('chart-name-editor-input')}
          />
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 4,
          py: 3,
          px: 3,
          borderTop: '1px solid',
          borderColor: 'border.default',
          gap: 1,
        }}
      >
        <Button variant="default" onClick={closeDialog}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleNameChange}>
          Save
        </Button>
      </Box>
    </Dialog>
  )
}
