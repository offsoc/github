import type React from 'react'

export function getNodeText(node: React.ReactNode): string {
  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString()
    case 'object':
      if (Array.isArray(node)) {
        return node.map(getNodeText).join('')
      } else if (node !== null && 'props' in node) {
        return getNodeText(node.props.children)
      } else {
        return ''
      }
    default:
      return ''
  }
}

export type Size = 'xl' | 'large' | 'medium' | 'small' | 'sparkline' | number
