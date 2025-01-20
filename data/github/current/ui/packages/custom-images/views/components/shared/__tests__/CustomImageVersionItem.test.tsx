import {screen} from '@testing-library/react'
import {ListView} from '@github-ui/list-view'
import {agoString} from '@github-ui/ago'
import {render} from '@github-ui/react-core/test-utils'
import {readyImageVersion, failedImageVersion, importingImageVersion} from '../../../../test-utils/mock-data'
import type {ImageVersion} from '@github-ui/github-hosted-runners-settings/types/image'
import CustomImageVersionItem from '../CustomImageVersionItem'

function renderComponent(imageVersion: ImageVersion, isLatest: boolean) {
  return render(
    <ListView title="Test list view">
      <CustomImageVersionItem
        entityLogin="myOrg"
        imageDefinitionId="123"
        isEnterprise={false}
        isLatest={isLatest}
        version={imageVersion}
      />
    </ListView>,
  )
}

test('Renders the latest version with size and state', () => {
  renderComponent(readyImageVersion, true)
  const createdWhen = agoString(new Date(readyImageVersion.createdOn))

  expect(screen.getByTestId('list-view-item-title-container')).toHaveTextContent('Version 1.0.0')
  expect(screen.getByTestId('latest-label')).toBeVisible()
  expect(screen.getByTestId('version-description')).toHaveTextContent(`30 GB created ${createdWhen}`)
  expect(screen.getByTestId('image-state-text')).toHaveTextContent('Ready')
})

test('Renders the failed version', () => {
  renderComponent(failedImageVersion, false)
  const createdWhen = agoString(new Date(failedImageVersion.createdOn))

  expect(screen.getByTestId('list-view-item-title-container')).toHaveTextContent('Version 1.0.1')
  expect(screen.queryByTestId('latest-label')).toBeNull()
  expect(screen.getByTestId('version-description')).toHaveTextContent(`0 GB created ${createdWhen}`)
  expect(screen.getByTestId('image-state-text')).toHaveTextContent('Import failed')
})

test('Renders the importing version', () => {
  renderComponent(importingImageVersion, true)
  const createdWhen = agoString(new Date(importingImageVersion.createdOn))

  expect(screen.getByTestId('list-view-item-title-container')).toHaveTextContent('Version 1.0.2')
  expect(screen.queryByTestId('latest-label')).toBeVisible()
  expect(screen.getByTestId('version-description')).toHaveTextContent(`0 GB created ${createdWhen}`)
  expect(screen.getByTestId('image-state-text')).toHaveTextContent('Provisioning')
})

test('Renders last used ago when provided', () => {
  renderComponent(readyImageVersion, true)
  const usedWhen = agoString(new Date(readyImageVersion.lastUsedOn))

  expect(screen.getByTestId('list-view-item-title-container')).toHaveTextContent('Version 1.0.0')
  expect(screen.getByTestId('latest-label')).toBeVisible()
  expect(screen.getByTestId('last-used-ago-text')).toHaveTextContent(`Last used ${usedWhen}`)
  expect(screen.getByTestId('image-state-text')).toHaveTextContent('Ready')
})

test('Does not render last used ago when not provided', () => {
  const neverUsedImageVersion = {
    ...readyImageVersion,
    lastUsedOn: undefined,
  }
  renderComponent(neverUsedImageVersion, true)

  expect(screen.getByTestId('list-view-item-title-container')).toHaveTextContent('Version 1.0.0')
  expect(screen.getByTestId('latest-label')).toBeVisible()
  expect(screen.queryByTestId('last-used-ago-text')).toBeNull()
  expect(screen.getByTestId('image-state-text')).toHaveTextContent('Ready')
})
