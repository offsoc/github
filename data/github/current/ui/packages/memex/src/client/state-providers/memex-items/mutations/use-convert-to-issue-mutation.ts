import {createMutation} from 'react-query-kit'

import {apiConvertToIssue} from '../../../api/memex-items/api-convert-to-issue'
import {useSetMemexItemData} from '../use-set-memex-item-data'

export const useConvertToIssueMutation = () => {
  const {setItemData} = useSetMemexItemData()
  const mutationHook = createMutation({
    mutationFn: apiConvertToIssue,
    onSuccess: response => {
      setItemData(response.memexProjectItem)
    },
  })
  return mutationHook()
}
