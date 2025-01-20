import {useState, useCallback, useEffect} from 'react'
import {Text, Checkbox, FormControl} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import FilterLabels from './FilterLabels'
import FooterActions from './FooterActions'
import {labelsCounterText} from '../utils/labels'
import {threadNameText} from '../utils/threads'
import styles from './ThreadList.module.css'

export type ThreadType = {
  name: string
  enabled: boolean
  subscribed: boolean
}

interface ThreadListProps {
  subscribableThreadTypes: ThreadType[]
  showLabelSubscriptions: boolean
  repoLabels: ItemInput[]
  cancelMenuCallback: () => void
  appliedThreads: string[]
  appliedLabels: ItemInput[]
  subscribedThreads: string[]
  applyThreads: (selectedThreads: string[]) => void
  saveThreads: (selectedThreads: string[], selectedLabels: ItemInput[]) => Promise<unknown>
  showError: boolean
  isSavingThreads?: boolean
}

function ThreadList(props: ThreadListProps) {
  const [selectedThreads, setSelectedThread] = useState<string[]>(props.appliedThreads)
  const [previousLabels, setPreviousLabels] = useState<ItemInput[]>(props.appliedLabels)
  const [selectedLabels, setSelectedLabels] = useState<ItemInput[]>(props.appliedLabels)
  const [labelsText, setLabelsText] = useState<string>(labelsCounterText(props.appliedLabels))

  useEffect(() => {
    // On first render, check if there are labels selected to select the Issue thread by default
    if (props.appliedLabels.length > 0 && !selectedThreads.includes('Issue')) {
      setSelectedThread([...selectedThreads, 'Issue'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggle thread selection menu
  const toggleThread = useCallback(
    (optionThread: string) => {
      if (selectedThreads && selectedThreads.includes(optionThread)) {
        setSelectedThread(selectedThreads.filter(thread => thread !== optionThread))
      } else {
        setSelectedThread([...selectedThreads, optionThread])
      }
    },
    [selectedThreads],
  )

  const filterAction = useCallback(() => {
    props.applyThreads(selectedThreads)
  }, [props, selectedThreads])

  const onChangeLabels = useCallback((selected: ItemInput[]) => {
    setSelectedLabels(selected)
    setLabelsText(labelsCounterText(selected))
  }, [])

  const applyLabels = useCallback(() => {
    setPreviousLabels(selectedLabels)
  }, [selectedLabels])

  const resetLabels = useCallback(() => {
    setSelectedLabels(previousLabels)
    setLabelsText(labelsCounterText(previousLabels))
  }, [previousLabels])

  return (
    <>
      <div className={styles.threadContent}>
        {props.subscribableThreadTypes.map((thread, index) => (
          <div
            key={index}
            className={styles.threadRow}
            style={
              index === props.subscribableThreadTypes.length - 1
                ? {}
                : {
                    borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
                  }
            }
          >
            <FormControl>
              <Checkbox checked={selectedThreads.includes(thread.name)} onChange={() => toggleThread(thread.name)} />
              <FormControl.Label>{threadNameText(thread.name)}</FormControl.Label>
            </FormControl>
            {!thread.enabled ? (
              <Text as="p" sx={{fontSize: '12px', m: 0, color: 'var(--fgColor-muted)', ml: 'var(--base-size-24)'}}>
                {threadNameText(thread.name)} are not enabled for this repository
              </Text>
            ) : null}
            <div aria-live="polite">
              {thread.name === 'Issue' && props.showLabelSubscriptions && selectedThreads.includes('Issue') ? (
                <div className={styles.filterContainer}>
                  <FilterLabels
                    filterAction={filterAction}
                    items={props.repoLabels}
                    labelsText={labelsText}
                    onChangeLabels={onChangeLabels}
                    selectedLabels={selectedLabels}
                    applyLabels={applyLabels}
                    resetLabels={resetLabels}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <FooterActions
        onCancel={props.cancelMenuCallback}
        onApply={() => props.saveThreads(selectedThreads, selectedLabels)}
        showError={props.showError}
        disabled={selectedThreads.length === 0 || props.isSavingThreads}
      />
    </>
  )
}

export default ThreadList
