import {useState, createRef, useCallback, useMemo} from 'react'
import {ActionMenu, Dialog} from '@primer/react'
import {BellSlashIcon, EyeIcon} from '@primer/octicons-react'
import {updateSettings} from './services/api'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import SubscriptionList from './components/SubscriptionList'
import ThreadList, {type ThreadType} from './components/ThreadList'
import {SubscriptionTypeValue, subscriptionLabelText, subscriptionTypeText} from './utils/subscriptions'
import styles from './NotificationsSubscriptionsMenu.module.css'

export type LabelType = {
  id: number
  name: string
  html: string
  color: string
  description?: string
  subscribed: boolean
}

export interface NotificationsSubscriptionsMenuProps {
  repositoryId: string
  repositoryName: string
  watchersCount: number
  subscriptionType: string
  subscribableThreadTypes: ThreadType[]
  repositoryLabels: LabelType[]
  showLabelSubscriptions: boolean
}

export function NotificationsSubscriptionsMenu({
  repositoryId,
  repositoryName,
  watchersCount,
  subscriptionType,
  subscribableThreadTypes,
  repositoryLabels,
  showLabelSubscriptions,
}: NotificationsSubscriptionsMenuProps) {
  const repoLabels = useMemo(() => {
    return repositoryLabels.map(label => ({id: label.id, text: label.name, selected: label.subscribed}))
  }, [repositoryLabels])
  const selectedLabels = repoLabels.filter(item => item.selected)

  const subscribedThreads = useMemo(() => {
    return subscribableThreadTypes
      .map(thread =>
        thread.subscribed || (thread.name === 'Issue' && showLabelSubscriptions && selectedLabels.length > 0)
          ? thread.name
          : null,
      )
      .filter(t => t !== null)
  }, [subscribableThreadTypes, showLabelSubscriptions, selectedLabels])

  const [showError, setShowError] = useState(false)

  // dialog
  const [isOpen, setIsOpen] = useState(false)

  // Subscription menu states
  const [selectedSubscription, setSelectedSubscription] = useState(
    subscribedThreads.length > 0 ? SubscriptionTypeValue.CUSTOM : subscriptionType,
  )
  const [previousSubscription, setPreviousSubscription] = useState<string>(selectedSubscription)

  // Thread menu states
  const [appliedThreads, setAppliedThreads] = useState<string[]>(subscribedThreads)
  const [appliedLabels, setAppliedLabels] = useState<ItemInput[]>(selectedLabels)
  const [isSavingThreads, setIsSavingThreads] = useState<boolean>(false)

  const anchorRef = createRef<HTMLButtonElement>()

  const onCloseDialog = useCallback(() => {
    setIsOpen(false)
    setSelectedSubscription(previousSubscription)
  }, [previousSubscription])

  const onCancelCustomMenu = onCloseDialog

  const saveThreads = useCallback(
    async (selectedThreads: string[], selectedRepoLabels: ItemInput[]) => {
      setIsSavingThreads(true)
      setAppliedThreads(selectedThreads)
      setAppliedLabels(selectedRepoLabels)
      setPreviousSubscription(SubscriptionTypeValue.CUSTOM)

      const formData = new FormData()
      formData.set('do', 'custom')
      formData.set('repository_id', repositoryId)
      // save thread types
      selectedThreads.map(threadName => {
        formData.append(`thread_types[]`, threadName)
      })
      // save labels
      selectedRepoLabels.map(label => {
        label.id ? formData.append(`labels[]`, label.id.toString()) : null
      })

      const response = await updateSettings(formData)
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (response.ok) {
        setIsOpen(false)
        setIsSavingThreads(false)
      } else {
        setShowError(true)
      }
    },
    [repositoryId],
  )

  const saveData = useCallback(
    async (option: string) => {
      const formData = new FormData()
      if (option === SubscriptionTypeValue.IGNORING) {
        formData.set('do', 'ignore')
      } else if (option === SubscriptionTypeValue.WATCHING) {
        formData.set('do', 'subscribed')
      } else if (
        option === SubscriptionTypeValue.NONE ||
        (option === SubscriptionTypeValue.CUSTOM && appliedThreads.length === 0)
      ) {
        formData.set('do', 'included')
      }

      formData.append(`thread_types[]`, '')

      formData.set('repository_id', repositoryId)
      await updateSettings(formData)
    },
    [repositoryId, appliedThreads],
  )

  // Select menu option: Participating and @mentions, All Activity, Ignore, Custom
  const selectMenuOption = useCallback(
    (option: string) => {
      if (option === SubscriptionTypeValue.CUSTOM) {
        setIsOpen(true)
        setSelectedSubscription(SubscriptionTypeValue.CUSTOM)
      } else {
        setSelectedSubscription(option)
        setPreviousSubscription(option)
        saveData(option)
        setAppliedThreads([])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSelectedSubscription],
  )

  const applyThreads = useCallback(
    (selectedThreads: string[]) => {
      setAppliedThreads(selectedThreads)
    },
    [setAppliedThreads],
  )

  const ariaLabel = useMemo(
    () => subscriptionLabelText(selectedSubscription, repositoryName),
    [selectedSubscription, repositoryName],
  )

  return (
    <>
      <div className="d-md-none">
        <ActionMenu>
          <ActionMenu.Button
            data-testid="notifications-subscriptions-menu-button-desktop"
            leadingVisual={selectedSubscription === SubscriptionTypeValue.IGNORING ? BellSlashIcon : EyeIcon}
            trailingAction={null}
            className={styles.watchButton}
            aria-label={ariaLabel}
          >
            <></>
          </ActionMenu.Button>
          <ActionMenu.Overlay width="medium">
            <SubscriptionList selected={selectedSubscription} onSelect={selectMenuOption} />
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
      <div className="d-none d-md-block">
        <ActionMenu>
          <ActionMenu.Button
            data-testid="notifications-subscriptions-menu-button-mobile"
            size="small"
            leadingVisual={selectedSubscription === SubscriptionTypeValue.IGNORING ? BellSlashIcon : EyeIcon}
            sx={{'&& [data-component="leadingVisual"]': {color: 'var(--fgColor-muted, var(--color-fg-muted))'}}}
            aria-label={ariaLabel}
          >
            {subscriptionTypeText(selectedSubscription)}
            <span className={`ml-2 Counter rounded-3 ${styles.watchCounter}`}>{watchersCount}</span>
          </ActionMenu.Button>
          <ActionMenu.Overlay width="medium">
            <SubscriptionList selected={selectedSubscription} onSelect={selectMenuOption} />
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
      <Dialog returnFocusRef={anchorRef} isOpen={isOpen} onDismiss={() => onCloseDialog()} aria-labelledby="header">
        <div data-testid="inner">
          <Dialog.Header id="header">Subscribe to events for {repositoryName}</Dialog.Header>
          <ThreadList
            subscribableThreadTypes={subscribableThreadTypes}
            showLabelSubscriptions={showLabelSubscriptions}
            cancelMenuCallback={onCancelCustomMenu}
            appliedThreads={appliedThreads}
            repoLabels={repoLabels}
            subscribedThreads={subscribedThreads}
            applyThreads={applyThreads}
            appliedLabels={appliedLabels}
            saveThreads={saveThreads}
            showError={showError}
            isSavingThreads={isSavingThreads}
          />
        </div>
      </Dialog>
    </>
  )
}
