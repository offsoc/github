import type {FocusMovementKeys} from '@primer/behaviors'
import {FocusKeys} from '@primer/behaviors'

export const KEY_TO_BIT = {
  ArrowLeft: FocusKeys.ArrowHorizontal,
  ArrowDown: FocusKeys.ArrowVertical,
  ArrowUp: FocusKeys.ArrowVertical,
  ArrowRight: FocusKeys.ArrowHorizontal,
  h: FocusKeys.HL,
  j: FocusKeys.JK,
  k: FocusKeys.JK,
  l: FocusKeys.HL,
  a: FocusKeys.AD,
  s: FocusKeys.WS,
  w: FocusKeys.WS,
  d: FocusKeys.AD,
  Tab: FocusKeys.Tab,
  Home: FocusKeys.HomeAndEnd,
  End: FocusKeys.HomeAndEnd,
  PageUp: FocusKeys.PageUpDown,
  PageDown: FocusKeys.PageUpDown,
  Backspace: FocusKeys.Backspace,
} as {[k in FocusMovementKeys]: FocusKeys}

export const GRID_NAV_KEYS = FocusKeys.ArrowAll | FocusKeys.PageUpDown | FocusKeys.HomeAndEnd | FocusKeys.AD
