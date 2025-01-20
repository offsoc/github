import type {FlashProps} from '@primer/react'
import {createContext, useContext, useMemo, useState} from 'react'

export type Banner = {variant: Extract<FlashProps['variant'], 'success' | 'danger'>; message: string}

interface DelegatedBypassContextType {
  banner?: Banner
  setBanner: (banner?: Banner) => void
}

const DelegatedBypassBannersContext = createContext<DelegatedBypassContextType>({
  banner: undefined,
  setBanner: () => undefined,
})

/**
 * Gets a function to add a banner. This function never changes and is thus useful for code in useEffect().
 */
export function useDelegatedBypassBanner() {
  return useContext(DelegatedBypassBannersContext).banner
}
/**
 * Gets a function to add a banner. This function never changes and is thus useful for code in useEffect().
 */
export function useDelegatedBypassSetBanner() {
  return useContext(DelegatedBypassBannersContext).setBanner
}

export function DelegatedBypassBannersProvider({children}: {children: React.ReactNode}) {
  const [banner, setBanner] = useState<Banner>()
  const value = useMemo(() => ({banner, setBanner}), [banner, setBanner])
  return <DelegatedBypassBannersContext.Provider value={value}>{children}</DelegatedBypassBannersContext.Provider>
}
