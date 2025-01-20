import {Resources} from '../constants/strings'

export function formatError(mutation: string, message: string) {
  return new Error(Resources.mutationError(mutation, message))
}
