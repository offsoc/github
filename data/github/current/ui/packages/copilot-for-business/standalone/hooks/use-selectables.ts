import {useRef, useState, useMemo, useCallback, useEffect} from 'react'

export type Selectable<T = object> = T

export type SelectableProps<T> = {
  selectables: Array<Selectable<T>>
  key: (selectable: Selectable<T>) => string
  total: number
  filters?: Array<(selectable: Selectable<T>) => boolean>
}

type SelectedMap = Record<string, boolean>

export function useSelectables<T>(props: SelectableProps<T>) {
  const {selectables, total} = props
  const filters = useRef(props.filters ?? [])
  const key = useRef(props.key)

  const [isIndeterminate, setIsIndeterminate] = useState(false)
  const [checked, setChecked] = useState<SelectedMap>({})
  const [allChecked, setAllChecked] = useState(false)
  const [size, setSize] = useState(total ?? selectables.length)

  const checkCount = useMemo(() => {
    return Object.values(checked).filter(Boolean).length
  }, [checked])

  const ableToSelectCount = useMemo(() => {
    return selectables.filter(selectable => {
      return filters.current.every(filter => filter(selectable))
    }).length
  }, [selectables])

  const selectedItems = useMemo(() => {
    return Object.entries(checked).reduce((memo, [id, isChecked]) => {
      if (isChecked) {
        memo.push(id)
      }

      return memo
    }, [] as string[])
  }, [checked])

  const checkAll = useCallback(() => {
    if (allChecked) {
      setAllChecked(false)
      setChecked({})
      return
    }

    setAllChecked(true)
    setChecked(
      props.selectables.reduce((acc, selectable) => {
        if (filters.current.every(filter => filter(selectable))) {
          acc[key.current(selectable)] = true
        }
        return acc
      }, {} as SelectedMap),
    )
  }, [props.selectables, allChecked])

  const isChecked = useCallback(
    (selectable: Selectable<T>) => {
      return !!checked[key.current(selectable)]
    },
    [checked],
  )

  const checkOne = useCallback(
    (selectable: Selectable<T>) => {
      const newChecked = {...checked}
      newChecked[key.current(selectable)] = !isChecked(selectable)
      setChecked(newChecked)
    },
    [checked, isChecked],
  )

  const uncheckAll = useCallback(() => {
    setAllChecked(false)
    setChecked({})
  }, [])

  useEffect(() => {
    if (checkCount === 0) {
      setIsIndeterminate(false)
      setAllChecked(false)
    } else if (checkCount === ableToSelectCount) {
      setIsIndeterminate(false)
      setAllChecked(true)
    } else {
      setIsIndeterminate(true)
      setAllChecked(false)
    }
  }, [size, checkCount, ableToSelectCount])

  useEffect(() => {
    setSize(total ?? selectables.length)
  }, [selectables, total])

  return {
    allChecked,
    checkCount,
    isIndeterminate,
    selectables: props.selectables,
    selectedItems,
    total: props.total,
    isChecked,
    checkOne,
    checkAll,
    uncheckAll,
  }
}
