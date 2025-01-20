import type {DescriptionElementProps} from './types'
import {Text, Link} from '@primer/react'

export const DescriptionElement = ({description}: DescriptionElementProps) => {
  return (
    <div className="mt-2">
      <Text className="color-fg-muted" sx={{fontSize: 1}}>
        {description.text}
        <Link href={description.contextUrl} inline>
          {description.contextLinkText}
        </Link>
        .
      </Text>
    </div>
  )
}

export default DescriptionElement
