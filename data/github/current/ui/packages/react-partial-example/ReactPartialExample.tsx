import styles from './ReactPartialExample.module.css'

export function ReactPartialExample({message}: {message: string}) {
  return <div className={styles['css-module-style']}>Example Partial: {message}</div>
}
