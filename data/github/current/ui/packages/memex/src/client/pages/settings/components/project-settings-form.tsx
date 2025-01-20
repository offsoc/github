import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Heading, Text, useConfirm} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'
import {useBlocker} from 'react-router-dom'

import {SuccessState} from '../../../components/common/state-style-decorators'
import {DescriptionEditor} from '../../../components/description-editor'
import {ShortDescriptionEditor} from '../../../components/short-description-editor'
import {useProjectDetails} from '../../../state-providers/memex/use-project-details'
import {
  ProjectNameRequiredError,
  useUpdateMemexSettings,
} from '../../../state-providers/memex/use-update-memex-settings'
import {Resources} from '../../../strings'
import {ProjectNameEditor} from './project-name-editor'

export function ProjectSettingsForm() {
  const {title} = useProjectDetails()
  const {
    updateSettings,
    isSuccess: isUpdateMemexSuccess,
    isError: isUpdateMemexError,
    setSettings: setProjectSettings,
    isDirty,
  } = useUpdateMemexSettings()

  const setLocalProjectName = useCallback(
    (newTitle: string) => setProjectSettings({title: newTitle}),
    [setProjectSettings],
  )
  const setLocalProjectShortDescription = useCallback(
    (newShortDescription: string) => setProjectSettings({shortDescription: newShortDescription}),
    [setProjectSettings],
  )
  const setLocalProjectDescription = useCallback(
    (newDescription: string) => setProjectSettings({description: newDescription}),
    [setProjectSettings],
  )

  const confirm = useConfirm()
  const [shouldNavigate, setShouldNavigate] = useState(false)

  const blocker = useBlocker(({currentLocation, nextLocation}) => {
    if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
      confirmUnsavedChanges()
      return true
    }

    return false
  })

  const confirmUnsavedChanges = useCallback(async () => {
    setShouldNavigate(
      await confirm({
        title: 'Discard changes?',
        content: <div>You have unsaved changes. Are you sure you want leave this page and discard them?</div>,
        confirmButtonContent: 'Discard',
        confirmButtonType: 'danger',
      }),
    )
  }, [confirm])

  useEffect(() => {
    if (blocker && blocker.state === 'blocked') {
      if (shouldNavigate) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldNavigate])

  return (
    <>
      <Heading
        as="h2"
        sx={{
          borderBottomColor: 'border.muted',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          fontSize: 4,
          fontWeight: 'normal',
          pb: 2,
          mb: 2,
        }}
      >
        Project settings
      </Heading>
      <ProjectNameEditor initialValue={title} setLocalProjectName={setLocalProjectName} />
      <Box sx={{mb: 4}} {...testIdProps('readme-edit')}>
        <ShortDescriptionEditor setProjectShortDescription={setLocalProjectShortDescription} editModeOff />
      </Box>
      <div {...testIdProps('readme-edit')}>
        <DescriptionEditor setProjectDescription={setLocalProjectDescription} editModeOff />
      </div>
      <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 5, alignItems: 'center'}}>
        <Button
          sx={{mr: 3}}
          size="medium"
          variant="default"
          onClick={updateSettings}
          {...testIdProps('save-project-settings-button')}
        >
          Save changes
        </Button>
        {isUpdateMemexSuccess && (
          <>
            <Text {...testIdProps('save-project-settings-success')} sx={{ml: 1}}>
              Saved
            </Text>{' '}
            <SuccessState />
          </>
        )}
        {isUpdateMemexError && (
          <Text {...testIdProps('save-project-settings-success')} sx={{color: 'danger.fg'}}>
            {isUpdateMemexError === ProjectNameRequiredError
              ? Resources.genericFormErrorMessage
              : Resources.genericErrorMessage}
          </Text>
        )}
      </Box>
    </>
  )
}
