import {sendEvent} from '@github-ui/hydro-analytics'
import {attr, controller, target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle'
import {eventToHotkeyString, normalizeHotkey} from '@github-ui/hotkey'
import type {IncludeFragmentElement} from '@github/include-fragment-element'

import {CompletionApi} from './completion-api'
import {Prompt} from './prompt'
import {Context} from './context'
import {GhostManager} from './ghost-manager'
import {GhostManagerV2} from './ghost-manager-v2'
import {TextAreaRuler} from './text-ruler'
import {IssueReferenceContext} from './issue-reference-context'
import {featureFlag} from '@github-ui/feature-flags'
import {KeyboardShortcut} from './keyboard_shortcut'
import {ScreenReaderManager} from './screen-reader-manager'
import {ResponseCleaner} from './response-cleaner'
import type {Ghost} from './ghost'
import {GhostPre, GhostTextArea} from './ghost'

@controller
export class CopilotTextCompletionElement extends HTMLElement {
  @attr contextElementIds: string = ''
  @attr sourceElementId: string = 'missing'
  @attr allowCors: boolean = false
  @attr elementDescription: string = ''
  @attr version: string = 'missing'
  @attr disabled: boolean = false

  @target useCorsCheckbox: HTMLInputElement | undefined
  @target accessibleDialog: HTMLDialogElement | undefined
  @target accessibleDialogText: HTMLDivElement | undefined
  @target accessibleDialogFullText: HTMLDivElement | undefined
  @target accessibleDialogFullTextToggle: HTMLDetailsElement | undefined
  @target accessibleDialogAccept: HTMLButtonElement | undefined
  @target accessibleDialogReject: HTMLButtonElement | undefined

  source: HTMLTextAreaElement | undefined
  logo: HTMLElement | undefined
  useGhostManagerV2: boolean | undefined

  api: CompletionApi = new CompletionApi()
  controller: AbortController = new AbortController()
  issueReferenceContext: IssueReferenceContext | undefined

  // State management
  manager: GhostManager | GhostManagerV2 | null = null
  context: Context | null = null
  unloading: boolean = false
  boundCancelBeforeBailing = this.cancelBeforeBailing.bind(this) // Single instance for removal
  currentSuggestionConfidenceScore: number | undefined = undefined
  useConfidenceTruncation: boolean = false
  suggestionConfidenceThreshold: number = 0.0
  tokenConfidenceThreshold: number = 0.1

  connectedCallback() {
    // We're doing something kind of bad for now by reaching out to our sibling
    // Willing to do it that way though so we can seamlessly FF the main path :shrug:
    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    this.source = document.getElementById(this.sourceElementId) as HTMLTextAreaElement

    if (!this.source) {
      // eslint-disable-next-line no-console
      console.error(`Didn't find element '${this.sourceElementId}' spinning up copilot-text-completion :(`)
      return
    }

    const context = new Context(this.contextElementIds.split(','), this.elementDescription)
    this.context = context

    if (this.version) {
      this.api.userAgent = `${this.api.userAgentBaseName}/${this.version.split(' - ')[0]}`
    }

    if (!this.disabled) {
      this.api.refreshProxyToken()
    }

    this.useGhostManagerV2 = featureFlag.isFeatureEnabled('ghost_pilot_undo_fix')

    // Local to close over
    const localSource = this.source

    const useGhostPre = featureFlag.isFeatureEnabled('ghost_pilot_div')
    let ghost: Ghost
    if (useGhostPre) {
      const ghostElement = this.findOrCreateGhostPre(localSource)
      ghost = new GhostPre(ghostElement)
    } else {
      const ghostElement = this.findOrCreateGhostTextArea(localSource)
      ghost = new GhostTextArea(ghostElement)
    }
    ghost.matchStyles(localSource)

    const rulerTextArea = this.findOrCreateRuler(localSource)
    const ruler = new TextAreaRuler(rulerTextArea)

    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    this.logo = this.getElementsByClassName('copilot-octicon')[0] as HTMLElement
    this.notSuggesting()

    const screenReaderManager = new ScreenReaderManager(
      this.accessibleDialogText,
      this.accessibleDialogFullText,
      this.accessibleDialogFullTextToggle,
    )

    let manager: GhostManager | GhostManagerV2
    if (this.useGhostManagerV2) {
      manager = new GhostManagerV2(localSource, ghost, ruler, screenReaderManager)
    } else {
      manager = new GhostManager(localSource, ghost, ruler, screenReaderManager)
    }

    this.manager = manager
    this.manager.suggestingCallback = () => this.suggesting()
    this.manager.clearingCallback = () => this.notSuggesting()

    this.issueReferenceContext = new IssueReferenceContext()

    new ResizeObserver(() => {
      requestAnimationFrame(() => {
        this.handleResize()
      })
    }).observe(localSource)

    new IntersectionObserver((entries, observer) => {
      const entry = entries.at(0) as IntersectionObserverEntry
      if (entry.intersectionRatio > 0.0) {
        // Only do this once, although with src filtering should be safe if repeats
        this.initializeAsyncContexts()
        observer.disconnect()
      }
    }).observe(localSource)

    if (this.useGhostManagerV2) {
      localSource.addEventListener('beforeinput', e => {
        if (!(manager as GhostManagerV2).hasControl) {
          const isUndo = e.inputType === 'historyUndo'
          this.clearSuggestion(!isUndo)
        }
      })

      localSource.addEventListener('blur', e => {
        if (!this.accessibleDialog?.open) {
          if (manager.hasSuggestion()) {
            let focusableNewTarget: HTMLElement | undefined = undefined
            if (e.relatedTarget && e.relatedTarget instanceof HTMLElement) {
              focusableNewTarget = e.relatedTarget
            }
            // Changing focus only seems to work when done within a setTimeout
            setTimeout(() => {
              localSource.focus({preventScroll: true})
              this.clearSuggestion()

              // Calling focusableNewTarget?.focus() does
              // not actually put focus on the new target and calling
              // blur() on the textarea is the only thing I found that actually
              // moves focus to the new target.
              // eslint-disable-next-line github/no-blur
              localSource.blur()
              setTimeout(() => {
                focusableNewTarget?.focus()
              })
            })
          }
        }
      })
    } else {
      localSource.addEventListener('blur', () => {
        if (!this.accessibleDialog?.open) {
          manager.cancelSuggestion()
        }
      })
    }

    localSource.addEventListener('mousedown', () => {
      this.clearSuggestion()
    })

    // We're literally matching the scroll position so this is valid
    // eslint-disable-next-line github/prefer-observers
    localSource.addEventListener('scroll', () => {
      ghost.forceScroll(localSource.scrollTop)
    })

    localSource.addEventListener('keydown', event => {
      // These get reset before we send telemetry so grab them early
      const contextForTelemetry = this.telemetryContext({
        completion: manager.currentSuggestion,
        rawContext: manager.currentRawContext,
        suggestionConfidence: this.currentSuggestionConfidenceScore,
      })

      const key = eventToHotkeyString(event)
      if (key === normalizeHotkey(KeyboardShortcut.accept) && manager.hasSuggestion()) {
        event.preventDefault()
        manager.acceptSuggestion()
        this.sendEvent('ghost-pilot.completion-accept', contextForTelemetry)
      } else if (key === normalizeHotkey(KeyboardShortcut.accessibleInspect) && manager.hasSuggestion()) {
        event.preventDefault()
        this.accessibleDialog?.showModal()
      } else if (
        normalizeHotkey(KeyboardShortcut.mod) !== key &&
        normalizeHotkey(KeyboardShortcut.mod) !== `${key}+${key}`
      ) {
        // There's a bug in normalizeHotkey that returns "Meta+Meta" instead of "Meta"
        // when passing in "mod" as the key. This is a workaround until the bug is fixed
        // that will also work after.
        if (manager.cancelSuggestion()) {
          this.sendEvent('ghost-pilot.completion-cancelled', contextForTelemetry)
        }
      }
    })

    this.accessibleDialog?.addEventListener('close', () => {
      screenReaderManager.hideFullText()
    })

    this.accessibleDialogAccept?.addEventListener('click', () => {
      const contextForTelemetry = this.telemetryContext({
        completion: manager.currentSuggestion,
        rawContext: manager.currentRawContext,
      })
      manager.acceptSuggestion()
      this.sendEvent('ghost-pilot.completion-accept', contextForTelemetry)
    })

    this.accessibleDialogReject?.addEventListener('click', () => {
      this.clearSuggestion()
    })

    localSource.addEventListener(
      'keyup',
      debounce(async event => {
        // Extracted for testability since debounce() makes dispatching events hard in test...
        this.handleKeyUp(event, manager, context, localSource)
      }, 500),
    )

    // session-resume on fields is tied to pagehide so cancel in beforeunload
    // prior to capturing spacing. Be good by adding/removing listener per
    // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#the_beforeunload_event
    localSource.addEventListener('focus', () => {
      window.addEventListener('beforeunload', this.boundCancelBeforeBailing)
    })

    localSource.addEventListener('blur', () => {
      window.removeEventListener('beforeunload', this.boundCancelBeforeBailing)
    })

    // Make sure we get rid of our beforeunload to be a good citizen?
    window.addEventListener('pagehide', () => {
      window.removeEventListener('beforeunload', this.boundCancelBeforeBailing)
    })

    // Back/forward navigation should cancel suggestions
    window.addEventListener('popstate', this.boundCancelBeforeBailing)

    // Listen to mouseover events on a parent file-attachment element and remove
    // any pending suggestion
    localSource.closest('file-attachment')?.addEventListener('dragenter', () => {
      this.clearSuggestion()
    })

    // Cut off a completion when its average token confidence dips too low. Do this ahead of "response cleaning" as
    // that is arguably a more subjective stab at the same underlying problem of suggestion quality.
    this.useConfidenceTruncation = featureFlag.isFeatureEnabled('GHOST_PILOT_CONFIDENCE_TRUNCATION')
    if (this.useConfidenceTruncation) {
      if (featureFlag.isFeatureEnabled('GHOST_PILOT_CONFIDENCE_TRUNCATION_40')) {
        this.suggestionConfidenceThreshold = 0.4
      } else if (featureFlag.isFeatureEnabled('GHOST_PILOT_CONFIDENCE_TRUNCATION_25')) {
        this.suggestionConfidenceThreshold = 0.25
      }
    }
  }

  async handleKeyUp(
    event: KeyboardEvent,
    manager: GhostManager | GhostManagerV2,
    context: Context,
    localSource: HTMLTextAreaElement,
  ) {
    if (this.disabled) return

    // Abort any previous requests
    this.controller.abort()
    this.context = this.context as Context
    this.issueReferenceContext = this.issueReferenceContext as IssueReferenceContext

    if (!['Escape', 'Backspace', 'Delete', 'Enter'].includes(eventToHotkeyString(event))) {
      if (this.uiCanComplete() && manager.shouldCompleteHere()) {
        this.context.issueReferencesContext = await this.issueReferenceContext.context(localSource.value)
        const prompt = new Prompt(
          localSource.value,
          localSource.selectionStart,
          this.context,
          `ghost_pilot_override_enabled-${this.sourceElementId}`,
          `ghost_pilot_override_prompt-${this.sourceElementId}`,
          `ghost_pilot_override_suffix-${this.sourceElementId}`,
        )
        const {
          prefix,
          suffix,
          context: rawContext,
          rawPrefixLength,
          rawSuffixLength,
          rawContextLength,
        } = prompt.assemble()

        this.sendEvent(
          'ghost-pilot.completion-requested',
          this.telemetryContext({prefix, suffix, rawContext, rawPrefixLength, rawSuffixLength, rawContextLength}),
        )
        this.requesting()

        const selection = localSource.selectionStart
        this.controller = new AbortController()
        const startTime = Date.now()

        let completion = await this.api.complete(
          rawContext + prefix,
          suffix,
          this.controller.signal,
          this.useCorsCheckbox ? this.useCorsCheckbox.checked : this.allowCors,
          `ghost_pilot_override_tokens-${this.sourceElementId}`,
        )

        if (completion !== undefined) {
          if (this.useConfidenceTruncation) {
            // TODO: Perf optimization, don't iterate through token logprobs twice (see updateDiagnostics)
            const newCompletion = []
            let tokenCount = 0
            let sumConfidence = 0
            for (const token of this.api.lastTokens) {
              const logprob = token.token_logprobs[0]
              // If no text for this token, don't factor it into the suggestion score.
              if (logprob <= 0 && token.text) {
                const prob = Math.exp(logprob)
                if (prob < this.tokenConfidenceThreshold) {
                  break
                }
                sumConfidence += prob
                tokenCount++
                if (sumConfidence / tokenCount < this.suggestionConfidenceThreshold) {
                  break
                }
                newCompletion.push(token.text)
              } else {
                break
              }
            }
            completion = newCompletion.join('')
          }

          const responseCleaner = new ResponseCleaner()
          completion = responseCleaner.removeExcessNewlines(completion, suffix)
          completion = responseCleaner.truncateToEndOfSentence(completion, suffix, true)
          completion = responseCleaner.removeRepetition(completion)
        }

        const duration = Date.now() - startTime

        this.currentSuggestionConfidenceScore = undefined
        // Don't let this breaking stop important telemetry below, let it proceed without a confidence score
        try {
          this.currentSuggestionConfidenceScore = this.updateDiagnostics(completion)
        } catch {
          // Do nothing
        }

        const contextForTelemetry = this.telemetryContext({
          prefix,
          suffix,
          rawContext,
          rawPrefixLength,
          rawSuffixLength,
          rawContextLength,
          completion,
          duration,
          suggestionConfidence: this.currentSuggestionConfidenceScore,
          suggestionConfidenceThreshold: this.suggestionConfidenceThreshold,
          tokenConfidenceThreshold: this.tokenConfidenceThreshold,
        })
        if (completion && this.uiCanComplete()) {
          if (manager.showCompletion(completion, selection, rawContext)) {
            this.sendEvent('ghost-pilot.completion-returned', contextForTelemetry)
          }
        } else if (completion) {
          manager.cancelSuggestion()
          this.sendEvent('ghost-pilot.completion-skipped', contextForTelemetry)
        } else {
          manager.cancelSuggestion()
          this.sendEvent('ghost-pilot.completion-empty-response', contextForTelemetry)
        }
      }
    }
  }

  // If we're arriving from a back/forward move our ghosts
  // may already be in the DOM so deal gracefully with that
  private findOrCreateGhostTextArea(localSource: HTMLTextAreaElement): HTMLTextAreaElement {
    const id = `${localSource.id}_ghost`
    const found = document.getElementById(id) as HTMLTextAreaElement | null
    if (found !== null) {
      found.value = ''
      return found
    }

    const transparent = 'rgba(0,0,0,0)'

    const ghost = document.createElement('textarea')
    ghost.id = id
    ghost.disabled = true

    this.mirrorRelevantStyles(localSource, ghost)

    ghost.style.background = 'none'
    ghost.style.color = 'var(--fgColor-muted)'
    ghost.style.resize = 'none'

    // Try to make scrollbar invisible. We can't set overflow because
    // it fouls with actual positioning and text wrapping.
    ghost.style.scrollbarColor = `${transparent} ${transparent}`

    // Make our border transparent just in case something ever misaligns
    ghost.style.borderColor = transparent

    localSource.style.background = transparent
    localSource.style.overscrollBehavior = 'none'

    // TODO: Ugly positioning, do better...
    localSource.style.position = 'relative'
    localSource.style.zIndex = '1'
    ghost.style.position = 'relative'
    ghost.style.zIndex = '0'

    // TODO: Actually match the source's width if %
    ghost.style.width = '100%'

    // Without this we can't set the margin negative more than our height
    ghost.style.display = 'block'

    // When present, this element is used in place of the typical HTML placeholder. In that case,
    // when adding the ghost element, we need to avoid bumping its DOM ordering and hiding it. This
    // DOM query scopes to the parent to avoid issues with multiple textareas/placeholders on the page.
    const placeholder = localSource.parentElement?.querySelector('[data-comment-box-placeholder]')
    if (placeholder) {
      placeholder.insertAdjacentElement('afterend', ghost)
    } else {
      localSource.insertAdjacentElement('afterend', ghost)
    }
    return ghost
  }

  // If we're arriving from a back/forward move our ghosts
  // may already be in the DOM so deal gracefully with that
  private findOrCreateGhostPre(localSource: HTMLTextAreaElement): HTMLPreElement {
    const id = `${localSource.id}_ghost`
    const found = document.getElementById(id) as HTMLPreElement | null
    if (found !== null) {
      found.innerHTML = ''
      return found
    }

    const transparent = 'rgba(0,0,0,0)'

    const ghost = document.createElement('pre')
    ghost.id = id

    this.mirrorRelevantStyles(localSource, ghost)

    ghost.style.background = 'none'
    ghost.style.color = 'var(--fgColor-muted)'
    ghost.style.resize = 'none'
    ghost.style.marginTop = '-16px'

    // Try to make scrollbar invisible. We can't set overflow because
    // it fouls with actual positioning and text wrapping.
    ghost.style.scrollbarColor = `${transparent} ${transparent}`
    ghost.style.overflowY = 'auto'

    // Make our border transparent just in case something ever misaligns
    ghost.style.borderColor = transparent

    localSource.style.background = transparent
    localSource.style.overscrollBehavior = 'none'

    // TODO: Ugly positioning, do better...
    localSource.style.position = 'relative'
    localSource.style.zIndex = '1'
    ghost.style.position = 'relative'
    ghost.style.zIndex = '0'

    // TODO: Actually match the source's width if %
    ghost.style.width = '100%'

    // Without this we can't set the margin negative more than our height
    ghost.style.display = 'block'

    // When present, this element is used in place of the typical HTML placeholder. In that case,
    // when adding the ghost element, we need to avoid bumping its DOM ordering and hiding it. This
    // DOM query scopes to the parent to avoid issues with multiple textareas/placeholders on the page.
    const placeholder = localSource.parentElement?.querySelector('[data-comment-box-placeholder]')
    if (placeholder) {
      placeholder.insertAdjacentElement('afterend', ghost)
    } else {
      localSource.insertAdjacentElement('afterend', ghost)
    }
    return ghost
  }

  private findOrCreateRuler(localSource: HTMLTextAreaElement): HTMLTextAreaElement {
    const id = `${localSource.id}_ghost_ruler`
    const found = document.getElementById(id) as HTMLTextAreaElement | null
    if (found !== null) {
      return found
    }

    const ruler = document.createElement('textarea')
    ruler.id = id
    ruler.disabled = true

    this.mirrorRelevantStyles(localSource, ruler)
    ruler.style.background = '#fff8c5'
    ruler.style.lineHeight = '15px'
    ruler.style.minHeight = '0px'

    // If you want a visible ruler, comment out visibility and see
    // commented code in text-ruler.ts around height.
    ruler.style.display = 'block'
    ruler.style.height = '0px'
    ruler.style.paddingBottom = '0px'
    ruler.style.paddingTop = '0px'
    ruler.style.position = 'relative'
    ruler.style.visibility = 'hidden'

    // TODO: Actually match the source's width if %
    ruler.style.width = '100%'

    localSource.insertAdjacentElement('afterend', ruler)
    return ruler
  }

  // Bit fragile but we copy over styles we know are impactful to the sizing
  //
  // TODO: When trying to just copy _all_ source styles, the scrollHeight
  // stopped reflecting the changing contents. Gotta debug that to get a more
  // general solution here.
  mirrorRelevantStyles(source: HTMLTextAreaElement, destination: HTMLTextAreaElement | HTMLPreElement) {
    const copyStyles = [
      'border',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-left-radius',
      'border-bottom-right-radius',
      'font-family',
      'font-kerning',
      'font-size',
      'font-stretch',
      'font-style',
      'font-variant-alternates',
      'font-variant-caps',
      'font-variant-east-asian',
      'font-variant-emoji',
      'font-variant-ligatures',
      'font-variant-numeric',
      'font-variant-position',
      'font-variation-settings',
      'font-weight',
      'letter-spacing',
      'padding',
      'white-space',
    ]

    const sourceStyles = window.getComputedStyle(source)
    for (const style of copyStyles) {
      const sourceValue = sourceStyles.getPropertyValue(style)
      destination.style.setProperty(style, sourceValue)
    }
  }

  initializeAsyncContexts() {
    // Find our empty include-fragments that haven't gotten src set yet
    // Expects to find data-src on those elements and push it to src to load
    const contexts = document.querySelectorAll('include-fragment[data-ghost-pilot-context]:not([src])')
    for (const contextElement of contexts) {
      const src = contextElement.getAttribute('data-src')
      if (src) {
        ;(contextElement as IncludeFragmentElement).src = new URL(src, window.location.origin).href
        contextElement.removeAttribute('data-src')
      }
    }
  }

  handleResize() {
    if (this.manager?.hasControl) {
      // Showing the suggestion and trigger a resize of the textarea, so we try
      // to explicitly call matchSize in those locations, but as a back-stop we
      // can call it here to make sure that the two elements are aligned.
      this.manager.matchSize()
    } else {
      // If the user resizes the textarea, let's clear any suggestions.
      this.clearSuggestion()
    }
  }

  // This function should be used through its singleton in this class
  // whenever we need to cancel on events like navigating away or reloading.
  // It prevents session-resume from seeing our injected newlines and putting
  // those back on coming back to the page
  //
  // Since these events are window level, we need to manage the listeners
  // carefully.
  //
  // https://developer.chrome.com/docs/web-platform/page-lifecycle-api#the_beforeunload_event
  private cancelBeforeBailing() {
    window.removeEventListener('beforeunload', this.boundCancelBeforeBailing)
    window.removeEventListener('popstate', this.boundCancelBeforeBailing)

    this.unloading = true
    this.manager?.cancelSuggestion()
  }

  // This is the prefered way to clear a suggestion, rather than calling
  // manager.cancelSuggestion directly.
  private clearSuggestion(resetCursorPosition: boolean = true) {
    const contextForTelemetry = this.telemetryContext({
      completion: this.manager?.currentSuggestion,
      rawContext: this.manager?.currentRawContext,
    })
    if (this.manager?.cancelSuggestion(resetCursorPosition)) {
      this.sendEvent('ghost-pilot.completion-cancelled', contextForTelemetry)
    }
  }

  // There are some UI conditions that we don't need GhostManager really
  // caring about (they aren't part of state) so those are captured here.
  //
  // .suggester is from @ # and : suggestions
  // .js-slash-command-menu is from slash commands
  private uiCanComplete(): boolean {
    if (this.useGhostManagerV2) {
      return (
        !this.unloading &&
        !document.querySelector('.suggester, .js-slash-command-menu') &&
        document.activeElement === this.source
      )
    } else {
      return !this.unloading && !document.querySelector('.suggester, .js-slash-command-menu')
    }
  }

  // Returns a confidence score computed for the tokens displayed in the ghost's suggestion.
  // Updates the debug panel's contents if present.
  private updateDiagnostics(completion: string | undefined): number | undefined {
    const payloadDebugView = this.querySelector('[data-id="ghost_pilot_last_payload"]')
    const responseDebugView = this.querySelector('[data-id="ghost_pilot_last_response"]')
    const suggestionDebugView = this.querySelector('[data-id="ghost_pilot_last_suggestion"]')
    const completionDebugView = this.querySelector('[data-id="ghost_pilot_last_joined_response"]')

    const suggestionLogProbs: number[] = []
    const completionLogProbs: number[] = []
    if (payloadDebugView && responseDebugView && suggestionDebugView && completionDebugView) {
      payloadDebugView.textContent = this.api.lastPayload
      responseDebugView.textContent = this.api.lastResponse
      suggestionDebugView.textContent = ''
      completionDebugView.textContent = ''
    }
    let i = 0
    for (const token of this.api.lastTokens) {
      const span1 = document.createElement('span')
      const span2 = document.createElement('span')
      let tokenInSuggestion = false
      // Figure out where in the user-facing suggestion we cut off the returned completion
      if (completion?.indexOf(token['text']) === 0 || completion?.indexOf(token['text'].trim()) === 0) {
        completion = completion?.substring(token['text'].length)
        tokenInSuggestion = true
      } else {
        span1.style.display = 'none'
      }
      // Ensure a number <= 0 to filter out stop characters etc entirely
      if (token.token_logprobs[0] <= 0) {
        const logprob = token.token_logprobs[0]
        completionLogProbs.push(logprob)
        if (tokenInSuggestion) {
          suggestionLogProbs.push(logprob)
        }
        const probPct = Math.exp(logprob) * 100
        if (probPct >= 80) {
          span1.style.color = 'var(--fgColor-success)'
          span2.style.color = 'var(--fgColor-success)'
        } else if (probPct >= 50) {
          span1.style.color = 'var(--fgColor-attention)'
          span2.style.color = 'var(--fgColor-attention)'
        } else if (probPct <= 50) {
          span1.style.color = 'var(--fgColor-danger)'
          span2.style.color = 'var(--fgColor-danger)'
        }
      }

      if (suggestionDebugView && completionDebugView) {
        // The completion's first token will technically sometimes contain the last char(s) of the prompt as well
        span1.textContent = i === 0 ? token['text'] : token['tokens'][0]
        span2.textContent = token['tokens'][0]
        const options = Object.entries(token['top_logprobs'][0] || {})
        const title = []
        options.sort((a, b) => b[1] - a[1])

        for (const option of Object.entries(options)) {
          const probPct = (Math.exp(option[1][1]) * 100).toFixed(2)
          title.push(`${option[1][0]}: ${probPct}%`)
        }
        span1.setAttribute('aria-description', title.join(','))
        span2.setAttribute('aria-description', title.join(','))
        span1.title = title.join('\n')
        span2.title = title.join('\n')
        suggestionDebugView.appendChild(span1)
        completionDebugView.appendChild(span2)
      }
      i++
    }

    const suggestionConfidenceScore = this.logProbsToConfidence(suggestionLogProbs)
    const suggestionConfidence = this.querySelector('[data-id="ghost_pilot_last_suggested_confidence_score"]')
    if (suggestionConfidence) {
      suggestionConfidence.textContent = `${suggestionConfidenceScore}%`
    }

    const completionConfidence = this.querySelector('[data-id="ghost_pilot_last_completed_confidence_score"]')
    if (completionConfidence) {
      const completionConfidenceScore = this.logProbsToConfidence(completionLogProbs)
      completionConfidence.textContent = `${completionConfidenceScore}%`
    }

    return suggestionConfidenceScore
  }

  private telemetryContext({
    prefix,
    suffix,
    rawContext,
    completion,
    duration,
    rawPrefixLength,
    rawSuffixLength,
    rawContextLength,
    suggestionConfidence,
    suggestionConfidenceThreshold,
    tokenConfidenceThreshold,
  }: {
    prefix?: string | null
    suffix?: string | null
    rawContext?: string | null
    completion?: string | null
    duration?: number | null
    rawPrefixLength?: number | null
    rawSuffixLength?: number | null
    rawContextLength?: number | undefined
    suggestionConfidence?: number | undefined
    suggestionConfidenceThreshold?: number | undefined
    tokenConfidenceThreshold?: number | undefined
  }) {
    return {
      prefix_length: prefix?.length,
      suffix_length: suffix?.length,
      context_length: rawContext?.length,
      raw_prefix_length: rawPrefixLength,
      raw_suffix_length: rawSuffixLength,
      raw_context_length: rawContextLength,
      completion_length: completion?.length,
      issue_references: this.issueReferenceContext?.references?.length,
      duration,
      completion_url: this.api.completionsUrl,
      suggestion_confidence: suggestionConfidence,
      suggestion_confidence_threshold: suggestionConfidenceThreshold,
      target: 'layered-textarea',
      target_id: this.source?.id,
      target_length: this.source?.value.length,
      target_description: this.elementDescription,
      token_confidence_threshold: tokenConfidenceThreshold,
      version: this.version.split(' - ')[0],
      version_full: this.version,
    }
  }

  // Easy pinch point for logging/debugging telemetry
  private sendEvent(type: string, context: Record<string, string | number | boolean | undefined | null> = {}) {
    sendEvent(type, context)
  }

  private requesting() {
    if (this.logo) {
      this.logo.hidden = false
      this.logo.style.color = 'gray'
    }
  }

  private suggesting() {
    if (this.logo) {
      this.logo.hidden = false
      this.logo.style.color = 'black'
    }
  }

  private notSuggesting() {
    if (this.logo) {
      this.logo.hidden = true
      // make it obvious if something's out of whack
      this.logo.style.color = 'purple'
    }
  }

  private logProbsToConfidence(logProbs: number[]): number {
    if (logProbs.length === 0) {
      return 0
    } else if (logProbs.length === 1) {
      return Math.exp(logProbs[0] as number) * 100
    }

    const sum = logProbs.slice(1).reduce(
      (a, b) => {
        return a + Math.exp(b)
      },
      Math.exp(logProbs[0] as number),
    )
    return Number(((sum * 100) / logProbs.length).toFixed(2))
  }
}
