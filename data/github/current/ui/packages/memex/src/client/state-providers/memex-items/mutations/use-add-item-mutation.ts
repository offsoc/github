import {createMutation} from 'react-query-kit'

import {apiAddItem} from '../../../api/memex-items/api-add-item'

export const useAddItemMutation = createMutation({
  mutationFn: apiAddItem,
})
