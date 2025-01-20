// eslint-disable-next-line import/no-deprecated
import {useVerifiedFetch} from '@github-ui/use-verified-fetch'

import type {SplitPreference} from '../types/commit-types'

const UPDATE_SPLIT_PREFERENCES_URL = '/users/diffview'

export function useUpdateUserSplitPreference() {
  // eslint-disable-next-line import/no-deprecated
  const updateToSplit = useVerifiedFetch<void>(`${UPDATE_SPLIT_PREFERENCES_URL}?diff=split`, 'post')
  // eslint-disable-next-line import/no-deprecated
  const updateToUnified = useVerifiedFetch<void>(`${UPDATE_SPLIT_PREFERENCES_URL}?diff=unified`, 'post')

  async function updateSplitPreferences(splitPreference: SplitPreference) {
    if (splitPreference === 'split') {
      await updateToSplit()
    } else if (splitPreference === 'unified') {
      await updateToUnified()
    }
  }

  return updateSplitPreferences
}
