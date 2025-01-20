import {type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState} from 'react'

type FormValues = Record<string, unknown>
type RequestFormContextProps = {
  formValues: FormValues
  onUpdateForm: (formValues: FormValues) => void
  readOnly: boolean
}
const RequestFormContext = createContext<RequestFormContextProps>({
  formValues: {},
  onUpdateForm: () => {},
  readOnly: false,
})

export function RequestFormProvider({
  readOnly,
  formValues: initialFormValues = {},
  children,
}: PropsWithChildren<{readOnly: boolean; formValues?: FormValues}>) {
  const [formValues, setFormValues] = useState(initialFormValues)

  const onUpdateForm = useCallback(
    (newFormValues: FormValues) => {
      setFormValues(current => ({
        ...current,
        ...newFormValues,
      }))
    },
    [setFormValues],
  )

  const value = useMemo(() => ({formValues, onUpdateForm, readOnly}), [formValues, onUpdateForm, readOnly])

  return <RequestFormContext.Provider value={value}>{children}</RequestFormContext.Provider>
}

export function useRequestFormContext() {
  const context = useContext(RequestFormContext)

  if (!context) {
    throw new Error('useRequestFormContext must be used within RequestFormProvider')
  }

  return context
}
