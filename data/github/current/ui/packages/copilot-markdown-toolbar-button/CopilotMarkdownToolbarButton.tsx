import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from 'react'

import {ActionList, ActionMenu, Label} from '@primer/react'

import {isFeatureEnabled} from '@github-ui/feature-flags'
import {testIdProps} from '@github-ui/test-id-props'
import {INIT_EVENT, END_EVENT} from '@github-ui/copilot-summary-banner/constants'
import {verifiedFetch} from '@github-ui/verified-fetch'

export interface CopilotMarkdownToolbarButtonProps {
  anchorId: string
  userLogin: string | undefined
  ghostPilotAvailable: boolean
  ghostPilotEnrolled: boolean
  pullRequestSummaryEnabled: boolean
}

export function CopilotMarkdownToolbarButton({
  anchorId,
  userLogin,
  ghostPilotAvailable,
  ghostPilotEnrolled,
  pullRequestSummaryEnabled,
}: CopilotMarkdownToolbarButtonProps) {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [ghostPilotEnabled, setGhostPilotEnabled] = useState(ghostPilotEnrolled)
  const [summaryDisabled, setSummaryDisabled] = useState<boolean>(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLElement | null>(null)

  const splitActionsEnabled = isFeatureEnabled('copilot_split_actions_enabled')

  const ghostPilotFeature = 'ghost_pilot_pr_autocomplete'
  const ghostPilotToggleEvent = 'copilot-ghost-pilot-toggle'

  const subscribeGhostPilotChanges = (_callback: (enabled: boolean) => void) => {
    const updateGhostPilotToggleState = (e: Event) => {
      if ((e as CustomEvent).detail.enabled !== ghostPilotEnabled) {
        setGhostPilotEnabled((e as CustomEvent).detail.enabled)
      }
    }
    document.addEventListener(ghostPilotToggleEvent, updateGhostPilotToggleState)
    return () => {
      document.removeEventListener(ghostPilotToggleEvent, updateGhostPilotToggleState)
    }
  }

  const getGhostPilotEnabledSnapshot = () => {
    return ghostPilotEnabled
  }

  const ghostPilotToggleState = useSyncExternalStore(subscribeGhostPilotChanges, getGhostPilotEnabledSnapshot)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    buttonRef.current = document.getElementById(anchorId)
    if (buttonRef.current === null) {
      return
    }

    const toggleMenu = () => {
      setMenuOpen(open => !open)
    }

    const button = buttonRef.current
    button.setAttribute('aria-expanded', menuOpen.toString())
    button.addEventListener('click', toggleMenu)
    return () => {
      button.removeEventListener('click', toggleMenu)
    }
  }, [anchorId, menuOpen])

  // Triggers behavior in CopilotSummaryBanner component
  const triggerCopilotSummary = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const form = boxRef.current!.closest('form')
      if (!form) return

      setSummaryDisabled(true)
      setMenuOpen(false)

      const action = event.currentTarget.getAttribute('data-copilot-action')
      const summaryTrigger = new CustomEvent(INIT_EVENT, {bubbles: true, detail: {action}})
      const reenableSummary = () => {
        setSummaryDisabled(false)
      }

      form.dispatchEvent(summaryTrigger)
      form.addEventListener(END_EVENT, reenableSummary, {once: true})
    },
    [boxRef],
  )

  const enableGhostPilot = async () => {
    updateGhostPilotEnrollment(true)
  }

  const disableGhostPilot = async () => {
    updateGhostPilotEnrollment(false)
  }

  const updateGhostPilotEnrollment = async (enrolled: boolean) => {
    if (ghostPilotEnabled && enrolled) {
      return
    }
    if (!ghostPilotEnabled && !enrolled) {
      return
    }
    const updateResponse = await verifiedFetch(
      `/users/${userLogin}/feature_preview/${ghostPilotFeature}/${enrolled ? 'enroll' : 'unenroll'}`,
      {
        method: 'PATCH',
      },
    )

    if (updateResponse.ok) {
      for (const el of document.getElementsByTagName('copilot-text-completion')) {
        // Reversed logic since ghostPilotEnabled is still in the old state
        enrolled ? el.removeAttribute('data-disabled') : el.setAttribute('data-disabled', '')
      }
      const event = new CustomEvent(ghostPilotToggleEvent, {detail: {enabled: !ghostPilotEnabled}})
      setGhostPilotEnabled(enrolled)
      document.dispatchEvent(event)
    }
  }

  return (
    <div ref={boxRef} {...testIdProps('copilot-md-actions')}>
      <ActionMenu open={menuOpen} onOpenChange={setMenuOpen} anchorRef={buttonRef}>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            {(pullRequestSummaryEnabled || splitActionsEnabled) && (
              <>
                <ActionList.Group>
                  <ActionList.GroupHeading>Generate</ActionList.GroupHeading>
                  {pullRequestSummaryEnabled && (
                    <ActionList.Item
                      onSelect={triggerCopilotSummary}
                      disabled={summaryDisabled}
                      data-copilot-action={splitActionsEnabled ? 'summary' : 'all'}
                      {...testIdProps('copilot-pr-summary-btn')}
                    >
                      Summary
                      <ActionList.Description
                        variant="block"
                        data-copilot-action="toggle"
                        {...testIdProps('copilot-pr-toggle-btn')}
                      >
                        Generate a summary of the changes in this pull request.
                      </ActionList.Description>
                    </ActionList.Item>
                  )}
                  {splitActionsEnabled && (
                    <ActionList.Item
                      onSelect={triggerCopilotSummary}
                      disabled={summaryDisabled}
                      data-copilot-action="outline"
                      {...testIdProps('copilot-pr-outline-btn')}
                    >
                      Outline
                      <ActionList.Description variant="block">
                        Generate a list of the most important changed files in this pull request.
                      </ActionList.Description>
                    </ActionList.Item>
                  )}
                </ActionList.Group>
              </>
            )}
            {ghostPilotAvailable && (pullRequestSummaryEnabled || splitActionsEnabled) && <ActionList.Divider />}
            {ghostPilotAvailable && (
              <>
                <ActionList.Group>
                  <ActionList.GroupHeading>Settings</ActionList.GroupHeading>
                  <ActionMenu>
                    <ActionMenu.Anchor>
                      <ActionList.Item
                        id="ghostPilotFeaturePreview"
                        {...testIdProps('copilot-autocomplete-toggle-btn')}
                      >
                        Text complete <Label variant="success">Beta</Label>
                        <ActionList.Description variant="block">Text completions while typing</ActionList.Description>
                      </ActionList.Item>
                    </ActionMenu.Anchor>
                    <ActionMenu.Overlay>
                      <ActionList selectionVariant="single">
                        <ActionList.Item
                          onSelect={enableGhostPilot}
                          role="menuitemcheckbox"
                          selected={ghostPilotToggleState}
                        >
                          Enabled
                        </ActionList.Item>
                        <ActionList.Item
                          onSelect={disableGhostPilot}
                          role="menuitemcheckbox"
                          selected={!ghostPilotToggleState}
                          {...testIdProps('copilot-autocomplete-disable-btn')}
                        >
                          Disabled
                        </ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </ActionList.Group>
              </>
            )}
            <ActionList.Divider />
            <ActionList.LinkItem
              href="https://docs.github.com/copilot/github-copilot-enterprise/copilot-pull-request-summaries/about-copilot-pull-request-summaries"
              target="_blank"
              {...testIdProps('copilot-pr-summary-rai-ux')}
            >
              Documentation
              <ActionList.Description variant="block">
                Learn more on how to use Copilot for pull requests.
              </ActionList.Description>
            </ActionList.LinkItem>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}
