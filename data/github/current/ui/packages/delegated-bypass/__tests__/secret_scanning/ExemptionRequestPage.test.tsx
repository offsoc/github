import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RequestTypeProvider} from '../../contexts/RequestTypeContext'
import {collaborator, monalisaUser, pendingSecretScanningRequest, sampleRuleSuite} from './secret_scanning_helpers'
import {ExemptionRequestPage} from '../../routes/ExemptionRequestPage'
import type {ExemptionRequestPayload} from '../../delegated-bypass-types'

import {checkRadioButtons, checkDetails} from './helpers'

describe('ExemptionRequestPage: pending requests', () => {
  it('renders for the reviewer', async () => {
    const payload: ExemptionRequestPayload = {
      ruleSuite: sampleRuleSuite,
      request: pendingSecretScanningRequest,
      reviewer: {
        isValid: true,
        isRequester: false,
        hasUndismissedReview: false,
        login: collaborator.login,
      },
      rulesets: [],
      responses: [],
    }
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const {user} = await act(async () => {
      return render(
        <RequestTypeProvider requestType="secret_scanning">
          <ExemptionRequestPage />
        </RequestTypeProvider>,
        {routePayload: payload},
      )
    })

    expect(sampleRuleSuite.afterOid).toBeDefined()
    expect(screen.getByText('Push was blocked by secret scanning')).toBeInTheDocument()
    expect(screen.getByText(sampleRuleSuite.afterOid || '')).toBeInTheDocument()
    expect(screen.getAllByRole('button', {name: 'Approve bypass request'})).toHaveLength(1)
    expect(screen.getAllByRole('button', {name: 'Deny bypass request'})).toHaveLength(1)
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()

    await checkDetails(user)

    checkRadioButtons(true, 'false_positive')
  })

  it('renders for the requester', async () => {
    const payload: ExemptionRequestPayload = {
      ruleSuite: sampleRuleSuite,
      request: pendingSecretScanningRequest,
      reviewer: {
        isValid: false,
        isRequester: true,
        hasUndismissedReview: false,
        login: monalisaUser.login,
      },
      rulesets: [],
      responses: [],
    }
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const {user} = await act(async () => {
      return render(
        <RequestTypeProvider requestType="secret_scanning">
          <ExemptionRequestPage />
        </RequestTypeProvider>,
        {routePayload: payload},
      )
    })

    expect(sampleRuleSuite.afterOid).toBeDefined()
    expect(screen.getByText('Push was blocked by secret scanning')).toBeInTheDocument()
    expect(screen.getByText(sampleRuleSuite.afterOid || '')).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Approve bypass request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Deny bypass request'})).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', {name: 'Cancel request'})).toHaveLength(1)

    await checkDetails(user)

    checkRadioButtons(false, null)
  })

  it('renders for other users', async () => {
    const payload: ExemptionRequestPayload = {
      ruleSuite: sampleRuleSuite,
      request: pendingSecretScanningRequest,
      reviewer: {
        isValid: false,
        isRequester: false,
        hasUndismissedReview: false,
        login: 'web-flow',
      },
      rulesets: [],
      responses: [],
    }
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const {user} = await act(async () => {
      return render(
        <RequestTypeProvider requestType="secret_scanning">
          <ExemptionRequestPage />
        </RequestTypeProvider>,
        {routePayload: payload},
      )
    })

    expect(sampleRuleSuite.afterOid).toBeDefined()
    expect(screen.getByText('Push was blocked by secret scanning')).toBeInTheDocument()
    expect(screen.getByText(sampleRuleSuite.afterOid || '')).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Approve bypass request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Deny bypass request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()

    await checkDetails(user)

    checkRadioButtons(false, null)
  })
})
