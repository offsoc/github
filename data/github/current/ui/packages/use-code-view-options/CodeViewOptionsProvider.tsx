import safeStorage from '@github-ui/safe-storage'
import type {FunctionComponent} from 'react'
import type React from 'react'
import {createContext, useContext, useMemo, useState} from 'react'

const safeLocalStorage = safeStorage('localStorage')

const codeFoldingName = 'codeView.codeFolding'
export const codeWrappingName = 'codeView.codeWrapping'
const codeCenteredOption = 'codeView.centerView'
const openSymbolsName = 'codeView.openSymbolsOnClick'

export interface CodeViewOption {
  name: string
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  label: string
}

const codeViewOptionLabels = new Map([
  [codeFoldingName, 'Show code folding buttons'],
  [codeWrappingName, 'Wrap lines'],
  [codeCenteredOption, 'Center content'],
  [openSymbolsName, 'Open symbols on click'],
])

type CodeViewOptionsContextType = {
  codeFoldingOption: CodeViewOption
  codeWrappingOption: CodeViewOption
  codeCenterOption: CodeViewOption
  openSymbolsOption: CodeViewOption
}

const CodeViewOptionsContext = createContext<CodeViewOptionsContextType>({
  codeFoldingOption: {} as CodeViewOption,
  codeWrappingOption: {} as CodeViewOption,
  codeCenterOption: {} as CodeViewOption,
  openSymbolsOption: {} as CodeViewOption,
})

export const CodeViewOptionsProvider: FunctionComponent<{children: React.ReactNode}> = ({children}) => {
  const codeFoldingOption = useCodeViewOption(codeFoldingName, true)
  const codeWrappingOption = useCodeViewOption(codeWrappingName, false)
  const codeCenterOption = useCodeViewOption(codeCenteredOption, false)
  const openSymbolsOption = useCodeViewOption(openSymbolsName, true)

  const providerValue = useMemo(() => {
    return {codeFoldingOption, codeWrappingOption, codeCenterOption, openSymbolsOption}
  }, [codeFoldingOption, codeWrappingOption, codeCenterOption, openSymbolsOption])
  return <CodeViewOptionsContext.Provider value={providerValue}>{children}</CodeViewOptionsContext.Provider>
}

function useCodeViewOption(name: string, defaultValue: boolean): CodeViewOption {
  const localStorageValue = safeLocalStorage.getItem(name)
  const [enabled, setEnabled] = useState(() => {
    return localStorageValue ? localStorageValue === 'true' : defaultValue
  })
  const label = codeViewOptionLabels.get(name) || ''
  return {name, enabled, setEnabled, label}
}

export function useCodeViewOptions() {
  return useContext(CodeViewOptionsContext)
}
