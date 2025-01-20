import {useConfirm} from '@primer/react'
import {useCallback, useMemo, type RefObject} from 'react'
import {discardStorageKeys, storageKeys} from '../constants/values'
import {LABELS} from '../constants/labels'
import {clearSessionStorage} from '@github-ui/use-safe-storage/session-storage'
import safeStorage from '@github-ui/safe-storage'
import type {IssueFormRef} from '@github-ui/issue-form/Types'

type UseSafeCloseProps = {
  storageKeyPrefix: string
  issueFormRef?: RefObject<IssueFormRef>
  onCancel: () => void
}

export const useSafeClose = ({storageKeyPrefix, issueFormRef, onCancel}: UseSafeCloseProps) => {
  const confirm = useConfirm()
  const safeSessionStorage = safeStorage('sessionStorage')

  // Local storage stores empty strings as "" after stringifying them, so we need to compare the same.
  const emptyStringValue = useMemo(() => JSON.stringify(''), [])

  const confirmCancel = useCallback(async () => {
    return await confirm({
      title: LABELS.discardConfirmation.title,
      content: LABELS.discardConfirmation.content,
      confirmButtonContent: LABELS.discardConfirmation.confirm,
      confirmButtonType: 'danger',
      cancelButtonContent: LABELS.discardConfirmation.cancel,
    })
  }, [confirm])

  const onSafeClose = useCallback(async () => {
    const hasEnteredData =
      discardStorageKeys(storageKeyPrefix).some(
        key => safeSessionStorage.getItem(key) !== null && safeSessionStorage.getItem(key) !== emptyStringValue,
      ) || issueFormRef?.current?.hasChanges()

    if (!hasEnteredData || (await confirmCancel())) {
      clearSessionStorage(storageKeys(storageKeyPrefix))
      issueFormRef?.current?.clearSessionStorage()
      onCancel()
    }
  }, [storageKeyPrefix, confirmCancel, safeSessionStorage, emptyStringValue, issueFormRef, onCancel])

  return {onSafeClose}
}
