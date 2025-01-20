import {
  Box,
  SegmentedControl,
  FormControl,
  IconButton,
  Textarea,
  Text,
  ActionList,
  useResponsiveValue,
} from '@primer/react'
import {XIcon, SidebarCollapseIcon, ArrowUpRightIcon, SyncIcon} from '@primer/octicons-react'
import {Tooltip} from '@primer/react/next'
import {Stack, Dialog} from '@primer/react/drafts'
import {useCallback, useEffect, useRef, useState} from 'react'
import {PlaygroundInput} from './PlaygroundInput'
import SidebarInfo from './SidebarInfo'
import {usePlaygroundState, usePlaygroundManager, SidebarSelectionOptions} from '../../../utils/playground-manager'
import {ModelUrlHelper} from '../../../utils/model-url-helper'

export function PlaygroundInputs() {
  const isMobile = useResponsiveValue({narrow: true}, false)
  const manager = usePlaygroundManager()
  const state = usePlaygroundState()

  const resetLabel = 'Reset to default inputs'

  const resetAllInputs = () => {
    manager.setDefaultParameters(manager.modelInputSchema.parameters)
    manager.setParametersHasChanges(false)
    manager.setSystemPrompt('')
  }

  if (isMobile) {
    return (
      <>
        {state.showParametersOnMobile && isMobile && (
          <Dialog
            position={{narrow: 'fullscreen', regular: 'center'}}
            renderHeader={() => {
              return (
                <Box
                  as="header"
                  sx={{
                    borderBottomColor: 'border.default',
                    borderBottomStyle: 'solid',
                    borderBottomWidth: 1,
                    py: 2,
                    pr: 2,
                    pl: 3,
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <Text as="h1" sx={{fontSize: 1, fontWeight: 'bold', flex: 1}}>
                    {state.tab === SidebarSelectionOptions.DETAILS ? 'Info' : 'Parameters'}
                  </Text>
                  <Box sx={{display: 'flex'}}>
                    {state.tab === SidebarSelectionOptions.PARAMETERS && state.parametersHasChanges && (
                      <Tooltip text={resetLabel}>
                        <IconButton
                          icon={SyncIcon}
                          as="button"
                          variant="invisible"
                          aria-label={resetLabel}
                          onClick={resetAllInputs}
                        />
                      </Tooltip>
                    )}
                    <Tooltip text="Close">
                      <IconButton
                        icon={XIcon}
                        as="button"
                        variant="invisible"
                        aria-label="Close"
                        onClick={() => manager.setShowParametersOnMobile(false)}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              )
            }}
            onClose={() => manager.setShowParametersOnMobile(false)}
          >
            <Content activeTab={state.tab} />
          </Dialog>
        )}
      </>
    )
  }

  const smallSizeForSegmentControl = {
    height: '28px',
    fontSize: 1,
  }

  return (
    <Box
      sx={{
        height: '100%',
        flexDirection: 'column',
        width: '30%',
        maxWidth: '480px',
        minWidth: '280px',
        overflow: 'auto',
        display: state.showParameters ? ['none', 'none', 'flex'] : 'none',
      }}
      className="border-top border-md-top-0 border-md-left"
    >
      <div
        className="d-flex flex-justify-between position-sticky top-0 p-2 border-bottom bgColor-muted flex-items-center"
        style={{zIndex: 1}}
      >
        <div className="flex-1 pr-2">
          <SegmentedControl
            sx={smallSizeForSegmentControl}
            size="small"
            onChange={selectedIndex => {
              manager.setTab(selectedIndex)
            }}
            fullWidth={{narrow: true, regular: false}}
            aria-label="Mode"
          >
            <SegmentedControl.Button selected={state.tab === SidebarSelectionOptions.PARAMETERS}>
              Parameters
            </SegmentedControl.Button>
            <SegmentedControl.Button selected={state.tab === SidebarSelectionOptions.DETAILS}>
              Details
            </SegmentedControl.Button>
          </SegmentedControl>
        </div>
        <div>
          {state.tab === SidebarSelectionOptions.PARAMETERS && state.parametersHasChanges && (
            <Tooltip text={resetLabel}>
              <IconButton size="small" icon={SyncIcon} as="button" aria-label={resetLabel} onClick={resetAllInputs} />
            </Tooltip>
          )}
          <IconButton
            size="small"
            icon={SidebarCollapseIcon}
            aria-label="Hide parameters setting"
            onClick={() => {
              manager.setShowParameters(false)
            }}
            className="ml-2"
          />
        </div>
      </div>

      <Content activeTab={state.tab} />
    </Box>
  )
}

function Content({activeTab}: {activeTab: number}) {
  const manager = usePlaygroundManager()
  const state = usePlaygroundState()
  const modelInputSchema = manager.modelInputSchema
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [height, setHeight] = useState<string>('auto')

  const handleSystemPromptChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      manager.setSystemPrompt(event.target.value)
      manager.setParametersHasChanges(true)
    },
    [manager],
  )

  const handleInputChange = (key: string, value: string | number | boolean | string[]) => {
    manager.handleRequestParameterChange(state, key, value)
    manager.setParametersHasChanges(true)
  }

  useEffect(() => {
    const current = textAreaRef.current
    if (!current) return
    current.style.height = 'auto'
    current.style.height = current.scrollHeight > 72 ? '72px' : `${current.scrollHeight}px`
    setHeight(current.style.height)
  }, [state.systemPrompt])

  return (
    <>
      {activeTab === SidebarSelectionOptions.DETAILS && (
        <div className="">
          <div className="p-0 pb-6 p-md-3 border-bottom">
            <SidebarInfo model={manager.model} />
          </div>
          <div className="p-0 pt-2 p-md-2">
            <ActionList.Item as="a" href={ModelUrlHelper.modelUrl(manager.model)}>
              <ArrowUpRightIcon className="mr-2 fgColor-muted" />
              Model details page
            </ActionList.Item>
          </div>
        </div>
      )}

      {activeTab === SidebarSelectionOptions.PARAMETERS && (
        <Stack gap="normal" className="p-0 p-md-3">
          {modelInputSchema.capabilities.systemPrompt && (
            <FormControl>
              <FormControl.Label>System prompt</FormControl.Label>
              <FormControl.Caption>Prompt the system</FormControl.Caption>
              <Textarea
                ref={textAreaRef}
                value={state.systemPrompt}
                block={true}
                resize="vertical"
                rows={1}
                onChange={handleSystemPromptChange}
                name="systemPrompt"
                style={{height}}
              />
            </FormControl>
          )}
          {/* For each of a model’s inputs, display form components */}
          {modelInputSchema.parameters.map(parameter => (
            <PlaygroundInput
              key={parameter.key}
              value={state.parameters[parameter.key] ?? ''}
              parameter={parameter}
              onChange={handleInputChange}
            />
          ))}
        </Stack>
      )}
    </>
  )
}
