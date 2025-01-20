import {useColumnsContext} from './use-columns-context'

type ReservedColumnNamesHookReturnType = {
  /** A list of field names defined on the server that are not allowed to be used */
  reservedColumnNames: Array<string>
}

export const useReservedColumnNames = (): ReservedColumnNamesHookReturnType => {
  const context = useColumnsContext()
  return {reservedColumnNames: context.reservedColumnNames}
}
