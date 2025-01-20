import type {FlashProps} from '@primer/react'
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
// useLocation is being used to detect page navs which don't need to be handled by partials.
import {useLocation} from 'react-router-dom'

type Banner = {variant: FlashProps['variant']; message: string}

interface CodeViewBannersContextType {
  banners: Banner[]
  addBanner: (banner: Banner) => void
  addQueuedBanner: (banner: Banner) => void
}

const CodeViewBannersContext = createContext<CodeViewBannersContextType>({
  banners: [],
  addBanner: () => undefined,
  addQueuedBanner: () => undefined,
})

export function useCodeViewBanners() {
  return useContext(CodeViewBannersContext).banners
}
/**
 * Gets a function to add a banner. This function never changes and is thus useful for code in useEffect().
 */
export function useCodeViewAddBanner() {
  return useContext(CodeViewBannersContext).addBanner
}

/**
 * Gets a function to add a banner to the banner queue to make it appear on the next navigate
 * This function never changes and is thus useful for code in useEffect().
 */
export function useCodeViewAddQueuedBanner() {
  return useContext(CodeViewBannersContext).addQueuedBanner
}

export function CodeViewBannersProvider({children}: {children: React.ReactNode}) {
  const location = useLocation()
  const [banners, setBanners] = useState<Banner[]>([])
  const [queuedBanners, setQueuedBanners] = useState<Banner[]>([])
  const addBanner = useCallback((b: Banner) => setBanners(current => [...current, b]), [])
  const addQueuedBanner = useCallback((b: Banner) => setQueuedBanners(current => [...current, b]), [])
  const value = useMemo(() => ({banners, addBanner, addQueuedBanner}), [addBanner, addQueuedBanner, banners])
  // clear banners on page navigation
  useEffect(() => {
    setBanners(queuedBanners)
    setQueuedBanners([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])
  return <CodeViewBannersContext.Provider value={value}>{children}</CodeViewBannersContext.Provider>
}
