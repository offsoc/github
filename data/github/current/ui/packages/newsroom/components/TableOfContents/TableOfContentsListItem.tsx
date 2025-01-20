import {documentToReactComponents, type Options} from '@contentful/rich-text-react-renderer'
import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {Text} from '@primer/react-brand'
import {Children, type ReactNode} from 'react'

import {slugify} from '@github-ui/swp-core/lib/utils/slugify'

import styles from './TableofContents.module.css'

type TableOfContentsListItemProps = {
  content: Document
  active: string | undefined
  analyticsId: string
  handleOnClick: () => void
}

export const TableOfContentsListItem = ({content, active, handleOnClick}: TableOfContentsListItemProps) => {
  const parseHeaderIds = (header: ReactNode): {id: string; text: string} | null => {
    const maybeHeading = Children.toArray(header)[0]

    if (typeof maybeHeading !== 'string') {
      setTimeout(() => {
        throw new Error('The table of content is receiving a non-string header')
      }, 0)

      return null
    }

    return {
      id: slugify(maybeHeading),
      text: maybeHeading,
    }
  }

  const listItem = ({id, text}: {id: string; text: string}) => {
    return (
      <li key={id}>
        <a
          href={`#${id}`}
          className={`${styles.linkButton} ${styles.tableOfContentsListItem}`}
          onClick={handleOnClick}
          aria-current={active === id ? 'location' : undefined}
        >
          <Text variant={active === id ? 'default' : 'muted'} size="100" weight={active === id ? 'bold' : 'normal'}>
            {text}
          </Text>
        </a>
      </li>
    )
  }

  const options: Options = {
    renderNode: {
      [BLOCKS.HEADING_2]: (_, children) => {
        const headerStruct = parseHeaderIds(children)
        return headerStruct !== null ? listItem(headerStruct) : null
      },
      [BLOCKS.HEADING_3]: () => {
        return null
      },
      [BLOCKS.HEADING_4]: () => {
        return null
      },
      [BLOCKS.HEADING_5]: () => {
        return null
      },
      [BLOCKS.HEADING_6]: () => {
        return null
      },
      [BLOCKS.PARAGRAPH]: () => {
        return null
      },
      [BLOCKS.OL_LIST]: () => null,
      [BLOCKS.UL_LIST]: () => null,
      [BLOCKS.HR]: () => null,
      [BLOCKS.QUOTE]: () => null,
      [BLOCKS.EMBEDDED_ENTRY]: () => null,
      [BLOCKS.EMBEDDED_ASSET]: () => null,
    },
  }

  return <>{documentToReactComponents(content, options)}</>
}
