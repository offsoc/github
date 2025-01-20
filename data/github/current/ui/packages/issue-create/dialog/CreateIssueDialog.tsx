import {Portal} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useRef} from 'react'
import {CreateIssue, type CreateIssueProps} from '../CreateIssue'
import {useIssueCreateConfigContext} from '../contexts/IssueCreateConfigContext'
import {useSafeClose} from '../hooks/use-safe-close'
import type {OnCreateProps} from '../utils/model'
import type {IssueCreateUrlParams} from '../utils/template-args'
import {CreateIssueDialogHeader} from './CreateIssueDialogHeader'
import {CreateIssueDialogFooter} from './CreateIssueDialogFooter'
import {DisplayMode} from '../utils/display-mode'

export const CreateIssueDialog = ({onCreateSuccess, onCancel, navigate, ...props}: CreateIssueProps): JSX.Element => {
  const {optionConfig, initialDefaultDisplayMode, setDisplayMode, displayMode} = useIssueCreateConfigContext()

  // These two callbacks wrap the passed in callbacks to ensure that the display mode is reset
  // The reason why it's done here is we have access to the create context safely.
  const resetDisplayModeOnClose = useCallback(() => {
    onCancel()
    setDisplayMode(initialDefaultDisplayMode)
  }, [initialDefaultDisplayMode, onCancel, setDisplayMode])

  const resetDisplayModeOnCreateSuccess = useCallback(
    ({issue, createMore}: OnCreateProps) => {
      onCreateSuccess({issue, createMore})
      if (!createMore) {
        setDisplayMode(initialDefaultDisplayMode)
      }
    },
    [initialDefaultDisplayMode, onCreateSuccess, setDisplayMode],
  )

  const {issueFormRef} = useIssueCreateConfigContext()
  const {onSafeClose} = useSafeClose({
    storageKeyPrefix: optionConfig.storageKeyPrefix,
    issueFormRef,
    onCancel: resetDisplayModeOnClose,
  })

  const createIssueUrlParamsRef = useRef<IssueCreateUrlParams>(null)

  return (
    <Portal>
      <Dialog
        renderHeader={headerProps => (
          <CreateIssueDialogHeader
            createIssueUrlParamsRef={createIssueUrlParamsRef}
            navigate={navigate}
            {...headerProps}
          />
        )}
        renderFooter={() => <CreateIssueDialogFooter onClose={() => onSafeClose()} />}
        renderBody={() => (
          <div className={`${displayMode === DisplayMode.IssueCreation ? 'p-3' : 'p-0'}`}>
            <CreateIssue
              onCreateSuccess={resetDisplayModeOnCreateSuccess}
              onCancel={onSafeClose}
              createIssueUrlParamsRef={createIssueUrlParamsRef}
              navigate={navigate}
              {...props}
            />
          </div>
        )}
        onClose={onSafeClose}
        returnFocusRef={optionConfig.returnFocusRef}
        width="xlarge"
        height="auto"
        sx={{
          width: '100%',
          margin: 4,
          maxWidth: '800px',
          maxHeight: 'clamp(300px, 80vh, 800px)',
        }}
      />
    </Portal>
  )
}
