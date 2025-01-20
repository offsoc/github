import {CopyIcon, SyncIcon} from '@primer/octicons-react'
import {Box, Button, CounterLabel, Flash, FormControl, Label, Radio, RadioGroup, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {Suspense, useCallback, useMemo, useState} from 'react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {useCreateBranchMutation} from '../hooks/use-create-branch-mutation'
import {BranchPickerPlaceholder} from '@github-ui/item-picker/BranchPicker'
import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'
import pluralize from 'pluralize'
import {BranchPicker} from './BranchPicker'

export type CreateBranchDialogProps = {
  alertNumbers: number[]
  alertNumbersWithSuggestedFixes: number[]
  repository: Repository
  createPath: string
  onClose: (
    nextStep: BranchNextStep,
    branchName: string | null,
    pullRequestPath: string | null,
    errorMessages?: string[],
  ) => void
  someSelectedAlertsAreClosed: boolean
  branchType: BranchType
}

export type BranchNextStep = 'none' | 'local' | 'codespace' | 'desktop' | 'pr'
export type BranchType = 'new' | 'existing'

export const CreateBranchDialog = ({
  alertNumbers,
  alertNumbersWithSuggestedFixes,
  repository,
  createPath,
  onClose,
  someSelectedAlertsAreClosed,
  branchType,
}: CreateBranchDialogProps) => {
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
      case 'pr':
        setBranchNextStep('pr')
        break
      default:
        setBranchNextStep('none')
    }
  }, [])

  const [selectedBranchName, setSelectedBranchName] = useState<string>(() =>
    branchType === 'new' ? `campaign-fix-${alertNumbers.join('-')}` : '',
  )

  const {isPending, error, mutate, data} = useCreateBranchMutation(createPath)

  const onCreateBranch = useCallback(async () => {
    mutate(
      {
        name: selectedBranchName,
        alertNumbers,
        commitAutofixSuggestions: alertNumbersWithSuggestedFixes.length > 0,
        createNewBranch: branchType === 'new',
        createDraftPR: branchNextStep === 'pr',
      },
      {
        onSuccess: response => {
          onClose(branchNextStep, response.branchName, response.pullRequestPath, response.messages)
        },
      },
    )
  }, [
    mutate,
    selectedBranchName,
    alertNumbers,
    alertNumbersWithSuggestedFixes.length,
    branchType,
    onClose,
    branchNextStep,
  ])

  const dialogTitle = useMemo(() => {
    if (alertNumbersWithSuggestedFixes.length > 0) {
      if (branchType === 'new') {
        return `Commit ${pluralize('autofix', alertNumbersWithSuggestedFixes.length)} to new branch`
      } else {
        return `Commit ${pluralize('autofix', alertNumbersWithSuggestedFixes.length)} to branch`
      }
    } else {
      return 'Create new branch'
    }
  }, [alertNumbersWithSuggestedFixes, branchType])

  const submitButtonContent = useMemo(() => {
    if (alertNumbersWithSuggestedFixes.length > 0) {
      return (
        <>
          Commit {pluralize('change', alertNumbersWithSuggestedFixes.length)}
          <CounterLabel scheme="primary" sx={{ml: 2}}>
            {alertNumbersWithSuggestedFixes.length}
          </CounterLabel>
        </>
      )
    } else {
      return 'Create branch'
    }
  }, [alertNumbersWithSuggestedFixes])

  // We will show the loading state when the request is still pending, or when we have received a response and are
  // currently loading the PR page (i.e. we have a pull request path)
  const isLoading = isPending || !!data?.pullRequestPath

  return (
    <Dialog
      width="large"
      height="auto"
      onClose={() => onClose('none', null, null)}
      title={dialogTitle}
      renderFooter={() => (
        <>
          <Dialog.Footer>
            <Button onClick={() => onClose('none', null, null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={onCreateBranch}
              leadingVisual={isLoading ? SyncIcon : null}
              disabled={isLoading || selectedBranchName === ''}
            >
              {submitButtonContent}
            </Button>
          </Dialog.Footer>
        </>
      )}
    >
      {error && (
        <Flash variant="danger" sx={{mb: 3}}>
          {error.message}
        </Flash>
      )}
      {someSelectedAlertsAreClosed && (
        <Flash variant="warning" sx={{mb: 3}}>
          Closed and fixed alerts will not be included in this branch
        </Flash>
      )}
      {branchType === 'new' && (
        <FormControl required>
          <FormControl.Label>Branch name</FormControl.Label>
          <TextInput
            sx={{
              width: '100%',
            }}
            trailingAction={
              <CopyToClipboardButton
                textToCopy={selectedBranchName}
                ariaLabel="Copy branch name to clipboard"
                icon={CopyIcon}
                tooltipProps={{direction: 'w'}}
              />
            }
            value={selectedBranchName}
            onChange={e => setSelectedBranchName(e.target.value)}
          />
        </FormControl>
      )}
      {branchType === 'existing' && (
        <Suspense fallback={<BranchPickerPlaceholder />}>
          <BranchPicker repository={repository} onSelect={branchName => setSelectedBranchName(branchName)} />
        </Suspense>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 3,
        }}
      >
        <RadioGroup name="create-branch-next-action-group" onChange={onChangeNextStep}>
          <RadioGroup.Label
            sx={{
              color: 'fg.muted',
              fontSize: 14,
              fontWeight: 'bold',
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
          {alertNumbersWithSuggestedFixes.length > 0 && (
            <FormControl>
              <Radio name="create-branch-next-action" value="pr" />
              <FormControl.Label>Start a draft pull request</FormControl.Label>
            </FormControl>
          )}
        </RadioGroup>
      </Box>
    </Dialog>
  )
}
