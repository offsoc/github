import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RequestTypeProvider} from '../../contexts/RequestTypeContext'
import {pendingSecretScanningRequest, sampleContentScanRuleSuite, sampleRuleSuite} from './secret_scanning_helpers'
import {NewExemptionRequestPage} from '../../routes/NewExemptionRequestPage'
import type {NewExemptionRequestPayload} from '../../delegated-bypass-types'
import {checkDetails, checkRadioButtons, checkUser} from './helpers'

describe('NewExemptionRequestPage', () => {
  it('renders for the pushing user, for requests initiated via CLI', async () => {
    const payload: NewExemptionRequestPayload = {
      ruleSuite: sampleRuleSuite,
      resourceId: pendingSecretScanningRequest.resourceId,
      orgGuidanceUrl: 'https://github.com/more-security-info',
      helpUrl: 'https://docs.github.com/secret-scanning-help',
    }
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const {user} = await act(async () => {
      return render(
        <RequestTypeProvider requestType="secret_scanning">
          <NewExemptionRequestPage />
        </RequestTypeProvider>,
        {routePayload: payload},
      )
    })
    expect(screen.getByText('Push was blocked by secret scanning')).toBeInTheDocument()
    expect(screen.getAllByText('Beta')).toHaveLength(1)
    const guidanceLink = screen.getAllByRole('link', {name: 'Review guidance'})
    expect(guidanceLink).toHaveLength(1)
    expect(guidanceLink[0]).toHaveAttribute('href', payload.orgGuidanceUrl)
    const docsLink = screen.getAllByRole('link', {name: 'remove any detected secrets'})
    expect(docsLink).toHaveLength(1)
    expect(docsLink[0]).toHaveAttribute('href', payload.helpUrl)

    const repoLink = screen.getAllByRole('link', {name: sampleRuleSuite.repository.nameWithOwner})
    expect(repoLink).toHaveLength(1)
    expect(repoLink[0]).toHaveAttribute('href', sampleRuleSuite.repository.url)

    expect(screen.getAllByText(sampleRuleSuite.afterOid!)).toHaveLength(1)

    expect(screen.getAllByRole('button', {name: 'Submit request'})).toHaveLength(1)
    expect(screen.getAllByRole('textbox', {name: 'Add a comment *'})).toHaveLength(1)

    await checkDetails(user)
    checkUser('monalisa')
    checkRadioButtons(true, null)
  })

  it('renders for the pushing user, for requests initiated via web editor', async () => {
    const payload: NewExemptionRequestPayload = {
      ruleSuite: sampleContentScanRuleSuite,
      resourceId: pendingSecretScanningRequest.resourceId,
      orgGuidanceUrl: 'https://github.com/more-security-info',
      helpUrl: 'https://docs.github.com/secret-scanning-help',
    }
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const {user} = await act(async () => {
      return render(
        <RequestTypeProvider requestType="secret_scanning">
          <NewExemptionRequestPage />
        </RequestTypeProvider>,
        {routePayload: payload},
      )
    })
    expect(screen.getByText('Push was blocked by secret scanning')).toBeInTheDocument()
    expect(screen.getAllByText('Beta')).toHaveLength(1)
    const guidanceLink = screen.getAllByRole('link', {name: 'Review guidance'})
    expect(guidanceLink).toHaveLength(1)
    expect(guidanceLink[0]).toHaveAttribute('href', payload.orgGuidanceUrl)
    const docsLink = screen.getAllByRole('link', {name: 'remove any detected secrets'})
    expect(docsLink).toHaveLength(1)
    expect(docsLink[0]).toHaveAttribute('href', payload.helpUrl)

    const repoLink = screen.getAllByRole('link', {name: sampleRuleSuite.repository.nameWithOwner})
    expect(repoLink).toHaveLength(1)
    expect(repoLink[0]).toHaveAttribute('href', sampleRuleSuite.repository.url)

    expect(screen.getAllByText(sampleRuleSuite.afterOid!)).toHaveLength(1)

    expect(screen.getAllByRole('button', {name: 'Submit request'})).toHaveLength(1)
    expect(screen.getAllByRole('textbox', {name: 'Add a comment *'})).toHaveLength(1)

    await checkDetails(user, true)
    checkUser('monalisa')
    checkRadioButtons(true, null)
  })
})
