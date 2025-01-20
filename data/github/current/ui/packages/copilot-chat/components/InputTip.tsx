import {useMemo} from 'react'

import styles from './InputTip.module.css'

export const InputTip = () => {
  const randomInputTip = useMemo(() => {
    const inputTips = [
      'Shift + Enter for new line',
      'Type / for commands',
      'Type @ for extensions',
      '↑/↓ to cycle previous inputs',
    ]

    return inputTips[Math.floor(Math.random() * inputTips.length)]
  }, [])

  return (
    <p className={`hide-sm mb-0 f6 fgColor-muted pointer-none anim-fade-in ${styles['fade-in-duration']}`}>
      {randomInputTip}
    </p>
  )
}
