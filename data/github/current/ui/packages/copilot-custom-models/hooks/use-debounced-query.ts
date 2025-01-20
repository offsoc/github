import {debounce} from '@github/mini-throttle'
import {useState, useMemo, type ChangeEventHandler} from 'react'

interface UseDebouncedQuery {
  onTextInputChange: ChangeEventHandler<HTMLInputElement>
  query: string
  textInputValue: string
}

export function useDebouncedQuery(): UseDebouncedQuery {
  const [textInputValue, setTextInputValue] = useState('')
  const [query, setQuery] = useState('')
  const debouncedSetQuery = useMemo(() => debounce((q: string) => setQuery(q), 250, {start: false}), [])

  const onTextInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const text = e.target.value
    setTextInputValue(text)
    debouncedSetQuery(text)
  }

  return {onTextInputChange, query, textInputValue}
}
