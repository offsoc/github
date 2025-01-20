import safeStorage from '@github-ui/safe-storage'
import {Box, Button, Textarea} from '@primer/react'
import {useCallback, useState} from 'react'

const safeLocalStorage = safeStorage('localStorage')

export interface CopilotTabProps {
  repoOwner: string
  repoName: string
  refName: string
  textPrompt?: string
}

export function CopilotTab(props: CopilotTabProps) {
  const {repoOwner, repoName, refName, textPrompt} = props
  const localStorageCopilotWorkspaceKey = `copilot-workspace-task:${repoOwner}/${repoName}`
  const openTaskInCopilotWorkspace = useCallback(
    (task: string) => {
      window.open(
        `https://copilot-workspace.githubnext.com/${repoOwner}/${repoName}?task=${encodeURIComponent(
          task,
        )}&branch=${encodeURIComponent(refName)}`,
        '_self',
      )
    },
    [repoOwner, repoName, refName],
  )

  const [copilotWorkspaceTask, setCopilotWorkspaceTask] = useState(() => {
    return safeLocalStorage.getItem(localStorageCopilotWorkspaceKey) || ''
  })

  return (
    <Box
      as="form"
      className="p-3"
      sx={{display: 'grid', gap: 3}}
      onSubmit={ev => {
        ev.preventDefault()

        // Clear local storage
        safeLocalStorage.removeItem(localStorageCopilotWorkspaceKey)

        const formData = new FormData(ev.currentTarget)
        const task = formData.get('task') as string
        openTaskInCopilotWorkspace(task)
      }}
    >
      <Textarea
        name="task"
        aria-label="Task"
        placeholder={textPrompt ? textPrompt : 'Describe a task...'}
        className="width-full"
        resize="vertical"
        value={copilotWorkspaceTask}
        onChange={ev => {
          setCopilotWorkspaceTask(ev.target.value)
          safeLocalStorage.setItem(localStorageCopilotWorkspaceKey, ev.target.value)
        }}
        onKeyDown={ev => {
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) {
            ev.preventDefault()

            // Clear local storage
            safeLocalStorage.removeItem(localStorageCopilotWorkspaceKey)

            const task = ev.currentTarget.value
            openTaskInCopilotWorkspace(task)
          }
        }}
      />
      <Button type="submit" variant="primary" className="width-full">
        Start task
      </Button>
    </Box>
  )
}
