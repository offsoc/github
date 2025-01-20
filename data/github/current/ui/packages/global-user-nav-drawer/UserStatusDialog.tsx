import {Dialog} from '@primer/react/experimental'
import {Spinner} from '@primer/react'
import {AlertIcon} from '@primer/octicons-react'
import {useCallback, useEffect, useId, useRef, useState, type FormEvent} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {testIdProps} from '@github-ui/test-id-props'
import type {EmojiAttributes} from './Emoji'

export interface UserStatus {
  messageHtml?: string
  emojiAttributes?: EmojiAttributes
}

async function saveUserStatus(body: FormData) {
  // put method is required for the endpoint to accept the request
  body.set('_method', 'put')
  const response = await verifiedFetch('/users/status', {
    method: 'POST',
    headers: {'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json'},
    body,
  })
  return response.json() as Promise<UserStatus>
}

export function UserStatusDialog({onClose}: {onClose: (statusResponse?: Promise<UserStatus> | string) => void}) {
  const [fragmentLoaded, setFragmentLoaded] = useState(false)
  const fragmentRef = useRef<HTMLElement>(null)
  const formId = useId()

  const onFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const data = new FormData(e.target as HTMLFormElement)
      onClose(saveUserStatus(data))
    },
    [onClose],
  )

  const onClearStatus = useCallback(() => {
    // Fire and forget an empty request to clear the status
    saveUserStatus(new FormData())

    // Immediately close with cleared status
    onClose(Promise.resolve({}))
  }, [onClose])

  useEffect(() => {
    const fragment = fragmentRef.current
    if (!fragment) {
      return
    }

    function loaded() {
      setFragmentLoaded(true)
    }

    fragment.addEventListener('load', loaded)
    return () => {
      fragment.removeEventListener('load', loaded)
    }
  }, [fragmentRef])

  return (
    <Dialog
      width="large"
      title="Edit status"
      onClose={onClose}
      footerButtons={[
        {
          buttonType: 'normal',
          content: 'Clear status',
          onClick: onClearStatus,
        },
        {
          buttonType: 'primary',
          type: 'submit',
          content: 'Set status',
          form: formId,
          disabled: !fragmentLoaded,
        },
      ]}
    >
      <form id={formId} onSubmit={onFormSubmit} className="user-status-dialog-fragment js-user-status-container">
        <include-fragment
          src={`/users/status`}
          accept="text/fragment+html"
          ref={fragmentRef}
          {...testIdProps('user-status-dialog-include-fragment')}
        >
          <p className="text-center mt-3" data-hide-on-error>
            <Spinner />
          </p>
          <p className="flash flash-error mb-0 mt-2" data-show-on-error hidden>
            <AlertIcon />
            Sorry, something went wrong and we were not able to fetch the user settings form
          </p>
        </include-fragment>
      </form>
    </Dialog>
  )
}
