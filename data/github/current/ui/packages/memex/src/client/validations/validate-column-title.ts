import type {MemexColumn} from '../api/columns/contracts/memex-column'
import {Resources} from '../strings'

interface ValidationResult {
  isValid: boolean
  message: string
}

type ColumnTitleParams = {allColumns: Array<MemexColumn>; reservedColumnNames: Array<string>}

const validationResultErrorWithMessage = (message: string): ValidationResult => ({
  isValid: false,
  message: message.trim(),
})
export const validateColumnTitle = (
  {allColumns, reservedColumnNames}: ColumnTitleParams,
  title: string,
): ValidationResult => {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return validationResultErrorWithMessage(Resources.titleCannotBeBlank)
  }

  const isTitleUnique = !allColumns.some(({name}) => areColumnNamesEqual(name, trimmedTitle))

  if (!isTitleUnique) {
    return validationResultErrorWithMessage(Resources.titleHasAlreadyBeenTaken)
  }

  const isTitleReserved = reservedColumnNames.some(
    reservedName => reservedName.trim().localeCompare(trimmedTitle, undefined, {sensitivity: 'accent'}) === 0,
  )

  if (isTitleReserved) {
    return validationResultErrorWithMessage(Resources.titleIsReserved)
  }

  const doesTitleContainColonCharacter = trimmedTitle.includes(':')

  if (doesTitleContainColonCharacter) {
    return validationResultErrorWithMessage(Resources.titleContainsReservedColonCharacter)
  }

  return {
    isValid: true,
    message: '',
  }
}

const areColumnNamesEqual = (lhs: string, rhs: string): boolean => {
  // Field names are case-insensitive, additionaly spaces and dashes are treated as equal.
  const lhsWithoutSpaces = lhs.replace(/ /g, '-')
  const rhsWithoutSpaces = rhs.replace(/ /g, '-')
  return lhsWithoutSpaces.localeCompare(rhsWithoutSpaces, undefined, {sensitivity: 'accent'}) === 0
}
