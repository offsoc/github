import {useCallback, useMemo} from 'react'

export default function useQueryParam(
  paramName: string,
): [initialValue: string | null, updateQueryParamValue: (value: string) => void] {
  const url = useMemo(() => new URL(window.location.href, window.location.origin), [])
  const paramValue = url.searchParams.get(paramName)
  const initialValue = paramValue ? decodeURIComponent(paramValue) : null

  const updateQueryParamValue = useCallback(
    (value: string) => {
      if (value) {
        const encodedValue = encodeURIComponent(value)
        url.searchParams.set(paramName, encodedValue)
      } else {
        url.searchParams.delete(paramName)
      }

      window.history.replaceState({path: url.toString()}, '', url.toString())
    },
    [paramName, url],
  )

  return [initialValue, updateQueryParamValue]
}
