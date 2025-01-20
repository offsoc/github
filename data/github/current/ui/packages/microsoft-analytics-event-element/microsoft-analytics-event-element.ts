import {controller, attr} from '@github/catalyst'
import type {PageActionEventType, PageActionPropertiesType} from '@github-ui/microsoft-analytics'
import {trackPageAction, waitForInitialization} from '@github-ui/microsoft-analytics'

const MS_EVENT_BEHAVIORS = {
  // defined by Microsoft's IDEAs Web Instrumentation Guidance
  purchase: 87,
  trial: 200,
  contact: 162,
}

@controller
export class MicrosoftAnalyticsEventElement extends HTMLElement {
  @attr behavior: 'purchase' | 'trial' | 'contact'
  @attr accountType: 'new' | 'existing'
  @attr orderId: string
  @attr productTitle: string
  @attr periodType: 'month' | 'year' | 'free'
  @attr seats: number

  async connectedCallback() {
    const isInitialized = await waitForInitialization()
    if (isInitialized) {
      this.#sendEvent()
    }
  }

  #sendEvent() {
    const pageActionEvent = <PageActionEventType>{
      behavior: MS_EVENT_BEHAVIORS[this.behavior],
      name: window.location.pathname,
      uri: window.location.href,
    }

    if (['purchase', 'trial'].includes(this.behavior)) {
      pageActionEvent.properties = {
        pageTags: {
          gitHubAccountType: this.accountType,
          orderInfo: {
            id: this.orderId,
            lnItms: [
              {
                title: this.productTitle,
                qty: this.seats,
                ...(this.periodType && {prdType: this.periodType}),
              },
            ],
          },
          metaTags: {},
        },
      }
    }

    if (this.behavior === 'contact') {
      pageActionEvent.properties = {
        pageTags: {
          mkto_progid: this.productTitle,
          mkto_progname: `${this.productTitle}-ContactSalesForm`,
          mkto_ordid: this.orderId,
        },
      }
    }

    const pageActionProperties = <PageActionPropertiesType>{
      refUri: document.referrer,
    }

    trackPageAction(pageActionEvent, pageActionProperties)
  }
}
