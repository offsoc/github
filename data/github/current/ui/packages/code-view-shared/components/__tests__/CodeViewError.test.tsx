import type {PageError} from '@github-ui/react-core/app-routing-types'
import type {RefInfo} from '@github-ui/repos-types'
import {screen} from '@testing-library/react'

import {testTreePayload} from '../../__tests__/test-helpers'
import {render} from '@github-ui/react-core/test-utils'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../contexts/FilesPageInfoContext'
import type {FileTreePagePayload} from '@github-ui/code-view-types'
import {CodeViewError} from '../CodeViewError'

const renderCodeViewError = (payload: FileTreePagePayload, error: PageError) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <CodeViewError {...error} />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

test('renders 404 httpError error', async () => {
  renderCodeViewError(testTreePayload, {httpStatus: 404, type: 'httpError'})

  expect(screen.getByText('404 - page not found')).toBeInTheDocument()
  expect(screen.getByTestId('eror-404-description')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /go to Overview/i})).toBeInTheDocument()
  expect(screen.getByText('Return to the repository overview')).toBeInTheDocument()
})

test('renders 500 httpError error', async () => {
  renderCodeViewError(testTreePayload, {httpStatus: 500, type: 'httpError'})

  expect(screen.getByText('Error loading page')).toBeInTheDocument()
  expect(screen.getByTestId('default-error-description')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /go to Overview/i})).toBeInTheDocument()
  expect(screen.getByText('Return to the repository overview')).toBeInTheDocument()
})

test('renders fetchError error', async () => {
  renderCodeViewError(testTreePayload, {type: 'fetchError'})

  expect(screen.getByText('Error loading page')).toBeInTheDocument()
  expect(screen.getByTestId('fetch-error-description')).toBeInTheDocument()
  expect(screen.getByText('It looks like your internet connection is down. Please check it.')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /go to Overview/i})).toBeInTheDocument()
  expect(screen.getByText('Return to the repository overview')).toBeInTheDocument()
})

test('renders badResponseError error', async () => {
  renderCodeViewError(testTreePayload, {type: 'badResponseError'})

  expect(screen.getByText('Error loading page')).toBeInTheDocument()
  expect(screen.getByTestId('default-error-description')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /go to Overview/i})).toBeInTheDocument()
  expect(screen.getByText('Return to the repository overview')).toBeInTheDocument()
})

test('renders when no refInfo', async () => {
  const testTreePayloadNoRefInfo = {
    ...testTreePayload,
    refInfo: {
      name: 'main-invalid',
      listCacheKey: 'key',
      canEdit: true,
      currentOid: '',
    } as RefInfo,
  }
  renderCodeViewError(testTreePayloadNoRefInfo, {httpStatus: 404, type: 'httpError'})

  expect(screen.getByText('404 - page not found')).toBeInTheDocument()
  expect(screen.getByText('Cannot find a valid ref in')).toBeInTheDocument()
  expect(screen.getByTestId('error-404-description')).toBeInTheDocument()
  expect(screen.getByRole('link', {name: /go to default branch/i})).toBeInTheDocument()
  expect(screen.getByText('Go to default branch')).toBeInTheDocument()
})
