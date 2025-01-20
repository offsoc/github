import {Box, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export const TextBlock = ({text}: {text: string}) => <span className="text-block">{text}</span>

export const SpaceBlock = ({text}: {text: string}) => <span className="delimiter space-delimiter">{text}</span>

export const Delimiter = ({delimiter}: {delimiter: string}) => <span className="delimiter">{delimiter}</span>

const keywordStyles: BetterSystemStyleObject = {
  color: 'done.fg',
  borderRadius: 1,
}

export const KeywordBlock = ({keyword}: {keyword: string}) => (
  <Text className="keyword-block" sx={keywordStyles}>
    {keyword}
  </Text>
)

export const KeyBlock = ({text, styles}: {text: string; styles: BetterSystemStyleObject}) => (
  <Box as="span" data-type="filter" sx={styles}>
    {text}
  </Box>
)
