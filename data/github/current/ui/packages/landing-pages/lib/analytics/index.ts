type MarketingAnalyticsEventAttrs = {
  action: string
  tag: string
  context: string
  location: string
}

// Adds "data-analytics-event" attribute to elements for tracking
export function analyticsEvent({action, tag, context, location}: MarketingAnalyticsEventAttrs) {
  return {
    'data-analytics-event': JSON.stringify({
      action,
      tag,
      context,
      location,
      label: `${action}_${tag}_${context}_${location}`,
    }),
  }
}
