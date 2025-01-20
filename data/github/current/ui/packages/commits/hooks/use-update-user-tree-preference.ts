import {userPRFileTreeVisibilitySettingPath} from '@github-ui/paths'
import type {CurrentUser} from '@github-ui/repos-types'
import {verifiedFetch} from '@github-ui/verified-fetch'

export function useUpdateUserTreePreference() {
  async function updateFileTreePreference(treeValue: boolean, currentUser?: CurrentUser) {
    if (!currentUser) {
      return
    }

    const formData = new FormData()
    formData.set('file_tree_visible', treeValue ? 'true' : 'false')

    verifiedFetch(userPRFileTreeVisibilitySettingPath(currentUser), {
      method: 'PUT',
      body: formData,
      headers: {Accept: 'application/json'},
    })
  }

  return updateFileTreePreference
}
