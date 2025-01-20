import {noop} from '@github-ui/noop'
import {createContext, type PropsWithChildren, useContext, useMemo} from 'react'

import {defaultVariant, type Variants} from '../constants'

export type VariantType = (typeof Variants)[number]

type VariantContextProps = {
  /**
   * How the list is being displayed. Controls the width and height of the list and its contents.
   */
  variant: VariantType
  setVariant: (variant: VariantType) => void
}

const VariantContext = createContext<VariantContextProps | undefined>(undefined)

export type VariantProviderProps = PropsWithChildren<{
  variant?: VariantContextProps['variant']
  setVariant?: VariantContextProps['setVariant']
}>

export const VariantProvider = ({children, variant = defaultVariant, setVariant = noop}: VariantProviderProps) => {
  const contextProps = useMemo(() => ({variant, setVariant}) satisfies VariantContextProps, [setVariant, variant])
  return <VariantContext.Provider value={contextProps}>{children}</VariantContext.Provider>
}

VariantProvider.displayName = 'ListViewVariantProvider'

export const useListViewVariant = () => {
  const context = useContext(VariantContext)
  if (!context) throw new Error('useListViewVariant must be used with VariantProvider.')
  return context
}
