import {noop} from '@github-ui/noop'
import type {ValidationResult} from '@github-ui/entity-validators'
import {Box, Flash, useRefObjectAsForwardedRef} from '@primer/react'
import {MarkdownEditor, type MarkdownEditorHandle, type MarkdownEditorProps} from '@github-ui/markdown-editor'

import {useMarkdownSuggestions} from './util/use-markdown-suggestions'
import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {emojiList} from './constants/emojis'
import strings from './constants/strings'
import {SlashCommandsButton, SlashCommandsProvider} from './components/SlashCommandsProvider'
import {AddTasklistButton} from './components/AddTaskListButton'
import {acceptedFileTypes, useUploadFile} from './api/file-upload'
import type {Subject as CommentBoxSubject} from './subject'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {useGetPreview} from './api/preview'
import {ApiMarkdownSubject} from './api/types'
import {SaveButton} from './components/SaveButton'
import type {TestIdProps} from '@github-ui/test-id-props'
import {AddSuggestionButton} from './AddSuggestionButton'
import {REGEX_STRINGS} from './constants/regex'

export interface CommentBoxConfig {
  pasteUrlsAsPlainText: boolean
  useMonospaceFont: boolean
  emojiSkinTonePreference?: number
}

export type ViewMode = 'preview' | 'edit'

type MarkdownSuggestionsFetchMethod = 'eager' | 'lazy'

export type CommentBoxHandle = MarkdownEditorHandle

export const CommentBoxButton = MarkdownEditor.ActionButton

export interface CommentBoxProps
  extends TestIdProps,
    Omit<
      MarkdownEditorProps,
      | 'emojiSuggestions'
      | 'mentionSuggestions'
      | 'referenceSuggestions'
      | 'onUploadFile'
      | 'acceptedFileTypes'
      | 'savedReplies'
      | 'onRenderPreview'
      | 'children'
      | 'errorMessage'
    > {
  label?: string
  showLabel?: boolean
  subject?: CommentBoxSubject
  onSave?: () => void
  onCancel?: () => void
  validationResult?: ValidationResult
  saveButtonText?: string
  saveButtonTrailingIcon?: boolean
  actions?: React.ReactNode
  userSettings?: CommentBoxConfig
  /** Block saving due to stale content. */
  contentIsStale?: boolean
  fileUploadsEnabled?: boolean
  buttonSize?: 'small' | 'medium'
  suggestedChangesConfig?: {
    showSuggestChangesButton: boolean
    sourceContentFromDiffLines: string | undefined
    onInsertSuggestedChange: () => void
    shouldInsertSuggestedChange?: boolean
  }
  /**
   * The method to fetch markdown suggestions. If set to `lazy`, suggestions will be fetched only when the editor is focused.
   * If set to `eager`, suggestions will be fetched immediately.
   * @default 'lazy'
   */
  markdownSuggestionsFetchMethod?: MarkdownSuggestionsFetchMethod
  markdownErrorMessage?: string
  setIsFileUploading?: (value: boolean) => void
}

