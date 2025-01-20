import {useCallback, useState} from 'react'
import {Button, Spinner, Text} from '@primer/react'
import styles from './FooterActions.module.css'

interface FooterActionsProps {
  disabled?: boolean
  onCancel: () => void
  onApply: () => void
  checkStatus?: (callback: () => void) => void
  showError?: boolean
  nextFocusRef?: React.RefObject<HTMLElement>
  overrideButtonStyles?: React.CSSProperties
}

function FooterActions(props: FooterActionsProps) {
  const [showLoading, setShowLoading] = useState(false)

  const onBlur: React.FocusEventHandler<HTMLElement> = useCallback(() => {
    props.nextFocusRef?.current?.focus()
    return true
  }, [props.nextFocusRef])

  const displayLoading = useCallback(() => {
    setShowLoading(true)
  }, [])

  const onApply = useCallback(() => {
    props.onApply()

    setTimeout(() => {
      props?.checkStatus && props.checkStatus(displayLoading)
    }, 600)
  }, [props, displayLoading])

  return (
    <div className={styles.footerContainer}>
      {props.showError ? (
        <Text sx={{py: 3, pl: 3, color: 'var(--fgColor-muted, var(--color-fg-muted))'}}>Error. Please try again.</Text>
      ) : null}
      <div className={styles.buttonsContainer} style={props.overrideButtonStyles ?? {padding: 'var(--base-size-16)'}}>
        {!props.showError && showLoading ? <Spinner size="small" sx={{mr: 2}} /> : null}
        <Button
          size="small"
          onClick={() => props.onCancel()}
          onBlur={event => {
            props.disabled ? onBlur(event) : null
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={props.disabled}
          variant="primary"
          size="small"
          onClick={() => onApply()}
          onBlur={onBlur}
          sx={{ml: 2}}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

export default FooterActions
