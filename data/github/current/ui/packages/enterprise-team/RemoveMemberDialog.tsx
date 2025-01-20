import {Button, Flash, Spinner} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useEffect, useRef, useState} from 'react'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {SaveResponse} from '@github-ui/code-view-types'
import type {User} from './types'

type RemoveMemberDialogProps = {
  teamName: string
  member: User
  removeMemberPath: string
  onMemberRemove: () => void
  onDismiss: () => void
}

export function RemoveMemberDialog({
  teamName,
  member,
  removeMemberPath,
  onMemberRemove,
  onDismiss,
}: RemoveMemberDialogProps) {
  const [showLoadingSpinner, setShowLoadingSpinner] = useState<boolean>(false)
  const [flash, setFlash] = useState<SafeHTMLString>('' as SafeHTMLString)

  const flashRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    flashRef.current?.focus()
  }, [flash, flashRef])

  const handleDismiss = () => {
    setFlash('' as SafeHTMLString)
    onDismiss()
  }

  const removeMemberFromTeam = async () => {
    setShowLoadingSpinner(true)
    setFlash('' as SafeHTMLString)
    try {
      const result = await verifiedFetchJSON(`${removeMemberPath}/${member.login}`, {
        method: 'DELETE',
        headers: {Accept: 'application/json'},
      })

      const json: SaveResponse = await result.json()
      if (json.data.error) {
        setFlash(json.data.error as SafeHTMLString)
      } else if (json.data) {
        onMemberRemove()
      } else {
        // error uses a different format
        setFlash('An error occurred.' as SafeHTMLString)
      }
    } catch (error) {
      // Internal server error or other server errors
      setFlash('An error occurred.' as SafeHTMLString)
    }
    setShowLoadingSpinner(false)
  }

  return (
    <Dialog
      onClose={handleDismiss}
      title={`Removing member from ${teamName}`}
      renderFooter={() => {
        return (
          <Dialog.Footer>
            <Button type="button" onClick={handleDismiss}>
              Cancel
            </Button>
            <Button type="button" variant="danger" disabled={showLoadingSpinner} onClick={removeMemberFromTeam}>
              {showLoadingSpinner ? <Spinner size="small" sx={{mt: '5px'}} /> : 'Remove'}
            </Button>
          </Dialog.Footer>
        )
      }}
    >
      {flash && (
        <Flash data-testid="flash-error" tabIndex={0} ref={flashRef} variant="danger" sx={{mb: 2}}>
          <SafeHTMLBox html={flash} />
        </Flash>
      )}
      {`Are you sure that you want to remove '${member.name || member.login}' from the enterprise team?`}
    </Dialog>
  )
}
