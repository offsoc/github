import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {Text} from '@primer/react-brand'
import {documentToReactComponents, type Options} from '@contentful/rich-text-react-renderer'

import styles from './Lede.module.css'

type LedeProps = {
  content: Document
}

export const Lede = ({content}: LedeProps) => {
  const option: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return (
          <Text as="p" className={styles.lede} size="500" font="hubot-sans" weight="medium">
            {children}
          </Text>
        )
      },
    },
  }

  return <>{documentToReactComponents(content, option)}</>
}
