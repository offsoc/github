import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {DescriptionProvider} from '@github-ui/list-view/ListItemDescriptionContext'
import {ListItemDescriptionItem} from '@github-ui/list-view/ListItemDescriptionItem'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {TitleProvider} from '@github-ui/list-view/ListItemTitleContext'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type React from 'react'

import styles from './SimpleListItem.module.css'

export interface SimpleListItemProps {
  title: string | React.ReactElement<typeof ListItemTitle>
  description?: React.ReactNode
  actions?: [] | [React.ReactNode] | [React.ReactNode, React.ReactNode]
}

export function SimpleListItem(props: SimpleListItemProps) {
  const {title, description, actions = []} = props

  return (
    <>
      <TitleProvider>
        <DescriptionProvider>
          <tr>
            <td colSpan={3 - actions.filter(Boolean).length}>
              {typeof title === 'string' ? <ListItemTitle value={escapeHTML(title)} /> : title}
              <ListItemMainContent>
                <ListItemDescription>
                  <ListItemDescriptionItem className={styles.description}>{description}</ListItemDescriptionItem>
                </ListItemDescription>
              </ListItemMainContent>
            </td>
            {actions[0] ? <td>{actions[0]}</td> : null}
            {actions[1] ? <td>{actions[1]}</td> : null}
          </tr>
        </DescriptionProvider>
      </TitleProvider>
    </>
  )
}

function escapeHTML(unsafe: string): SafeHTMLString {
  return unsafe.replace(/[&<>"']/g, escapeHTMLChar) as SafeHTMLString
}

function escapeHTMLChar(char: string): string {
  switch (char) {
    case '&':
      return '&amp;'
    case '<':
      return '&lt;'
    case '>':
      return '&gt;'
    case '"':
      return '&quot;'
    case "'":
      return '&#039;'
    default:
      return char
  }
}
