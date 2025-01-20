import {
  RepositoryFragment,
  RepositoryPickerInternal,
  RepositoryPickerPlaceholder,
} from '@github-ui/item-picker/RepositoryPicker'
import type {
  RepositoryPickerRepository$data,
  RepositoryPickerRepository$key,
} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {RepositoryPickerTopRepositories$key} from '@github-ui/item-picker/RepositoryPickerTopRepositories.graphql'
import {
  BranchPickerInternal,
  BranchPickerRefFragment,
  BranchPickerRepositoryBranchRefsFragment,
  BranchPickerPlaceholder,
} from '@github-ui/item-picker/BranchPicker'
import type {BranchPickerRef$data, BranchPickerRef$key} from '@github-ui/item-picker/BranchPickerRef.graphql'
import type {BranchPickerRepositoryBranchRefs$key} from '@github-ui/item-picker/BranchPickerRepositoryBranchRefs.graphql'
import {CopyIcon, SyncIcon} from '@primer/octicons-react'
import {Box, Button, FormControl, Label, Radio, RadioGroup, Text, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {readInlineData, useLazyLoadQuery, useRelayEnvironment} from 'react-relay'
import type {DevelopmentSectionReposQuery} from './__generated__/DevelopmentSectionReposQuery.graphql'
import {DevelopmentSectionBranchesGraphqlQuery, DevelopmentSectionReposGraphqlQuery} from './DevelopmentSection'
import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import type {DevelopmentSectionBranchesQuery} from './__generated__/DevelopmentSectionBranchesQuery.graphql'
import {commitCreateLinkedBranchMutation} from '../../../mutations/create-linked-branch-mutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ERRORS} from '@github-ui/item-picker/Errors'

import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import type {
  CreateLinkedBranchInput,
  createLinkedBranchMutation$data,
} from '../../../mutations/__generated__/createLinkedBranchMutation.graphql'
import {generateSuggestedBranchName} from './utils'

export type CreateBranchDialogProps = {
  issueId: string
  title: string
  number: number
  owner: string
  repo: string
  onClose: (nextStep: BranchNextStep, branchName: string | null) => void
}

export type CreateBranchDialogInternalProps = {
  issueId: string
  title: string
  number: number
  onClose: (nextStep: BranchNextStep, branchName: string | null) => void
  selectedRepository: RepositoryPickerRepository$data
  onSelectedRepository: (repo?: RepositoryPickerRepository$data) => void
  topRepositoriesData: RepositoryPickerTopRepositories$key
}

export type BranchNextStep = 'none' | 'local' | 'codespace' | 'desktop'

export const CreateBranchDialog = ({owner, repo, ...rest}: CreateBranchDialogProps) => {
  const repos = useLazyLoadQuery<DevelopmentSectionReposQuery>(DevelopmentSectionReposGraphqlQuery, {
    repo,
    owner,
  })

  const initialRepository =
    repos.repository !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, repos.repository)
      : null
  const [selectedRepository, setSelectedRepository] = useState<RepositoryPickerRepository$data | null | undefined>(
    initialRepository,
  )

  const onSelectedRepository = useCallback((repository?: RepositoryPickerRepository$data) => {
    setSelectedRepository(repository)
  }, [])

  if (!selectedRepository) {
    return null
  }

  return (
    <Suspense>
      <CreateBranchDialogInternal
        selectedRepository={selectedRepository}
        onSelectedRepository={onSelectedRepository}
        topRepositoriesData={repos.viewer}
        {...rest}
      />
    </Suspense>
  )
}

