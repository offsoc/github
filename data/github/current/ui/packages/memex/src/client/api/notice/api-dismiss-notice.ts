import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'

export async function apiDismissNotice(body: {notice: string}): Promise<{success: boolean}> {
  const apiData = getApiMetadata('memex-dismiss-notice-api-data')
  try {
    const {ok} = await fetchJSONWith(apiData.url, {
      method: 'POST',
      body,
    })
    return {success: ok}
  } catch (e) {
    return {success: false}
  }
}
