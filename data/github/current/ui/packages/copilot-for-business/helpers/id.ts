import type {SeatAssignable} from '../types'
import {SeatType} from '../types'

export const id = (assignable: SeatAssignable) => {
  let idToUse
  switch (assignable.type) {
    case SeatType.Team:
    case SeatType.User: {
      idToUse = assignable.id
      break
    }
    default: {
      idToUse = assignable.display_login
      break
    }
  }
  return `${assignable.type}-${idToUse}`
}
