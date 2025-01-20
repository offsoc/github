import {announce} from '@github-ui/aria-live'
import debounce from 'lodash-es/debounce'
import {useCallback, useEffect, useState} from 'react'

import {apiUpdateMemex} from '../../api/memex/api-update-memex'
import {ProjectSettingsSaveError, ProjectSettingsSaveSuccess} from '../../api/stats/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {Resources} from '../../strings'
import type {ProjectDetailsContextType} from './memex-state-provider'
import {useProjectDetails} from './use-project-details'
import {useSetProject} from './use-set-project'

const TIMEOUT_SUCCESS_HIDE = 1800

export const ProjectNameRequiredError = 'projectNameRequired'
type ProjectNameRequiredErrorType = typeof ProjectNameRequiredError

const debounceAnnouncement = debounce((announcement: string) => {
  announce(announcement, {assertive: true})
}, 100)

function isDirty(context: ProjectDetailsContextType, settings: Partial<ProjectSettings>) {
  return (
    settings?.title !== context.title ||
    settings?.shortDescription !== context.shortDescription ||
    settings?.description !== context.description
  )
}

interface ProjectSettings {
  title: string
  shortDescription: string
  description: string
}

type UpdateMemexSettingsReturnType = {
  /**
   * Update the settings for the project on the backend and update the client-side
   * state with the updated value.
   */
  updateSettings: () => Promise<void>
  /**
   * Set the settings for the project on the backend and update the client-side
   * state with the updated value.
   *
   * @param settings the new value to use for the project tile
   */
  setSettings: (settings: Partial<ProjectSettings>) => void
  isSuccess: boolean
  isError: boolean | ProjectNameRequiredErrorType
  isDirty: boolean
}

/**
 * Updates project settings on the server.
 */
export const useUpdateMemexSettings = (): UpdateMemexSettingsReturnType => {
  const context = useProjectDetails()
  const {postStats} = usePostStats()
  const {setProject} = useSetProject()
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState<boolean | ProjectNameRequiredErrorType>(false)
  const [settings, setSettings] = useState<Partial<ProjectSettings>>({
    title: context.title,
    shortDescription: context.shortDescription,
    description: context.description,
  })

  useEffect(() => {
    if (isError) {
      debounceAnnouncement(
        isError === ProjectNameRequiredError ? Resources.projectNameRequired : Resources.genericErrorMessage,
      )
    }
  }, [isError])

  useEffect(() => {
    if (isSuccess) {
      debounceAnnouncement(Resources.projectSettingsSaved)
    }
  }, [isError, isSuccess])

  const updateSettings = useCallback(async () => {
    const body: {title?: string; shortDescription?: string; description?: string} = {}
    const title = settings?.title?.trim()
    const shortDescription = settings?.shortDescription
    const description = settings?.description

    if (title?.trim().length === 0) {
      setIsError(ProjectNameRequiredError)
      return
    }

    if (title && context.title !== title) {
      body.title = title
    }

    if (shortDescription && context.shortDescription !== shortDescription && shortDescription.length > 0) {
      body.shortDescription = shortDescription
    }

    if (description && context.description !== description && description.length > 0) {
      body.description = description
    }

    try {
      const updateMemexResponse = await apiUpdateMemex(body)

      setProject(updateMemexResponse.memexProject)
      setIsError(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
      }, TIMEOUT_SUCCESS_HIDE)
      // Post stats for the settings saved
      postStats({
        name: ProjectSettingsSaveSuccess,
        context: JSON.stringify(Object.keys(body)),
      })
    } catch {
      setIsError(true)
      // Post stats for the settings saved
      postStats({
        name: ProjectSettingsSaveError,
        context: JSON.stringify(Object.keys(body)),
      })
    }
  }, [
    context.description,
    context.shortDescription,
    context.title,
    postStats,
    setProject,
    settings?.description,
    settings?.shortDescription,
    settings?.title,
  ])

  return {
    updateSettings,
    setSettings: useCallback(
      (newSettings: Partial<ProjectSettings>) => {
        setIsError(false) // resets form errors when user starts typing again
        setSettings(prevSettings => ({...prevSettings, ...newSettings}))
      },
      [setSettings],
    ),
    isSuccess,
    isError,
    isDirty: isDirty(context, settings),
  }
}
