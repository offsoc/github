import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerRepository$data} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import type {MockRepository} from '../__tests__/helpers'
import type {IssueCreatePayload, OnCreateProps} from '../utils/model'
import {IssueCreateContextProvider} from '../contexts/IssueCreateContext'
import {getSafeConfig} from '../utils/option-config'
import {RelayEnvironmentProvider, type PreloadedQuery} from 'react-relay'
import {CreateIssue} from '../CreateIssue'
import type {createMockEnvironment} from 'relay-test-utils'
import {Suspense} from 'react'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {noop} from '@github-ui/noop'
import type {DisplayMode} from '../utils/display-mode'

type WrappedCreateIssueProps = {
  queryRef?: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
  preselectedRepository?: RepositoryPickerRepository$data
  scopedRepository?: MockRepository
  selectedTemplate?: IssueCreatePayload
  onCreateSuccess?: ({issue, createMore}: OnCreateProps) => void
  navigate?: (url: string) => void
  navigateToFullScreenOnTemplateChoice?: boolean
  defaultDisplayMode?: DisplayMode
  overrideFallbackDisplaymode?: DisplayMode
}

function WrappedCreateIssue({
  queryRef,
  preselectedRepository,
  selectedTemplate,
  scopedRepository,
  onCreateSuccess,
  navigate,
  navigateToFullScreenOnTemplateChoice,
  defaultDisplayMode,
  overrideFallbackDisplaymode,
}: WrappedCreateIssueProps) {
  return (
    <IssueCreateContextProvider
      preselectedData={{
        repository: preselectedRepository,
        template: selectedTemplate,
      }}
      optionConfig={getSafeConfig({
        defaultDisplayMode,
        insidePortal: false,
        singleKeyShortcutsEnabled: true,
        navigateToFullScreenOnTemplateChoice: navigateToFullScreenOnTemplateChoice ?? false,
        scopedRepository: scopedRepository
          ? {
              id: scopedRepository.id,
              owner: scopedRepository.owner.login,
              name: scopedRepository.name,
            }
          : undefined,
      })}
      overrideFallbackDisplaymode={overrideFallbackDisplaymode}
    >
      <CreateIssue
        topReposQueryRef={queryRef}
        onCreateSuccess={onCreateSuccess ?? noop}
        onCreateError={noop}
        onCancel={noop}
        navigate={navigate ?? noop}
      />
    </IssueCreateContextProvider>
  )
}

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Omit<WrappedCreateIssueProps, 'queryRef'>

export function CreateIssueTestComponent({
  environment,
  preselectedRepository,
  scopedRepository,
  selectedTemplate,
  onCreateSuccess,
  navigate,
  navigateToFullScreenOnTemplateChoice,
  defaultDisplayMode,
  overrideFallbackDisplaymode,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <ComponentWithPreloadedQueryRef
          component={WrappedCreateIssue}
          componentProps={{
            preselectedRepository,
            selectedTemplate,
            scopedRepository,
            onCreateSuccess,
            navigate,
            navigateToFullScreenOnTemplateChoice,
            defaultDisplayMode,
            overrideFallbackDisplaymode,
          }}
          query={TopRepositories}
          queryVariables={{topRepositoriesFirst: 10, hasIssuesEnabled: true, owner: null}}
        />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}

export function CreateIssueWithoutQueryRefTestComponent({
  environment,
  preselectedRepository,
  selectedTemplate,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="...Loading">
        <WrappedCreateIssue preselectedRepository={preselectedRepository} selectedTemplate={selectedTemplate} />
      </Suspense>
    </RelayEnvironmentProvider>
  )
}
