import {useMemo} from 'react'

import {defaultHeaderTags, type HeaderTag, type HeaderTagLevel, HeaderTagLevels, HeaderTags} from '../constants'
import {useNestedListViewTitle} from '../context/TitleContext'

export function useNextHeaderTag(level: HeaderTagLevel): HeaderTag {
  const {titleHeaderTag, hasMetadataTitle} = useNestedListViewTitle()

  const titleTag = useMemo(() => {
    const levelIndex = HeaderTagLevels.findIndex(e => e === level)
    const headerIndex = HeaderTags.indexOf(titleHeaderTag) + (hasMetadataTitle ? levelIndex : levelIndex - 1)

    // https://github.com/github/issues/issues/7295#issuecomment-1679724969
    // We return h6 even if the preceeding title is h6 for screen reader users to quickly navigate via heading
    if (headerIndex > HeaderTags.length - 1) return 'h6'

    return HeaderTags[headerIndex] || defaultHeaderTags[level]
  }, [titleHeaderTag, hasMetadataTitle, level])

  return titleTag
}
