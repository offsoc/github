import './diff-view/rails/CopilotDiffChatPartial'

// Uses IntersectionObserver on construction via CopilotDiffEntryElement.store, so cannot be SSR. This is fine since
// it's not visible on load anyway - there's no benefit to SSRing it.
// import './CopilotDiffEntryElement'
