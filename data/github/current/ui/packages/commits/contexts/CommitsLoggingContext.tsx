import type React from 'react'
import {createContext, useContext} from 'react'

import type {LoggingInformation} from '../types/commits-types'

export const baseLoggingInfo: LoggingInformation = {
  loggingPayload: undefined,
  loggingPrefix: undefined,
}

const CommitsLoggingContext = createContext<LoggingInformation>(baseLoggingInfo)

export function CommitsLoggingInfoProvider({
  children,
  loggingInfo,
}: React.PropsWithChildren<{loggingInfo: LoggingInformation}>) {
  return <CommitsLoggingContext.Provider value={loggingInfo}>{children}</CommitsLoggingContext.Provider>
}

export function useIsLoggingInformationProvided() {
  const loggingInfo = useContext(CommitsLoggingContext)
  const loggingInfoIsPresent = loggingInfo.loggingPayload !== undefined && loggingInfo.loggingPrefix !== undefined
  return loggingInfoIsPresent
}

export function useLoggingInfo() {
  const loggingInfo = useContext(CommitsLoggingContext)

  return loggingInfo
}
