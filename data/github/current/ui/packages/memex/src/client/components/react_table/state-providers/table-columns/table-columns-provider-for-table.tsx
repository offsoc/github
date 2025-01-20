import {memo} from 'react'

import {useVisibleFields} from '../../../../hooks/use-visible-fields'
import {TableColumnsProvider} from './table-columns-provider'

export const TableColumnsProviderForTable = memo<{children: React.ReactNode}>(function TableColumnsProviderForTable({
  children,
}) {
  const {isFieldVisible} = useVisibleFields()
  return <TableColumnsProvider isFieldVisible={isFieldVisible}>{children}</TableColumnsProvider>
})
