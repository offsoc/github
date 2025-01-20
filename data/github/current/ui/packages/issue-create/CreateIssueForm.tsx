import {validateIssueBody, validateIssueTitle} from '@github-ui/entity-validators'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import type {Project} from '@github-ui/item-picker/ProjectPicker'
import type {RepositoryPickerRepository$data as Repository} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import {CommentBox, type CommentBoxConfig, type ViewMode} from '@github-ui/comment-box/CommentBox'
import type {Subject} from '@github-ui/comment-editor/subject'
import type {SafeHTMLString} from '@github-ui/safe-html'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box, Flash, Octicon} from '@primer/react'
import {type FormEvent, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {ERRORS} from './constants/errors'
import {LABELS} from './constants/labels'
import type {CreateIssueInput} from './mutations/__generated__/createIssueMutation.graphql'
import {commitCreateIssueMutation} from './mutations/create-issue-mutation'
import {IssueCreationKind, instanceOfIssueFormData, type IssueCreatePayload, type OnCreateProps} from './utils/model'
import {IssueFormElements} from '@github-ui/issue-form/IssueFormElements'
import type {IssueFormElementRef} from '@github-ui/issue-form/Types'
import {AlertIcon} from '@primer/octicons-react'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {ContributorFooter} from '@github-ui/contributor-footer/ContributorFooter'
import {getPotentialFormDefaultValuesFromUrl} from './utils/urls'
import {useAnalytics} from '@github-ui/use-analytics'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import {MetadataSelectors} from './metadata/MetadataSelectors'
import {commitUpdateIssueProjectsMutation} from '@github-ui/item-picker/updateIssueProjectsMutation'
import {commitAddIssueToClassicProjectMutation} from '@github-ui/item-picker/addIssueToClassicProjectMutation'
import {CreateIssueFormTitle} from './CreateIssueFormTitle'

export type CreateIssueCallbackProps = {
  onCreateSuccess: ({issue, createMore}: OnCreateProps) => void
  onCreateError: (error: Error) => void
  onCancel: () => void
}

export type CreateIssueFormProps = {
  repository: Repository
  selectedTemplate?: IssueCreatePayload
  title: string
  setTitle: (title: string) => void
  body: string
  setBody: (body: string) => void
  resetTitleAndBody: () => void
  clearOnCreate: () => void
  focusTitleInput?: boolean
  footer?: JSX.Element
} & CreateIssueCallbackProps

export const CreateIssueForm = ({
  repository,
  title,
  setTitle,
  body,
  setBody,
  resetTitleAndBody,
  clearOnCreate,
  onCreateSuccess,
  onCreateError,
  selectedTemplate,
  focusTitleInput,
  footer,
}: CreateIssueFormProps): JSX.Element => {
  const {
    optionConfig,
    createMore,
    createMoreCreatedPath,
    setCreateMoreCreatedPath,
    isSubmitting,
    setIsSubmitting,
    onCreateAction,
    issueFormRef,
    setIsFileUploading,
  } = useIssueCreateConfigContext()
  const showMetadataSidepanel = !optionConfig.insidePortal
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [titleValidationResult, setTitleValidationResult] = useState<string | undefined>(undefined)
  const [bodyValidationResult, setBodyValidationResult] = useState<string | undefined>(undefined)

  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()
  const {sendAnalyticsEvent} = useAnalytics()
  const {labels, assignees, projects, milestone, issueType, parentIssue} = useIssueCreateDataContext()

  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText: optionConfig.pasteUrlsAsPlainText,
    useMonospaceFont: optionConfig.useMonospaceFont,
    emojiSkinTonePreference: optionConfig.emojiSkinTonePreference,
  }

  useEffect(() => {
    // Focus title input on first render
    // TextInput mutates the ref so we only focus on first render
    if (!isSubmitting && focusTitleInput) titleInputRef?.current?.focus()
  }, [focusTitleInput, isSubmitting])

  const clearFields = useCallback(() => {
    resetTitleAndBody()
    issueFormRef.current?.resetInputs()
  }, [issueFormRef, resetTitleAndBody])

  const canIssueType = repository.viewerIssueCreationPermissions.typeable

  useImperativeHandle(
    onCreateAction,
    () => ({
      onCreate: (isSubmittingArg, createMoreArg) => {
        if (isSubmittingArg) return

        let refToFocusOnError: HTMLInputElement | IssueFormElementRef | undefined = undefined

        const inputValidationResult = validateIssueTitle(title)
        setTitleValidationResult(inputValidationResult.errorMessage)
        if (!inputValidationResult.isValid && titleInputRef.current) {
          refToFocusOnError = titleInputRef.current
        }

        const isIssueForm = selectedTemplate && instanceOfIssueFormData(selectedTemplate.data)
        let issueBodyToSave = body
        if (isIssueForm && issueFormRef.current) {
          const invalidInputs = issueFormRef.current.getInvalidInputs()
          // If there are validation errors, use first input if there's no ref yet
          if (invalidInputs.length > 0) {
            refToFocusOnError = refToFocusOnError || invalidInputs[0]
          } else {
            issueBodyToSave = issueFormRef.current.markdown() ?? ''
          }
        }

        // We validate the length === 0 also for the initial state, in which the validation result will be undefined, too.
        if (
          refToFocusOnError ||
          titleValidationResult !== undefined ||
          (title ?? '').trim().length === 0 ||
          repository === undefined ||
          bodyValidationResult !== undefined
        ) {
          // If there is an input with an error, focus it
          refToFocusOnError?.focus()
          return
        }

        setIsSubmitting(true)
        let issueTemplate = undefined
        if (
          selectedTemplate &&
          (selectedTemplate.kind === IssueCreationKind.IssueTemplate ||
            selectedTemplate.kind === IssueCreationKind.IssueForm)
        ) {
          issueTemplate = selectedTemplate.name
        }

        const input: CreateIssueInput = {
          repositoryId: repository.id,
          title: title ? title.trim() : '',
          body: issueBodyToSave,
          labelIds: labels.length > 0 ? labels.map(label => label.id) : undefined,
          assigneeIds: assignees.length > 0 ? assignees.map(assignee => assignee.id) : undefined,
          milestoneId: milestone?.id,
          issueTypeId: canIssueType || issueTemplate ? issueType?.id : null,
          issueTemplate,
          parentIssueId: parentIssue ? parentIssue.id : null,
        }

        commitCreateIssueMutation({
          environment,
          input,
          onError: (error: Error) => {
            reportError(formatError(error.message))
            onCreateError(error)
            setIsSubmitting(false)
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: ERRORS.createIssueError,
            })
          },
          onCompleted: response => {
            setIsSubmitting(false)
            if (!response.createIssue?.issue) {
              response.createIssue?.errors.map(e => reportError(formatError(e.message)))
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addToast({
                type: 'error',
                message: ERRORS.createIssueError,
              })
              return
            }

            const newIssue = response.createIssue.issue

            sendAnalyticsEvent('analytics.click', 'ISSUE_CREATE_NEW_ISSUE_BUTTON', {
              issueId: newIssue.id,
              issueNumber: newIssue.number,
              issueNWO: `${newIssue.repository.owner.login}/${newIssue.repository.name}`,
            })

            if (projects.length > 0) {
              assignIssueToProjects(newIssue.id, projects, environment)
            }

            if (createMoreArg) {
              setViewMode('edit')
              setCreateMoreCreatedPath({...createMoreCreatedPath, number: newIssue.number})
            } else {
              clearOnCreate()
            }

            clearFields()
            onCreateSuccess({issue: newIssue, createMore: createMoreArg})
          },
        })
      },
    }),
    [
      title,
      selectedTemplate,
      body,
      issueFormRef,
      titleValidationResult,
      repository,
      bodyValidationResult,
      setIsSubmitting,
      labels,
      assignees,
      milestone?.id,
      canIssueType,
      issueType?.id,
      parentIssue,
      environment,
      onCreateError,
      addToast,
      sendAnalyticsEvent,
      projects,
      clearFields,
      onCreateSuccess,
      setCreateMoreCreatedPath,
      createMoreCreatedPath,
      clearOnCreate,
    ],
  )

  const handleTitleChange = (e: FormEvent<HTMLInputElement>) => {
    const inputTitle = e.currentTarget.value
    validateAndSetTitle(inputTitle)
  }

  const validateAndSetTitle = (newTitle: string) => {
    const inputValidationResult = validateIssueTitle(newTitle)
    // when title changes, check if we need to clear validation error
    // validation error are only added when user tries to create the issue
    if (inputValidationResult.isValid) {
      setTitleValidationResult(undefined)
    }
    setTitle(newTitle)
  }
  const handleBodyChange = (inputBody: string) => {
    validateAndSetBody(inputBody)
  }
  const validateAndSetBody = (newBody: string) => {
    const inputValidationResult = validateIssueBody(newBody)

    setBodyValidationResult(inputValidationResult.errorMessage)
    setBody(newBody)
  }

  const isIssueForm = selectedTemplate && instanceOfIssueFormData(selectedTemplate.data)

  const subject = useMemo<Subject | undefined>(() => {
    if (repository) {
      return {
        type: 'issue',
        repository: {
          databaseId: repository.databaseId!,
          nwo: `${repository.owner.login}/${repository.name}`,
          slashCommandsEnabled: repository.slashCommandsEnabled,
        },
      }
    }
  }, [repository])

  const validationErrorId = useId()

  const mainContent = (
    <>
      <CreateIssueFormTitle
        repo={repository.name}
        owner={repository.owner.login}
        title={title}
        titleInputRef={titleInputRef}
        handleTitleChange={handleTitleChange}
        canIssueType={canIssueType}
        titleValidationResult={titleValidationResult}
        emojiTone={optionConfig.emojiSkinTonePreference}
      />
      {subject && !isIssueForm && (
        <>
          <CommentBox
            subject={subject}
            label={LABELS.issueCreateBodyLabel}
            showLabel={true}
            placeholder={LABELS.issueBodyPlaceholder}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            value={body as SafeHTMLString}
            onSave={() => onCreateAction?.current?.onCreate(isSubmitting, createMore)}
            onChange={handleBodyChange}
            saveButtonTrailingIcon={false}
            userSettings={commentBoxConfig}
            minHeightLines={optionConfig.insidePortal ? 14 : 20}
            aria-describedby={bodyValidationResult ? validationErrorId : undefined}
            setIsFileUploading={setIsFileUploading}
          />
          {bodyValidationResult && (
            <Flash variant="danger" id={validationErrorId}>
              <Octicon icon={AlertIcon} />
              {bodyValidationResult}
            </Flash>
          )}
        </>
      )}
      {subject && isIssueForm && instanceOfIssueFormData(selectedTemplate.data) && (
        <IssueFormElements
          outputRef={issueFormRef}
          issueFormRef={selectedTemplate.data}
          subject={subject}
          commentBoxConfig={commentBoxConfig}
          sessionStorageKey={optionConfig.storageKeyPrefix}
          defaultValuesById={getPotentialFormDefaultValuesFromUrl()}
          onSave={() => onCreateAction?.current?.onCreate(isSubmitting, createMore)}
          setIsFileUploading={setIsFileUploading}
        />
      )}
    </>
  )

  const metadataContent = (
    <>
      <MetadataSelectors />
      <ContributorFooter
        codeOfConductFileUrl={repository.codeOfConductFileUrl ?? undefined}
        securityPolicyUrl={repository.securityPolicyUrl ?? undefined}
        contributingFileUrl={repository.contributingFileUrl ?? undefined}
      />
    </>
  )

  const footerContent = <>{footer && <Box sx={{gridArea: 'footer'}}>{footer}</Box>}</>

  if (showMetadataSidepanel) {
    return (
      <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4}}>
        <Box
          sx={{
            display: ['flex', 'flex', 'grid', 'grid'],
            gridTemplateColumns: ['auto', 'auto', 'minmax(0, 1fr) 256px', 'minmax(0, 1fr) 296px'],
            flexDirection: 'column',
            gridTemplateAreas: `
              "body metadata"
              "footer nil"
            `,
            flexGrow: 1,
            gap: 4,
          }}
        >
          <Box sx={{gridArea: 'body', display: 'flex', flexDirection: 'column', gap: 3}}>{mainContent}</Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gridArea: 'metadata'}}>{metadataContent}</Box>
          {footerContent}
        </Box>
      </Box>
    )
  } else {
    return (
      <>
        {mainContent}
        {metadataContent}
        {footerContent}
      </>
    )
  }
}

function assignIssueToProjects(issueId: string, projects: Project[], environment: Environment) {
  for (const project of projects) {
    // determine if it is a classic project
    if (project.__typename === 'Project') {
      const columns = project.columns?.nodes
      if (!columns) return
      if (!columns[0]) return

      commitAddIssueToClassicProjectMutation({
        environment,
        projectColumnId: columns[0]?.id,
        issueId,
      })
    } else {
      commitUpdateIssueProjectsMutation({environment, issueId, projectId: project.id})
    }
  }
}

function formatError(message: string) {
  return new Error(`Issue create mutation failed with error: ${message}`)
}
