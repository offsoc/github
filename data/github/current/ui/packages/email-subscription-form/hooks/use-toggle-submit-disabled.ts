import {useCallback, type MutableRefObject} from 'react'
import type {TopicsRef} from '../types'

export function useToggleSubmitDisabled(topicsRef: MutableRefObject<TopicsRef>): () => void {
  return useCallback(() => {
    const submitButton = document.querySelector<HTMLButtonElement>('#js-submit')
    if (!submitButton) {
      return
    }

    let disabled = true

    for (const topicInputGroup of Object.values(topicsRef.current)) {
      if (topicInputGroup) {
        // If any input checkbox is unchecked,
        // we enable the submit cta
        const topicCheckbox = topicInputGroup.querySelector<HTMLInputElement>('input[type="checkbox"]')
        if (topicCheckbox && !topicCheckbox.checked) {
          disabled = false
        }
      }
    }

    submitButton.disabled = disabled
  }, [topicsRef])
}
