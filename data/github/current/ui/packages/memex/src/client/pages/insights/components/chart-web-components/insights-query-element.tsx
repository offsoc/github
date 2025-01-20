import {InsightsQueryElement} from '@github-ui/insights-charts'
import {forwardRef, useEffect, useImperativeHandle, useRef} from 'react'

import {makeComponentFromWebComponent} from '../../../../components/factories/make-component-from-web-component'

const INSIGHTS_QUERY_ELEMENT_TAG_NAME = 'insights-query-element-memex'

export const insightsQueryWithOpaqueErrorVersionedTagName =
  `${INSIGHTS_QUERY_ELEMENT_TAG_NAME}-with-opaque-error` as const

const cb = (child: Element) => child.setAttribute('error', '')

/**
 * Wrap the insights query element in a way where we can control the error
 * message rendered, to avoid leaking the error to the user, since they're errors
 * related to the generated query, which is opaque to the user.
 *
 * @see https://github.com/github/insights-code/pull/1603#issue-1254113782
 */
class InsightsQueryWithOpaqueError extends InsightsQueryElement {
  override renderError: InstanceType<typeof InsightsQueryElement>['renderError'] = (queryId, message) => {
    super.renderError(queryId, message, {chartCallback: cb})
  }
}

const ReactInsightsQuery = makeComponentFromWebComponent({
  tagName: insightsQueryWithOpaqueErrorVersionedTagName,
  elementClass: InsightsQueryWithOpaqueError,
})

type AutoExecutingInsightsQueryProps = React.ComponentProps<typeof ReactInsightsQuery>

/**
 * This wraps the insights query element in a way where we can attempt to batch updates
 * in a way that the element itself doesn't handle, by debouncing calls to execute query
 */
export const AutoExecutingInsightsQuery = forwardRef<InsightsQueryElement, AutoExecutingInsightsQueryProps>(
  function AutoExecutingInsightsQuery(props, forwardedRef) {
    const ref = useRef<InsightsQueryElement | null>(null)
    useImperativeHandle<InsightsQueryElement | null, InsightsQueryElement | null>(forwardedRef, () => ref.current)
    const timer = useRef<number | null>(null)

    useEffect(() => {
      let isMounted = true
      /**
       * This ensures that we don't accidentally execute the query
       * on the wrong element, in the event it was remounted in between
       * that we began executing and when the `insights-query` element
       * was defined via `customElements.define`.
       */
      const insightsQueryElement = ref.current
      async function executeDebouncedQuery() {
        await window.customElements.whenDefined(insightsQueryWithOpaqueErrorVersionedTagName)

        /**
         * call in a timeout, so that we can clear it later if necessary
         * to avoid making a request for each update in a batch
         */
        timer.current = window.setTimeout(() => {
          if (insightsQueryElement && isMounted) {
            insightsQueryElement.executeQuery()
          }
        })
      }

      executeDebouncedQuery()

      return () => {
        isMounted = false
        if (timer.current) {
          window.clearTimeout(timer.current)
        }
      }
    }, [props.authUrl, props.apiUrl, props.query, props.autoRender, props.options])

    return <ReactInsightsQuery {...props} ref={ref} />
  },
)
