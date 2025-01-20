import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {AssigneePickerAssignee$key} from '@github-ui/item-picker/AssigneePicker.graphql'
import {AssigneeFragment} from '@github-ui/item-picker/AssigneePicker'
import type {LabelPickerLabel$key} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {LabelFragment} from '@github-ui/item-picker/LabelPicker'

import {clearSessionStorage, useSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import {Box} from '@primer/react'
import {type RefObject, Suspense, useCallback, useEffect, useImperativeHandle, useState} from 'react'
import {type PreloadedQuery, readInlineData} from 'react-relay'

import {VALUES, storageKeys} from './constants/values'
import {CreateIssueForm, type CreateIssueCallbackProps} from './CreateIssueForm'
import {TemplatePickerButton} from './TemplatePickerButton'
import {RepositoryAndTemplatePickerDialog} from './RepositoryAndTemplatePickerDialog'

import {
  instanceOfIssueTemplateData,
  instanceOfIssueFormData,
  BLANK_ISSUE_ID,
  instanceOfBlankIssueData,
  instanceOfContactLinkData,
  type IssueCreatePayload,
  repoHasAvailableTemplates,
} from './utils/model'
import {TemplateListPane} from './TemplateListPane'
import {CreateIssueFooter} from './CreateIssueFooter'
import {TemplateListLoading} from './TemplateList'
import {DisplayMode} from './utils/display-mode'
import type {IssueCreateUrlParams, IssueCreateValueTypes} from './utils/template-args'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import {ProjectPickerProjectFragment} from '@github-ui/item-picker/ProjectPicker'
import type {ProjectPickerProject$key} from '@github-ui/item-picker/ProjectPickerProject.graphql'
import {IssueTypeFragment} from '@github-ui/item-picker/IssueTypePicker'
import type {
  IssueTypePickerIssueType$key,
  IssueTypePickerIssueType$data,
} from '@github-ui/item-picker/IssueTypePickerIssueType.graphql'
import {
  constructTemplateUrlParamsIfAppropriate,
  setTemplateUrlParamIfAppropriate,
  newIssueWithTemplateParams,
  isChooseRoute,
} from './utils/urls'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {URLS} from './constants/urls'
import type {Milestone} from '@github-ui/item-picker/MilestonePicker'

export type CreateIssueProps = {
  topReposQueryRef?: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
  createIssueUrlParamsRef?: RefObject<IssueCreateUrlParams>
  navigate: (url: string) => void
} & CreateIssueCallbackProps

export const CreateIssue = ({topReposQueryRef, createIssueUrlParamsRef, navigate, ...props}: CreateIssueProps) => {
  const {issueTitle, issueRepoId, issueTemplateId, issueBody} = VALUES.localStorageKeys
  const {
    repository,
    setRepository,
    template,
    setTemplate,
    preselectedRepository,
    preselectedTemplate,
    templates,
    labels,
    setLabels,
    assignees,
    setAssignees,
    projects,
    setProjects,
    milestone,
    setMilestone,
    issueType,
    setIssueType,
  } = useIssueCreateDataContext()
  const {optionConfig, displayMode, initialDefaultDisplayMode, setDisplayMode, setCreateMoreCreatedPath} =
    useIssueCreateConfigContext()
  const {storageKeyPrefix} = optionConfig
  const [repositoryId, setRepositoryId] = useSessionStorage<string | undefined>(
    issueRepoId(storageKeyPrefix),
    undefined, // this is needed to be undefined for template content clean to work when changing repos
  )

  const [templateId, setTemplateId] = useSessionStorage<string | undefined>(
    issueTemplateId(storageKeyPrefix),
    undefined,
  )

  const [title, setTitle] = useSessionStorage<string>(issueTitle(storageKeyPrefix), '')
  const [body, setBody] = useSessionStorage<string>(issueBody(storageKeyPrefix), '')

  const [originalTitle, setOriginalTitle] = useState<string>(title)
  const [originalBody, setOriginalBody] = useState<string>(body)

  const [selectedATemplate, setSelectedATemplate] = useState<boolean>(false)

  const [prefilledMilestone, setPrefilledMilestone] = useState<Milestone | null>(null)

  const setNewTitle = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)
      setOriginalTitle(newTitle)
    },
    [setTitle, setOriginalTitle],
  )

  const setNewBody = useCallback(
    (newBody: string) => {
      setBody(newBody)
      setOriginalBody(newBody)
    },
    [setBody, setOriginalBody],
  )

  const resetTitleAndBody = useCallback(() => {
    setNewTitle(originalTitle)
    setNewBody(originalBody)
  }, [setNewTitle, originalTitle, setNewBody, originalBody])

  // On first render, if we have a pre-selected repository and template, we should set these.
  useEffect(() => {
    if (preselectedRepository) {
      onRepositorySelected(preselectedRepository)

      if (isChooseRoute(ssrSafeLocation.pathname) && optionConfig.issueCreateArguments?.initialValues?.milestone) {
        // We currently only support milestone prefilling from the choose page
        setPrefilledMilestone(optionConfig.issueCreateArguments?.initialValues?.milestone)
      } else if (preselectedTemplate) {
        // On first render - we want to take into consideration the default parameters as the default state values if no template is currently set.
        // Meaning, we take precedence of the default parameters over the template's default values, unless there are already values in sessionStorage
        // or we are changing template (this logic is handled inside the function).
        onTemplateSelected(preselectedTemplate, optionConfig.issueCreateArguments?.initialValues, true)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearMetadata = useCallback(() => {
    setAssignees([])
    setLabels([])
    setProjects([])
    setMilestone(null)
  }, [setAssignees, setLabels, setMilestone, setProjects])

  const clearSessionData = useCallback(() => {
    clearSessionStorage(storageKeys(storageKeyPrefix))
  }, [storageKeyPrefix])

  const constructUrlSearchParams = useCallback(
    () =>
      constructTemplateUrlParamsIfAppropriate({
        repository,
        template,
        preselectedRepository,
        title,
        body,
        assignees,
        labels,
        milestone: milestone ?? undefined,
        type: issueType ?? undefined,
        projects,
        displayMode,
      }),
    [
      repository,
      template,
      preselectedRepository,
      title,
      body,
      assignees,
      labels,
      milestone,
      issueType,
      projects,
      displayMode,
    ],
  )

  // Set up a hook on the history stack for changes, and see if the current URL doesn't have a template parameter set.
  // If it doesn't, then we should ensure we set the display mode to templatepicker
  useEffect(() => {
    const urlParams = new URLSearchParams(ssrSafeLocation?.search)
    const templateParam = urlParams.get(URLS.queryParams.template)
    // If we removed the template param has been removed, and we have templates available, then we should show the template picker.
    // We also ensure that we've selected a template prior, to ensure we came from the template picker and not directly to issue creation.
    if (
      templateParam === null &&
      templates &&
      selectedATemplate &&
      !optionConfig.insidePortal &&
      repoHasAvailableTemplates(templates) &&
      displayMode === DisplayMode.IssueCreation
    ) {
      setDisplayMode(DisplayMode.TemplatePicker)
    }
    // We only want to check this on URL change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssrSafeLocation?.search])

  useImperativeHandle(
    createIssueUrlParamsRef,
    () => ({
      generateUrlParams: () => constructUrlSearchParams(),
    }),
    [constructUrlSearchParams],
  )

  const onRepositorySelected = useCallback(
    (selectedRepository: Repository | undefined) => {
      if (selectedRepository) {
        if (repositoryId !== selectedRepository.id) {
          // We are only clearing metadata because we want to persist title & body across repo changes incase we are selecting blank issues
          clearMetadata()
        }

        setRepository(selectedRepository)
        setRepositoryId(selectedRepository.id)
        setCreateMoreCreatedPath({
          owner: selectedRepository.owner.login,
          repo: selectedRepository.name,
          number: undefined,
        })
      }
    },
    [clearMetadata, repositoryId, setCreateMoreCreatedPath, setRepository, setRepositoryId],
  )

  const onTemplateSelected = useCallback(
    (selectedTemplate: IssueCreatePayload, enforcedInitialValues?: IssueCreateValueTypes, initialization = false) => {
      // Contact links will redirect to a new page, so we don't want to set the template
      if (instanceOfContactLinkData(selectedTemplate.data)) {
        return
      }

      const previouslyWasBlankIssue = templateId === BLANK_ISSUE_ID
      const changedTemplates = templateId !== selectedTemplate.data?.__id
      setTemplate(selectedTemplate)
      setTemplateId(selectedTemplate.data?.__id)

      if (!initialization) {
        // If we physically clicked on a template (and not the first load initialization)
        setSelectedATemplate(true)
      }

      if (changedTemplates) {
        // Only update the URL with the template parameter if it was a user click
        if (!initialization) {
          setTemplateUrlParamIfAppropriate({
            insidePortal: optionConfig.insidePortal,
            template: selectedTemplate,
            repository,
            preselectedRepository,
          })
        }

        clearMetadata()
        const newTitle =
          enforcedInitialValues?.title ??
          (selectedTemplate.data.title ?? '') +
            (previouslyWasBlankIssue && title && title.length > 0 ? ` ${title}` : '')
        setNewTitle(newTitle)

        let newBody = ''
        if (instanceOfIssueTemplateData(selectedTemplate.data) || instanceOfBlankIssueData(selectedTemplate.data)) {
          newBody =
            enforcedInitialValues?.body ??
            (!previouslyWasBlankIssue || body?.length === 0 ? '' : `${body}\n\n---\n`) + selectedTemplate.data.body
        }
        setNewBody(newBody)

        const templateLabels =
          enforcedInitialValues?.labels ??
          (selectedTemplate.data.labels?.edges?.flatMap(e =>
            // eslint-disable-next-line no-restricted-syntax
            e?.node ? [readInlineData<LabelPickerLabel$key>(LabelFragment, e?.node)] : [],
          ) ||
            [])
        setLabels(templateLabels)

        const templateAssignees =
          enforcedInitialValues?.assignees ??
          ((selectedTemplate.data.assignees?.edges || []).flatMap(e =>
            // eslint-disable-next-line no-restricted-syntax
            e?.node ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, e?.node)] : [],
          ) ||
            [])
        setAssignees(templateAssignees)

        if (enforcedInitialValues?.projects) {
          setProjects(enforcedInitialValues.projects)
        } else if (instanceOfIssueFormData(selectedTemplate.data)) {
          const templateProjects =
            selectedTemplate.data.projects?.edges?.flatMap(e =>
              // eslint-disable-next-line no-restricted-syntax
              e?.node ? [readInlineData<ProjectPickerProject$key>(ProjectPickerProjectFragment, e?.node)] : [],
            ) || []
          setProjects(templateProjects)
        }

        if (enforcedInitialValues?.milestone || prefilledMilestone) {
          setMilestone(enforcedInitialValues?.milestone || prefilledMilestone)
          setPrefilledMilestone(null)
        }

        let templateType: IssueTypePickerIssueType$data | null = enforcedInitialValues?.type ?? null
        if (
          !templateType &&
          (instanceOfIssueFormData(selectedTemplate.data) || instanceOfIssueTemplateData(selectedTemplate.data)) &&
          selectedTemplate.data.type !== undefined
        ) {
          templateType =
            // eslint-disable-next-line no-restricted-syntax
            readInlineData<IssueTypePickerIssueType$key>(IssueTypeFragment, selectedTemplate.data.type) ?? null
        }
        setIssueType(templateType ?? null)
      }

      if (optionConfig.navigateToFullScreenOnTemplateChoice) {
        navigate(newIssueWithTemplateParams({template: selectedTemplate, repository, preselectedRepository}))
      } else {
        setDisplayMode(DisplayMode.IssueCreation)
      }
    },
    [
      templateId,
      setTemplate,
      setTemplateId,
      optionConfig.navigateToFullScreenOnTemplateChoice,
      optionConfig.insidePortal,
      clearMetadata,
      title,
      setNewTitle,
      setNewBody,
      setLabels,
      setAssignees,
      prefilledMilestone,
      setIssueType,
      repository,
      preselectedRepository,
      body,
      setProjects,
      setMilestone,
      navigate,
      setDisplayMode,
    ],
  )

  // If we are immediately bypassing the template selection, then we should allow the user to go back to choose another template or repository.
  const shouldShowTemplateButton = initialDefaultDisplayMode === DisplayMode.IssueCreation && topReposQueryRef

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2}} tabIndex={-1}>
      {displayMode === DisplayMode.IssueCreation && (
        <>
          {shouldShowTemplateButton && (
            <Box sx={{width: 'content'}} data-testid="template-picker-button">
              <TemplatePickerButton repository={repository} template={template} />
            </Box>
          )}
          {repository && (
            <CreateIssueForm
              {...props}
              selectedTemplate={template}
              repository={repository}
              title={title}
              setTitle={setTitle}
              body={body}
              setBody={setBody}
              resetTitleAndBody={resetTitleAndBody}
              clearOnCreate={clearSessionData}
              focusTitleInput={!shouldShowTemplateButton}
              footer={
                optionConfig.insidePortal ? undefined : <CreateIssueFooter sx={{mt: 2}} onClose={props.onCancel} />
              }
            />
          )}
        </>
      )}
      {optionConfig.showRepositoryPicker && displayMode === DisplayMode.TemplatePicker && topReposQueryRef && (
        <RepositoryAndTemplatePickerDialog
          repository={repository}
          setRepository={onRepositorySelected}
          topReposQueryRef={topReposQueryRef}
          organization={optionConfig.scopedOrganization}
          onTemplateSelected={onTemplateSelected}
        />
      )}
      {!optionConfig.showRepositoryPicker && displayMode === DisplayMode.TemplatePicker && repository && (
        <Suspense fallback={<TemplateListLoading />}>
          {repository && (
            <div data-hpc>
              <TemplateListPane repository={repository} templates={templates} onTemplateSelected={onTemplateSelected} />
            </div>
          )}
        </Suspense>
      )}
    </Box>
  )
}
