import {Flash} from '@primer/react'
import {createPortal} from 'react-dom'
import type {FlashState} from './types'

export function FlashPortal({message, variant}: FlashState) {
  if (!message) return null

  const container = document.getElementById('js-flash-container')

  if (!container) return null

  return createPortal(
    <Flash full variant={variant}>
      {message}
    </Flash>,
    container,
  )
}