export const CommentBox = forwardRef(
  (
    {
      ['aria-describedby']: ariaDescribedby,
      ['data-testid']: testId,
      label,
      labelledBy,
      showLabel,
      disabled = false,
      subject,
      viewMode,
      onChangeViewMode,
      value,
      placeholder,
      onChange,
      onSave,
      onCancel,
      validationResult,
      saveButtonText = 'Save',
      saveButtonTrailingIcon = true,
      actions,
      userSettings: optionConfig,
      contentIsStale,
      fileUploadsEnabled = true,
      minHeightLines,
      maxHeightLines,
      sx,
      onPrimaryAction,
      buttonSize,
      suggestedChangesConfig,
      markdownErrorMessage,
      teamHovercardsEnabled,
      setIsFileUploading,
      markdownSuggestionsFetchMethod = 'lazy',
    }: CommentBoxProps,
    forwardedRef: ForwardedRef<CommentBoxHandle>,
  ): ReactElement => {
    const apiSubject: Partial<ApiMarkdownSubject> = ApiMarkdownSubject.fromPropsSubject(subject)
    const projectId = subject?.type === 'project' ? subject?.id?.databaseId.toString() : undefined

    const [fetchSuggestions, setFetchSuggestions] = useState<boolean>(markdownSuggestionsFetchMethod === 'eager')
    const {mentions, references, savedReplies} = useMarkdownSuggestions(apiSubject, fetchSuggestions)
    const renderPreview = useGetPreview(apiSubject)
    const uploadFile = useUploadFile(apiSubject.subjectRepoId?.toString(), projectId)

    const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode ?? 'edit')
    const [showContentIsStaleWarning, setShowContentIsStaleWarning] = useState(false)

    const ref = useRef<MarkdownEditorHandle>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)

    const warningRef = useRef<HTMLDivElement | null>(null)

    const isRepoSubject = subject !== undefined && 'repository' in subject && subject.repository !== undefined
    const isRepoSlashCommandEnabled = isRepoSubject && subject.repository.slashCommandsEnabled

    const {tasklist_block, sub_issues} = useFeatureFlags()
    const showAddTaskListButton = !sub_issues && tasklist_block && isRepoSubject

    const [shouldInsertSuggestedChangeOnRender, setShouldInsertSuggestedChangeOnRender] = useState<boolean>(
      suggestedChangesConfig?.shouldInsertSuggestedChange ?? false,
    )

    useEffect(() => {
      setShowContentIsStaleWarning(contentIsStale ?? false)
      return () => {
        setShowContentIsStaleWarning(false)
      }
    }, [contentIsStale])

    const onSaveAction = useMemo(() => {
      if (showContentIsStaleWarning) {
        // This effectively disables/hides the save button
        return noop
      }
      return () => {
        onSave?.()
        setCurrentViewMode('edit')
      }
    }, [onSave, showContentIsStaleWarning])

    useEffect(() => {
      setCurrentViewMode('edit')
    }, [apiSubject.subjectRepoId, apiSubject.subjectId])

    useEffect(() => {
      if (viewMode) {
        setCurrentViewMode(viewMode)
      }
    }, [viewMode])

    const onChangeViewModeInternal = useCallback(
      (v: ViewMode) => {
        setCurrentViewMode(v)
        onChangeViewMode?.(v)
      },
      [onChangeViewMode],
    )

    const onInsertText = useCallback(
      (text: string) => {
        ref.current?.focus()
        try {
          document.execCommand('insertText', false, text)
        } catch {
          // this is a pretty naive approach and may fail in some environments (particularly JSDom)
          // but it will work in most cases and it's not worth reimplementing the full robust effort
          // used by the MarkdownEditor internals
        }
      },
      [ref],
    )

    const onFocused = useCallback(() => {
      if (markdownSuggestionsFetchMethod === 'lazy' && !fetchSuggestions) {
        setFetchSuggestions(true)
      }
    }, [fetchSuggestions, markdownSuggestionsFetchMethod])

    // Only scroll to the warning banner if otherwise the user would not be able to see it
    const warningBannerPosition = 173
    // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
    if (showContentIsStaleWarning && warningRef.current !== null && window.scrollY > warningBannerPosition) {
      warningRef.current.scrollIntoView()
    }

    // As to get access to the information about files being uploaded in the issue body we need access to the MarkdownEditor context,
    // we can also rely directly on the body and detect file uploading directly there
    const isUploadingFiles = useMemo(() => REGEX_STRINGS.isFileUploading.test(value), [value])

    useEffect(() => {
      if (setIsFileUploading) {
        setIsFileUploading(isUploadingFiles)
      }
    }, [isUploadingFiles, setIsFileUploading])

    // Suspense is here to avoid suspending the broader component tree when being rendered on the server with SSR
    // this is a workaround for https://github.com/github/primer/issues/2090
    const editor = (
      <Suspense>
        {showContentIsStaleWarning && (
          <Flash ref={warningRef} sx={{mb: 2}} variant="danger">
            {strings.staleContentError}
          </Flash>
        )}
        <MarkdownEditor
          aria-describedby={ariaDescribedby}
          labelledBy={labelledBy}
          disabled={disabled}
          value={value}
          placeholder={placeholder !== undefined ? placeholder : strings.leaveCommentLabel}
          emojiSuggestions={emojiList}
          emojiTone={optionConfig?.emojiSkinTonePreference}
          mentionSuggestions={mentions}
          referenceSuggestions={references}
          viewMode={currentViewMode}
          onChangeViewMode={onChangeViewModeInternal}
          onChange={onChange}
          onInputFocus={onFocused}
          onRenderPreview={renderPreview}
          onUploadFile={fileUploadsEnabled ? uploadFile : undefined}
          acceptedFileTypes={fileUploadsEnabled ? acceptedFileTypes(isRepoSubject) : undefined}
          onPrimaryAction={() => {
            onSaveAction()
            onPrimaryAction?.()
          }}
          ref={ref}
          pasteUrlsAsPlainText={optionConfig?.pasteUrlsAsPlainText || false}
          savedReplies={savedReplies}
          monospace={optionConfig?.useMonospaceFont || false}
          minHeightLines={minHeightLines}
          maxHeightLines={maxHeightLines}
          errorMessage={markdownErrorMessage}
          sx={sx}
          teamHovercardsEnabled={teamHovercardsEnabled}
        >
          <MarkdownEditor.Label visuallyHidden={!showLabel}>{label ?? 'Markdown Editor'}</MarkdownEditor.Label>
          <MarkdownEditor.Actions>
            {actions}
            {onCancel && (
              <MarkdownEditor.ActionButton variant="default" size={buttonSize} onClick={onCancel} value="Cancel">
                Cancel
              </MarkdownEditor.ActionButton>
            )}
            {onSaveAction && validationResult && (
              <SaveButton
                onSave={onSaveAction}
                validationResult={validationResult}
                trailingIcon={saveButtonTrailingIcon}
                disabled={disabled}
                size={buttonSize}
              >
                {saveButtonText}
              </SaveButton>
            )}
          </MarkdownEditor.Actions>
          <MarkdownEditor.Toolbar>
            {suggestedChangesConfig?.showSuggestChangesButton && (
              <AddSuggestionButton
                shouldInsertSuggestionOnRender={shouldInsertSuggestedChangeOnRender}
                inputValue={value}
                onChange={onChange}
                sourceContentFromDiffLines={suggestedChangesConfig?.sourceContentFromDiffLines}
                editorRef={ref}
                onInsertSuggestedChange={() => {
                  suggestedChangesConfig?.onInsertSuggestedChange()
                  setShouldInsertSuggestedChangeOnRender(false)
                }}
              />
            )}
            <MarkdownEditor.DefaultToolbarButtons />
            <SlashCommandsButton />
            {showAddTaskListButton && <AddTasklistButton editedBody={value} onChangeBody={onChange} />}
          </MarkdownEditor.Toolbar>
        </MarkdownEditor>
      </Suspense>
    )

    return (
      <Box sx={{mb: 0}} data-testid={testId}>
        {isRepoSlashCommandEnabled ? (
          <SlashCommandsProvider subject={subject} onInsertText={onInsertText} onSave={onSaveAction}>
            {editor}
          </SlashCommandsProvider>
        ) : (
          editor
        )}
      </Box>
    )
  },
)

CommentBox.displayName = 'CommentBox'
