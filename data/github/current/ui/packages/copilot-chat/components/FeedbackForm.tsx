import {Box, Button, Checkbox, CheckboxGroup, FormControl, Text, Textarea} from '@primer/react'
import type {FormEvent} from 'react'
import {useCallback, useRef} from 'react'

import {useChatManager} from '../utils/CopilotChatManagerContext'
import {useChatMessage} from './ChatMessageContext'

export const FeedbackForm = ({
  feedbackType,
  onClose,
  onSubmit,
  formLabel,
}: {
  feedbackType: 'POSITIVE' | 'NEGATIVE' | undefined
  onClose: () => void
  onSubmit: () => void
  formLabel: string
}) => {
  // max length based on hydro payload size limit
  // see https://github.com/github/copilot-api/blob/62323cfa4bfc31f808f8a457644f11bb706b8298/pkg/rest/chat.go#L382-L384
  const MAX_TEXT_RESPONSE_LENGTH = 500

  const isFeedbackNegative = feedbackType === 'NEGATIVE'

  const form = useRef<HTMLFormElement>(null)

  const manager = useChatManager()
  const {message} = useChatMessage()

  const messageId = message.id
  const threadId = message.threadID

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLFormElement>) => {
      e?.stopPropagation()
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const data = new FormData(form.current!)
      const textResponse = (data.get('text_response') as string).trim().substring(0, MAX_TEXT_RESPONSE_LENGTH)
      const responseTypes = data.getAll('response_type[]') as string[]

      await manager.service.sendFeedback({
        feedback: feedbackType,
        feedbackChoice: responseTypes,
        messageId,
        threadId,
        textResponse,
      })
      onSubmit()
    },
    [manager.service, feedbackType, messageId, threadId, onSubmit],
  )

  return (
    <Box
      sx={{p: 3}}
      as="form"
      key={`form-${messageId}`}
      name={`form-${messageId}`}
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      ref={form}
      aria-labelledby={formLabel}
    >
      <Text as="p" sx={{m: 0}} id={`description-${messageId}`}>
        Please help us improve GitHub Copilot by sharing more details about this response.
      </Text>
      {isFeedbackNegative && (
        <CheckboxGroup sx={{mt: 3}} aria-describedby={`description-${messageId}`}>
          <CheckboxGroup.Label sx={{fontSize: 1, fontWeight: 'bold'}}>This response is…</CheckboxGroup.Label>
          <FormControl>
            <Checkbox value="offensive_or_discriminatory" name="response_type[]" autoFocus />
            <FormControl.Label sx={{fontWeight: 'normal'}}>harmful or unsafe</FormControl.Label>
          </FormControl>
          <FormControl>
            <Checkbox value="poorly_formatted" name="response_type[]" />
            <FormControl.Label sx={{fontWeight: 'normal'}}>poorly formatted</FormControl.Label>
          </FormControl>
          <FormControl>
            <Checkbox value="not_true" name="response_type[]" />
            <FormControl.Label sx={{fontWeight: 'normal'}}>not true</FormControl.Label>
          </FormControl>
          <FormControl>
            <Checkbox value="unhelpful" name="response_type[]" />
            <FormControl.Label sx={{fontWeight: 'normal'}}>not helpful</FormControl.Label>
          </FormControl>
        </CheckboxGroup>
      )}
      {isFeedbackNegative && (
        <FormControl sx={{mt: 3}} id={`textarea-${messageId}`}>
          <FormControl.Label sx={{fontSize: 1}}>How could we improve this response?</FormControl.Label>
          <Textarea
            aria-describedby={`textarea-${messageId}-caption feedback-description`}
            block
            name="text_response"
          />
        </FormControl>
      )}
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
        <Button variant="primary" type="submit">
          Submit feedback
        </Button>
      </Box>
    </Box>
  )
}
