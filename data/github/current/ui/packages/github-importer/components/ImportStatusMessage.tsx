import {Link} from '@primer/react'
import React, {useEffect, useRef, useState} from 'react'

import {Status} from '../enums/statuses'

interface ImportStatusMessageProps {
  status: Status
}

export const ImportStatusMessage = React.memo(function ImportStatusMessageUnmemoized({
  status,
}: ImportStatusMessageProps) {
  const [repoPath, setRepoPath] = useState('')
  const messageRef = useRef<HTMLDivElement>(null)

  const renderMessage = () => {
    if (status === Status.Succeeded) {
      return (
        <p className="anim-fade-in">
          Importing complete! Your new repository{'  '}
          {repoPath && <Link href={`/${repoPath}`}>{repoPath}</Link>}
          {'  '}is ready.
        </p>
      )
    }

    let message = ''
    switch (status) {
      case Status.Pending:
        message = 'Your import will begin shortly...'
        break
      case Status.InProgress:
        message = 'Importing commits and revision history to GitHub...'
        break
      case Status.Invalid:
        message = 'Something went wrong when fetching the import status...'
        break
    }

    return <p className="anim-fade-in">{message}</p>
  }

  // Focus on the status message when it changes
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.focus()
    }
  }, [messageRef])

  // If the import has a successful status,
  // get the path to the new repo to build a link.
  // This assumes the app renders at the url https://github.com/<owner>/<repo>/import
  useEffect(() => {
    if (status === Status.Succeeded) {
      const path = window.location.pathname
      const pathSegments = path.split('/').filter(segment => segment !== '')
      setRepoPath(pathSegments.slice(0, 2).join('/'))
    }
  }, [status])

  return (
    <div ref={messageRef} tabIndex={-1} data-testid="import-status-message-box">
      {renderMessage()}
    </div>
  )
})
