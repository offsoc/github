import {createContext, useCallback, useContext, useMemo, useState} from 'react'

import {type Collaborator, CollaboratorType, Role, rolesMap} from '../../../../api/common-contracts'
import {freeTextMatch, parseFullTextQuery} from '../../../../components/filter-bar/helpers/search-filter'
import {getCollaboratorDisplayValue} from '../../../../queries/organization-access'

const CollaboratorsFilterContext = createContext<{
  query: string
  setQuery: (value: string) => void
  roleFilter: Role
  setRoleFilter: (role: Role) => void
  typeFilter: CollaboratorType
  setTypeFilter: (type: CollaboratorType) => void
  match: (collaborator: Collaborator) => boolean
} | null>(null)

/**
 * Consume the collaborator filter context value.
 *
 * @returns The value of the filter context.
 */
export const useCollaboratorsFilter = () => {
  const value = useContext(CollaboratorsFilterContext)

  if (!value) {
    throw new Error('useCollaboratorsFilter must be used inside the Provider')
  }

  return value
}

const FilterType = {
  Role: 'role',
  Type: 'type',
} as const
type FilterType = ObjectValues<typeof FilterType>

export const CollaboratorsFilterProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const roleRegex = useMemo(() => /(admin|read|write)/gi, [])
  const typeRegex = useMemo(() => /(user|team)/gi, [])

  const stripAndTrim = useCallback(
    // Replace all the occurences of role:something or type:something
    (s: string, filterType: FilterType) => {
      const regex = new RegExp(`\\b${filterType}:\\b\\S+`, 'gi')
      return s.replace(regex, '').replace(/\s\s+/g, ' ').trim()
    },
    [],
  )

  const [query, setQuery] = useState('')
  const [textTokens, setTextTokens] = useState(new Array<string>())
  const [role, setRole] = useState<Role>(Role.None)
  const [type, setType] = useState<CollaboratorType>(CollaboratorType.None)

  const setInvalidQuery = (value: string) => {
    setRole(Role.None)
    setType(CollaboratorType.None)
    setTextTokens(value.split(' '))
    setQuery(value)
  }

  const setLocalQuery = useCallback(
    (value: string) => {
      const parsedQuery = parseFullTextQuery(value)
      if (parsedQuery.fieldFilters.length) {
        const parsedRoles = parsedQuery.fieldFilters.filter(c => c[0] === FilterType.Role)
        const parsedTypes = parsedQuery.fieldFilters.filter(c => c[0] === FilterType.Type)

        const invalidRoles = !parsedRoles || parsedRoles.length !== 1
        const invalidTypes = !parsedTypes || parsedTypes.length !== 1

        if (invalidRoles && invalidTypes) {
          // trol:test | role:read role:admin
          setInvalidQuery(value)
          return
        } else {
          let roleAndTypeAreInvalid = true

          if (!invalidRoles) {
            const parsedRole = parsedRoles[0]?.[1] ?? ''
            const roleIsValid = parsedRole.length === 1 && parsedRole[0]?.match(roleRegex)
            if (roleIsValid) {
              setRole(parsedRole[0] as Role)
              roleAndTypeAreInvalid = false
            }
          }

          if (!invalidTypes) {
            const parsedType = parsedTypes[0]?.[1]
            const typeIsValid = parsedType?.length === 1 && parsedType[0]?.match(typeRegex)
            if (typeIsValid) {
              // type:team
              setType(parsedType[0] as CollaboratorType)
              roleAndTypeAreInvalid = false
            }
          }

          if (roleAndTypeAreInvalid) {
            // role:admin,write not supported
            setInvalidQuery(value)
            return
          }
        }
      } else {
        setRole(Role.None)
        setType(CollaboratorType.None)
      }

      setTextTokens(parsedQuery.searchTokens)
      setQuery(value)
    },
    [roleRegex, typeRegex],
  )

  const updateQuery = useCallback(
    (newValue: string, filterType: FilterType) => {
      const values = filterType === FilterType.Role ? query.match(roleRegex) : query.match(typeRegex)

      newValue = newValue.toLocaleLowerCase()

      if (newValue === Role.None || (newValue === CollaboratorType.None && filterType === FilterType.Type)) {
        setLocalQuery(`${stripAndTrim(query, filterType)}`)
        return
      }

      if (values && values.length === 1) {
        setLocalQuery(query.replace(values[0], `${newValue}`))
        return
      }

      let trimmedQuery = query.trimEnd()
      if (values && values.length > 1) trimmedQuery = `${stripAndTrim(query, filterType)}`

      setLocalQuery(`${trimmedQuery}${trimmedQuery.length ? ' ' : ''}${filterType}:${newValue}`)
    },
    [query, roleRegex, typeRegex, setLocalQuery, stripAndTrim],
  )

  const setRoleFilter = useCallback(
    (value: Role) => {
      setRole(value)
      updateQuery(value.toLowerCase(), FilterType.Role)
    },
    [setRole, updateQuery],
  )

  const setTypeFilter = useCallback(
    (value: CollaboratorType) => {
      setType(value)
      updateQuery(value.toLowerCase(), FilterType.Type)
    },
    [updateQuery, setType],
  )
  const match = useCallback(
    (collaborator: Collaborator) => {
      const displayValue = getCollaboratorDisplayValue(collaborator)
      if (textTokens.length === 0 && role === Role.None && type === CollaboratorType.None) {
        return true
      }

      const roleDoesNotMatch =
        role && role !== Role.None && collaborator.role !== rolesMap.get(role.toLowerCase() as Role)
      const typeDoesNotMatch = !!(type && type !== CollaboratorType.None && type !== collaborator.actor_type)

      if (roleDoesNotMatch) {
        return false
      }

      if (typeDoesNotMatch) {
        return false
      }

      if (textTokens.length > 0) {
        return (
          (!!displayValue && freeTextMatch(textTokens, displayValue.toLowerCase())) ||
          (!!collaborator.name && freeTextMatch(textTokens, collaborator.name.toLowerCase()))
        )
      }
      return true
    },
    [role, textTokens, type],
  )

  const filterCtx = useMemo(() => {
    return {
      query,
      setQuery: setLocalQuery,
      roleFilter: role,
      typeFilter: type,
      setTypeFilter,
      setRoleFilter,
      match,
    }
  }, [query, setLocalQuery, role, setRoleFilter, type, setTypeFilter, match])

  return <CollaboratorsFilterContext.Provider value={filterCtx}>{children}</CollaboratorsFilterContext.Provider>
}
