import {useEffect, useState, useCallback} from 'react'
import {ActionList, Text} from '@primer/react'
import {SelectPanel} from '@primer/react/experimental'

interface Props {
  menuButtonPrefix?: string
  title: string
  defaultMenuButtonOption?: string
  menuButtonOptions?: {[key: string]: string}
  menuButtonVariants?: {[key: string]: string}
  listOptions: {[key: string]: string}
  selectedListOptions: string[]
  listVariants?: {[key: string]: string}
  selectedListVariants?: string[]
  width?: 'small' | 'medium'
  onSaveCallback: {(selectedOptions: string[], selectedVariants: string[]): void}
}

function MultipleSelect(props: Props) {
  const {onSaveCallback, selectedListOptions, selectedListVariants, title, width} = props

  const optionKeys = Object.keys(props.listOptions || {})
  const variantKeys = Object.keys(props.listVariants || {})

  const [selectedOptions, setSelectedOptionsState] = useState<string[]>(selectedListOptions)
  const [selectedVariants, setSelectedVariantsState] = useState<string[]>(selectedListVariants || [])

  useEffect(
    function syncPropsWithState() {
      setSelectedOptionsState(selectedListOptions)
      setSelectedVariantsState(selectedListVariants || [])
    },
    [selectedListOptions, selectedListVariants],
  )

  const onCancel = useCallback(() => {
    setSelectedOptionsState(selectedListOptions)
    setSelectedVariantsState(selectedListVariants || [])
  }, [setSelectedOptionsState, setSelectedVariantsState, selectedListOptions, selectedListVariants])

  const onSave = useCallback(() => {
    onSaveCallback(selectedOptions, selectedVariants)
  }, [onSaveCallback, selectedOptions, selectedVariants])

  const onSelect = useCallback((value: string, list: string[], action: {(selected: string[]): void}) => {
    if (list.includes(value)) {
      action(list.filter(f => f !== value).sort())
    } else {
      action([...list, value])
    }
  }, [])

  const onSelectOption = useCallback(
    (option: string) => {
      onSelect(option, selectedOptions, setSelectedOptionsState)
    },
    [selectedOptions, onSelect],
  )

  const onSelectVariant = useCallback(
    (variant: string) => {
      if (selectedOptions.length !== 0) {
        onSelect(variant, selectedVariants, setSelectedVariantsState)
      }
    },
    [selectedOptions, selectedVariants, onSelect],
  )

  const renderSelected = () => {
    if (selectedListOptions.length === 0) {
      return props.defaultMenuButtonOption
    }
    const renderedOptions = optionKeys.map(value => {
      if (selectedListOptions.includes(value)) {
        return props.menuButtonOptions ? props.menuButtonOptions[value] : props.listOptions[value]
      }
    })
    const prefix = props.menuButtonPrefix || ''
    if (!selectedListVariants || selectedListVariants.length < 1) {
      return (
        <>
          <Text as="span" sx={{color: 'fg.muted'}}>
            {prefix}
          </Text>
          <span>{renderSentence(renderedOptions)}</span>
        </>
      )
    } else {
      const renderedVariants = selectedListVariants?.map(value => {
        return props.menuButtonVariants
          ? props.menuButtonVariants[value]
          : props.listVariants && props.listVariants[value]
      })
      return (
        <>
          <Text as="span" className="hide-sm" sx={{color: 'fg.muted'}}>
            {prefix}
          </Text>
          <span>
            {renderSentence(renderedOptions)}. ({renderSentence(renderedVariants)})
          </span>
        </>
      )
    }
  }

  const renderSentence = (array: Array<string | undefined> | undefined) => {
    if (!array) return
    return array.filter(item => item).join(', ')
  }

  return (
    // eslint-disable-next-line primer-react/no-system-props
    <SelectPanel title={title} onSubmit={onSave} onCancel={onCancel} width={width || 'small'} height="fit-content">
      <SelectPanel.Button size="small">{renderSelected()}</SelectPanel.Button>
      <ActionList>
        {optionKeys.map((option: string, index) => (
          <ActionList.Item
            key={index}
            selected={selectedOptions.includes(option)}
            onSelect={() => onSelectOption(option)}
          >
            {props.listOptions[option]}
          </ActionList.Item>
        ))}
        {props.listVariants && selectedOptions.length !== 0 && (
          <>
            <ActionList.Divider />
            <ActionList selectionVariant="multiple" sx={{p: 0}} role="listbox">
              {variantKeys.map((variant: string, index) => (
                <ActionList.Item
                  key={index}
                  selected={selectedVariants.includes(variant)}
                  onSelect={() => onSelectVariant(variant)}
                >
                  {props.listVariants && props.listVariants[variant]}
                </ActionList.Item>
              ))}
            </ActionList>
          </>
        )}
      </ActionList>
      <SelectPanel.Footer />
    </SelectPanel>
  )
}

export default MultipleSelect
