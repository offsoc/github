import {createContext, type PropsWithChildren, useContext, useMemo, useState} from 'react'

import {defaultTitle, defaultTitleHeaderTag, type HeaderTag} from '../constants'

export type TitleContextProps = {
  /**
   * A title provides the NestedListView with a concise, descriptive name that communicates what kind of content it
   * contains. Will be visually hidden.
   */
  title: string

  /**
   * The HTML element used for the visually hidden title. Should change depending on the information hierarchy of the
   * page where the NestedListView is used.
   */
  titleHeaderTag: HeaderTag

  hasMetadataTitle: boolean
  setHasMetadataTitle: (hasMetadataTitle: boolean) => void
}

const TitleContext = createContext<TitleContextProps | undefined>(undefined)

export type TitleProviderProps = PropsWithChildren<{
  /**
   * The HTML element used for the visually hidden title. Should change depending on the information hierarchy of the
   * page where the NestedListView is used. Defaults to an `<h2>` tag.
   */
  titleHeaderTag?: TitleContextProps['titleHeaderTag']
}> &
  Pick<TitleContextProps, 'title'>

export const TitleProvider = ({children, title, titleHeaderTag = defaultTitleHeaderTag}: TitleProviderProps) => {
  const [hasMetadataTitle, setHasMetadataTitle] = useState(false)
  const contextProps = useMemo(
    () =>
      ({
        title: title.trim() || defaultTitle,
        titleHeaderTag,
        hasMetadataTitle,
        setHasMetadataTitle,
      }) satisfies TitleContextProps,
    [hasMetadataTitle, title, titleHeaderTag],
  )
  return <TitleContext.Provider value={contextProps}>{children}</TitleContext.Provider>
}
TitleProvider.displayName = 'NestedListViewTitleProvider'

export const useNestedListViewTitle = () => {
  const context = useContext(TitleContext)
  if (!context) throw new Error('useNestedListViewTitle must be used with TitleProvider.')
  return context
}