const CreateBranchDialogInternal = ({
  title,
  number,
  onClose,
  selectedRepository,
  onSelectedRepository,
  topRepositoriesData,
  issueId,
}: CreateBranchDialogInternalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [createBranchInput, setCreateBranchInput] = useState<CreateLinkedBranchInput | null>(null)
  const [branchNextStep, setBranchNextStep] = useState<BranchNextStep>('local')
  const onChangeNextStep = useCallback((value: string | null) => {
    switch (value) {
      case 'codespace':
        setBranchNextStep('codespace')
        break
      case 'desktop':
        setBranchNextStep('desktop')
        break
      case 'local':
        setBranchNextStep('local')
        break
      default:
        setBranchNextStep('none')
    }
  }, [])

  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const onSelectRepository = useCallback(
    (repo?: RepositoryPickerRepository$data) => {
      if (repo && repo !== selectedRepository) {
        onSelectedRepository(repo)
      }
    },
    [onSelectedRepository, selectedRepository],
  )

  const onCreateBranch = useCallback(() => {
    if (!createBranchInput) {
      return
    }
    setIsLoading(true)
    commitCreateLinkedBranchMutation({
      environment,
      input: createBranchInput,
      onError: () => {
        setIsLoading(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotCreateBranch,
        })
      },
      onCompleted: (response: createLinkedBranchMutation$data) => {
        setIsLoading(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Branch created',
        })
        onClose(branchNextStep, response.createLinkedBranch?.linkedBranch?.ref?.name ?? null)
      },
    })
  }, [addToast, branchNextStep, createBranchInput, environment, onClose])

  const suggestedBranchName = useMemo(() => generateSuggestedBranchName(title, number), [title, number])
  const [selectedBranchName, setSelectedBranchName] = useState<string>(suggestedBranchName)
  const [branchSourceName, setBranchSourceName] = useState<string | null>(null)

  if (!selectedRepository) return null

  return (
    <Dialog
      width="large"
      height="auto"
      onClose={() => onClose('none', null)}
      title={'Create a branch for this issue'}
      renderFooter={() => (
        <>
          <Dialog.Footer
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RadioGroup name={'create-branch-next-action-group'} onChange={onChangeNextStep}>
              <RadioGroup.Label
                sx={{
                  color: 'fg.muted',
                  fontSize: 14,
                }}
              >
                What&apos;s next?
              </RadioGroup.Label>
              <FormControl disabled>
                <Radio name="create-branch-next-action" value="codespace" />
                <FormControl.Label>
                  Open in codespace<Label sx={{ml: 1}}>Coming soon</Label>
                </FormControl.Label>
              </FormControl>
              <FormControl>
                <Radio name="create-branch-next-action" value="local" checked={branchNextStep === 'local'} />
                <FormControl.Label>Checkout locally</FormControl.Label>
              </FormControl>
              <FormControl>
                <Radio name="create-branch-next-action" value="desktop" />
                <FormControl.Label>Open branch with GitHub Desktop</FormControl.Label>
              </FormControl>
            </RadioGroup>
          </Dialog.Footer>
          <Dialog.Footer>
            <Button
              variant={'primary'}
              onClick={onCreateBranch}
              leadingVisual={isLoading ? SyncIcon : null}
              disabled={isLoading || !createBranchInput}
            >
              Create branch
            </Button>
          </Dialog.Footer>
        </>
      )}
    >
      <Suspense
        fallback={
          <CreateBranchDialogInternalInputsLoading
            selectedBranchName={selectedBranchName}
            branchSourceName={branchSourceName}
          />
        }
      >
        <CreateBranchDialogInternalInputs
          selectedRepository={selectedRepository}
          onSelectRepository={onSelectRepository}
          topRepositoriesData={topRepositoriesData}
          setCreateBranchInput={setCreateBranchInput}
          issueId={issueId}
          selectedBranchName={selectedBranchName}
          setSelectedBranchName={setSelectedBranchName}
          setBranchSourceName={setBranchSourceName}
        />
      </Suspense>
    </Dialog>
  )
}

type CreateBranchDialogInternalInputsProps = {
  selectedRepository: RepositoryPickerRepository$data
  onSelectRepository: (repo?: RepositoryPickerRepository$data) => void
  issueId: string
  topRepositoriesData: RepositoryPickerTopRepositories$key
  setCreateBranchInput: (input: CreateLinkedBranchInput | null) => void
  selectedBranchName: string
  setSelectedBranchName: (name: string) => void
  setBranchSourceName: (name: string | null) => void
}

