import {screen, fireEvent, act} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EmailSubscriptionForm} from '../EmailSubscriptionForm'
import {
  mockEmailSubscriptionFormPropsFromLinkParams,
  mockEmailSubscriptionFormPropsFromSettings,
  mockEmptyTopicsRespBody,
  mockNotRetriableErrorBody,
  mockRetriableErrorBody,
  mockTopic,
  mockTopicsByParamsResponse,
  mockTopicsByEmailResponse,
} from '../test-utils/mock-data'
import {emailSubscriptionTopicsByEmailPath, emailSubscriptionTopicsByParamsPath} from '@github-ui/paths'

import type {EmailSubscriptionTopicsParams} from '../types'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'

describe('EmailSubscriptionForm partial', () => {
  test('Renders nothing in loading state', () => {
    const props = mockEmailSubscriptionFormPropsFromSettings
    render(<EmailSubscriptionForm {...props} />)
    expect(screen.getByTestId('emailSubscriptionTopicsLoadingContainer')).toBeInTheDocument()
    expect(screen.getByTestId('emailSubscriptionTopicsLoadingContainer')).toBeEmptyDOMElement()
  })

  test('Renders message if no subscriptions found', async () => {
    const props = mockEmailSubscriptionFormPropsFromSettings
    render(<EmailSubscriptionForm {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(emailSubscriptionTopicsByEmailPath(props.paramEmail!), mockEmptyTopicsRespBody)
    })

    const message = 'No subscriptions found'
    const container = await screen.findByTestId('emailSubscriptionTopicsContainer')
    expect(container).toHaveTextContent(message)
  })

  test('Prompts user for new link if error not retriable', async () => {
    const props = mockEmailSubscriptionFormPropsFromSettings
    render(<EmailSubscriptionForm {...props} />)

    await act(() => {
      mockFetch.resolvePendingRequest(emailSubscriptionTopicsByEmailPath(props.paramEmail!), mockNotRetriableErrorBody)
    })

    const message = 'Please click here to request a new subscription management link'
    const container = await screen.findByTestId('emailSubscriptionTopicsContainer')
    expect(container).toHaveTextContent(message)
  })

  test('Prompts user to refresh if error retriable', async () => {
    const props = mockEmailSubscriptionFormPropsFromSettings
    render(<EmailSubscriptionForm {...props} />)
    await act(() => {
      mockFetch.resolvePendingRequest(emailSubscriptionTopicsByEmailPath(props.paramEmail!), mockRetriableErrorBody)
    })

    const message = 'Please refresh the page to try again'
    const container = await screen.findByTestId('emailSubscriptionTopicsContainer')
    expect(container).toHaveTextContent(message)
  })

  describe('EmailSubscriptionForm from settings page', () => {
    test('fetches topics_by_email endpoint', () => {
      const props = mockEmailSubscriptionFormPropsFromSettings
      render(<EmailSubscriptionForm {...props} />)
      expectMockFetchCalledTimes(emailSubscriptionTopicsByEmailPath(props.paramEmail!), 1)
    })

    test('renders topics', async () => {
      const props = mockEmailSubscriptionFormPropsFromSettings
      render(<EmailSubscriptionForm {...props} />)

      await act(() => {
        mockFetch.resolvePendingRequest(
          emailSubscriptionTopicsByEmailPath(props.paramEmail!),
          mockTopicsByEmailResponse,
        )
      })

      const container = await screen.findByTestId('emailSubscriptionTopicsContainer')
      expect(container).toHaveTextContent(mockTopic.name)
      expect(container).toHaveTextContent(mockTopic.description)
    })
  })

  describe('EmailSubscriptionForm from email params page', () => {
    test('fetches topics_by_params endpoint', () => {
      const props = mockEmailSubscriptionFormPropsFromLinkParams
      render(<EmailSubscriptionForm {...props} />)

      expectMockFetchCalledTimes(
        emailSubscriptionTopicsByParamsPath({
          CTID: props.paramCTID,
          ECID: props.paramECID,
          K: props.paramK,
          D: props.paramD,
          PID: props.paramPID,
          TID: props.paramTID,
          CMID: props.paramCMID,
          MK: props.paramMK,
        } as EmailSubscriptionTopicsParams),
        1,
      )
    })

    test('renders topics', async () => {
      const props = mockEmailSubscriptionFormPropsFromLinkParams
      render(<EmailSubscriptionForm {...props} />)

      await act(() => {
        mockFetch.resolvePendingRequest(
          emailSubscriptionTopicsByParamsPath({
            CTID: props.paramCTID,
            ECID: props.paramECID,
            K: props.paramK,
            D: props.paramD,
            PID: props.paramPID,
            TID: props.paramTID,
            CMID: props.paramCMID,
            MK: props.paramMK,
          } as EmailSubscriptionTopicsParams),
          mockTopicsByParamsResponse,
        )
      })

      const container = await screen.findByTestId('emailSubscriptionTopicsContainer')
      expect(container).toHaveTextContent(mockTopic.name)
      expect(container).toHaveTextContent(mockTopic.description)
    })
  })

  describe('can update preferences', () => {
    test('unchecking topic', async () => {
      const props = mockEmailSubscriptionFormPropsFromSettings
      render(<EmailSubscriptionForm {...props} />)

      await act(() => {
        mockFetch.resolvePendingRequest(
          emailSubscriptionTopicsByEmailPath(props.paramEmail!),
          mockTopicsByEmailResponse,
        )
      })

      const checkboxControl = await screen.findByLabelText('GitHub wide')
      // eslint-disable-next-line testing-library/no-node-access
      const topicInputGroup = checkboxControl.closest('.topicInputContainer')!
      // eslint-disable-next-line testing-library/no-node-access
      const realInput = topicInputGroup.querySelector('input[type="hidden"]')!
      // eslint-disable-next-line testing-library/no-node-access
      expect(topicInputGroup.getElementsByTagName('input').length).toBe(2)

      expect(realInput).toBeInTheDocument()
      expect(checkboxControl).toBeInTheDocument()

      expect(checkboxControl).toBeChecked()
      expect(realInput).toHaveValue('true')

      fireEvent.click(checkboxControl)
      expect(realInput).toHaveValue('false')
    })

    test('toggle unsubscribeAll', async () => {
      const props = mockEmailSubscriptionFormPropsFromSettings
      render(<EmailSubscriptionForm {...props} />)

      await act(() => {
        mockFetch.resolvePendingRequest(
          emailSubscriptionTopicsByEmailPath(props.paramEmail!),
          mockTopicsByEmailResponse,
        )
      })

      const checkboxControl = await screen.findByLabelText(mockTopic.name)
      // eslint-disable-next-line testing-library/no-node-access
      const realInput = checkboxControl.closest('.topicInputContainer')!.querySelector('input[type="hidden"]')!

      const unsubAllCheckbox = screen.getByLabelText('Unsubscribe from all topics')

      expect(checkboxControl).toBeChecked()
      expect(realInput).toHaveValue('true')

      fireEvent.click(unsubAllCheckbox)
      expect(realInput).toHaveValue('false')
      expect(checkboxControl).not.toBeChecked()

      fireEvent.click(unsubAllCheckbox)
      expect(realInput).toHaveValue('true')
      expect(checkboxControl).toBeChecked()
    })
  })
})