const CreateBranchDialogInternalInputs = ({
  selectedRepository,
  topRepositoriesData,
  onSelectRepository,
  setCreateBranchInput,
  issueId,
  selectedBranchName,
  setSelectedBranchName,
  setBranchSourceName,
}: CreateBranchDialogInternalInputsProps) => {
  const branches = useLazyLoadQuery<DevelopmentSectionBranchesQuery>(DevelopmentSectionBranchesGraphqlQuery, {
    repo: selectedRepository.name,
    owner: selectedRepository.owner.login,
  })

  const repoBranchRefs =
    branches.repository !== undefined
      ? // eslint-disable-next-line no-restricted-syntax
        readInlineData<BranchPickerRepositoryBranchRefs$key>(
          BranchPickerRepositoryBranchRefsFragment,
          branches.repository,
        )
      : null

  const defaultBranchRef = repoBranchRefs?.defaultBranchRef ?? null
  const branchesKey = repoBranchRefs?.refs ?? null
  // eslint-disable-next-line no-restricted-syntax
  const initialSourceBranch = readInlineData<BranchPickerRef$key>(BranchPickerRefFragment, defaultBranchRef)

  const [selectedSourceBranch, setSelectedSourceBranch] = useState<BranchPickerRef$data | null | undefined>(
    initialSourceBranch,
  )

  useEffect(() => {
    setSelectedSourceBranch(initialSourceBranch)
    setBranchSourceName(initialSourceBranch?.name ?? null)
  }, [initialSourceBranch, setBranchSourceName])

  const onSelectedSourceBranch = useCallback(
    (branch?: BranchPickerRef$data) => {
      setSelectedSourceBranch(current => branch ?? current)
      setBranchSourceName(initialSourceBranch?.name ?? null)
    },
    [initialSourceBranch?.name, setBranchSourceName],
  )

  const createBranchInput = useMemo(() => {
    if (!selectedRepository || !selectedSourceBranch || !selectedSourceBranch.target?.oid) {
      return null
    }
    return {
      repositoryId: selectedRepository.id,
      name: `refs/heads/${selectedBranchName}`,
      oid: selectedSourceBranch.target.oid,
      issueId,
    }
  }, [issueId, selectedBranchName, selectedRepository, selectedSourceBranch])
  setCreateBranchInput(createBranchInput)

  return (
    <div data-testid={'cb-container'}>
      <Box
        data-testid={'branch-name'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          marginBottom: 3,
        }}
      >
        <Text
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
          }}
        >
          Branch name
        </Text>
        <TextInput
          sx={{
            width: '100%',
          }}
          trailingAction={
            <CopyToClipboardButton
              textToCopy={selectedBranchName}
              ariaLabel={'Copy branch name to clipboard'}
              icon={CopyIcon}
              tooltipProps={{direction: 'w'}}
            />
          }
          value={selectedBranchName}
          onChange={e => setSelectedBranchName(e.target.value)}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
      >
        <Box
          data-testid={'repository'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 3,
            marginRight: 2,
          }}
        >
          <Box
            data-testid={'repository-picker'}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text
              sx={{
                marginBottom: 2,
                fontWeight: 'bold',
              }}
            >
              Repository destination
            </Text>
          </Box>
          <Suspense fallback={<RepositoryPickerPlaceholder />}>
            <RepositoryPickerInternal
              initialRepository={selectedRepository}
              topRepositoriesData={topRepositoriesData}
              onSelect={onSelectRepository}
            />
          </Suspense>
        </Box>
        <Box
          data-testid={'source-branch-picker'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 3,
            overflow: 'hidden',
          }}
        >
          <Text
            sx={{
              marginBottom: 2,
              fontWeight: 'bold',
            }}
          >
            Branch source
          </Text>
          <Suspense fallback={<BranchPickerPlaceholder />}>
            <BranchPickerInternal
              initialBranch={selectedSourceBranch}
              defaultBranchId={initialSourceBranch?.id}
              branchesKey={branchesKey}
              owner={selectedRepository.owner.login}
              repo={selectedRepository.name}
              onSelect={onSelectedSourceBranch}
              title={'Choose a source branch'}
            />
          </Suspense>
        </Box>
      </Box>
    </div>
  )
}

type CreateBranchDialogInternalInputsLoadingProps = {
  selectedBranchName: string
  branchSourceName: string | null
}

const CreateBranchDialogInternalInputsLoading = ({
  selectedBranchName,
  branchSourceName,
}: CreateBranchDialogInternalInputsLoadingProps) => {
  return (
    <div data-testid={'cb-container'}>
      <Box
        data-testid={'branch-name'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          marginBottom: 3,
        }}
      >
        <Text
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
          }}
        >
          Branch name
        </Text>
        <TextInput
          sx={{
            width: '100%',
          }}
          trailingAction={
            <CopyToClipboardButton
              textToCopy={selectedBranchName}
              ariaLabel={'Copy branch name to clipboard'}
              icon={CopyIcon}
              tooltipProps={{direction: 'w'}}
            />
          }
          value={selectedBranchName}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Box
          data-testid={'repository'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            marginBottom: 3,
          }}
        >
          <Box
            data-testid={'repository-picker'}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text
              sx={{
                marginBottom: 2,
                fontWeight: 'bold',
              }}
            >
              Repository destination
            </Text>
          </Box>
          <RepositoryPickerPlaceholder />
        </Box>
        <Box
          data-testid={'source-branch-picker'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            marginBottom: 3,
            marginLeft: 2,
            overflow: 'hidden',
          }}
        >
          <Text
            sx={{
              marginBottom: 2,
              fontWeight: 'bold',
            }}
          >
            Branch source
          </Text>
          <BranchPickerPlaceholder currentBranch={branchSourceName} />
        </Box>
      </Box>
    </div>
  )
}
