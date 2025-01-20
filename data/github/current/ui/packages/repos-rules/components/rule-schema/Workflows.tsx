import {useCallback, useEffect, useMemo, useRef, useState, type RefObject} from 'react'
import {
  ActionList,
  ActionMenu,
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  Octicon,
  Text,
  TextInput,
} from '@primer/react'
import {AlertFillIcon, KebabHorizontalIcon, PencilIcon, TrashIcon} from '@primer/octicons-react'
import type {DialogButtonProps} from '@primer/react/drafts'
import {Dialog} from '@primer/react/drafts'
import {RefSelector} from '@github-ui/ref-selector'
import {mapRefType, qualifyRef, unqualifyRef} from '@github-ui/ref-utils'
import {ReposSelector} from '@github-ui/repos-selector'
import {Blankslate} from '../Blankslate'
import {getShaForRef, getWorkflowRepoSuggestions, getWorkflowSuggestions, validateWorkflowSha} from '../../services/api'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import type {
  WorkflowRepository,
  WorkflowsRuleMetadata,
  RegisteredRuleSchemaComponent,
  ValidationError,
  WorkflowError,
} from '../../types/rules-types'
import {RefPill} from '../RefPill'

type WorkflowConfig = {
  path: string
  repository_id: number
  ref?: string
  sha?: string
}

type WorkflowMetadataEntry = {
  workflowName?: string
  repository: WorkflowRepository
}

type WorkflowFile = {
  name: string
  path: string
}

export function Workflows({value, onValueChange, readOnly, metadata, errors, fieldRef}: RegisteredRuleSchemaComponent) {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | undefined>(undefined)
  const firstErrorRef = useRef<string | undefined>(undefined)

  const workflows = useMemo(() => (value || []) as WorkflowConfig[], [value])

  const workflowErrors = useMemo(() => {
    const errorsByRepoAndPath = {} as Record<string, ValidationError>
    for (const error of (errors[0]?.sub_errors || []) as WorkflowError[]) {
      if (error.repo_and_path !== undefined) {
        firstErrorRef.current = firstErrorRef.current || error.repo_and_path
        errorsByRepoAndPath[error.repo_and_path] = error
      }
    }
    return errorsByRepoAndPath
  }, [errors])

  // Workflow metadata with key: `<repo_id>/<workflow_path>`
  const [workflowMeta, setWorkflowMeta] = useState<Record<string, WorkflowMetadataEntry>>(() => {
    const initialMetadata = {} as Record<string, WorkflowMetadataEntry>
    const workflowMetadata = metadata as WorkflowsRuleMetadata
    if (workflowMetadata && workflowMetadata.workflows) {
      for (const workflow of workflowMetadata.workflows) {
        if (workflow.repository) {
          initialMetadata[`${workflow.repository.id}/${workflow.path}`] = {
            workflowName: workflow.name,
            repository: workflow.repository,
          }
        }
      }
    }
    return initialMetadata
  })

  const addOrUpdateWorkflow = useCallback(
    (newWorkflow: WorkflowConfig, newMetadata?: WorkflowMetadataEntry) => {
      // Don't add a workflow if it already exists
      if (!editingWorkflow && workflows.some(w => workflowsEqual(w, newWorkflow))) {
        return false
      }

      let newWorkflows: WorkflowConfig[]
      // Remove the old workflow if we're editing it
      if (editingWorkflow) {
        const index = workflows.findIndex(w => workflowsEqual(w, editingWorkflow))
        newWorkflows = [...workflows.slice(0, index), newWorkflow, ...workflows.slice(index + 1)]
      } else {
        newWorkflows = [...workflows, newWorkflow]
      }

      if (newMetadata) {
        setWorkflowMeta(prev => ({
          ...prev,
          [`${newWorkflow.repository_id}/${newWorkflow.path}`]: newMetadata,
        }))
      }

      onValueChange?.(newWorkflows)
      return true
    },
    [editingWorkflow, onValueChange, workflows],
  )

  const onEditWorkflow = (workflow: WorkflowConfig) => {
    setEditingWorkflow(workflow)
    setDialogVisible(true)
  }

  const onDeleteWorkflow = (workflow: WorkflowConfig) => {
    const newWorkflows = workflows.filter(w => w !== workflow)
    onValueChange?.(newWorkflows)
  }

  return (
    <div className="d-flex flex-column gap-2">
      {!readOnly && dialogVisible ? (
        <WorkflowDialog
          existingWorkflow={
            editingWorkflow
              ? {
                  workflow: editingWorkflow,
                  metadata: workflowMeta[`${editingWorkflow?.repository_id}/${editingWorkflow?.path}`],
                }
              : undefined
          }
          onSave={addOrUpdateWorkflow}
          onClose={() => {
            setDialogVisible(false)
            setEditingWorkflow(undefined)
          }}
        />
      ) : null}
      <div className="Box">
        <div className="Box-header d-flex flex-items-center">
          <div className="Box-title flex-1">Workflow configurations</div>
          {!readOnly && (
            <Button
              className="ml-2"
              type="button"
              aria-label="Add workflow"
              size="small"
              onClick={() => setDialogVisible(true)}
            >
              Add workflow
            </Button>
          )}
        </div>
        {workflows.length ? (
          <div>
            {workflows.map(workflow => (
              <div className="Box-row d-flex flex-justify-between flex-items-center" key={workflow.path}>
                <div className="d-flex flex-column">
                  <span className="text-bold">
                    {workflowMeta[`${workflow.repository_id}/${workflow.path}`]?.workflowName}
                  </span>
                  <div>
                    <span className="color-fg-muted text-small pr-1">{`${
                      workflowMeta[`${workflow.repository_id}/${workflow.path}`]?.repository.name ||
                      'Unknown repository'
                    }/${workflow.path}`}</span>
                    {workflow.sha ? (
                      <RefPill param={workflow.sha.slice(0, 7)} />
                    ) : workflow.ref ? (
                      <RefPill param={workflow.ref} showIcon />
                    ) : null}
                  </div>
                  {workflowErrors[`${workflow.repository_id}/${workflow.path}`] && (
                    <Text
                      sx={{display: 'flex', alignItems: 'center', fontSize: 0, color: 'danger.fg'}}
                      id={`${workflow.repository_id}/${workflow.path}-error`}
                    >
                      <Octicon icon={AlertFillIcon} size={12} />
                      &nbsp;{workflowErrors[`${workflow.repository_id}/${workflow.path}`]?.message}
                    </Text>
                  )}
                </div>

                {!readOnly && (
                  <div>
                    <IconButton
                      className="ml-2"
                      icon={PencilIcon}
                      type="button"
                      ref={
                        `${workflow.repository_id}/${workflow.path}` === firstErrorRef.current
                          ? (fieldRef as RefObject<HTMLButtonElement>)
                          : undefined
                      }
                      aria-describedby={`${workflow.repository_id}/${workflow.path}-error`}
                      aria-label={`Edit ${workflow.repository_id}/${workflow.path} workflow`}
                      aria-invalid={!!workflowErrors[`${workflow.repository_id}/${workflow.path}`]}
                      size="small"
                      variant="invisible"
                      onClick={() => onEditWorkflow(workflow)}
                    />
                    <IconButton
                      className="ml-2"
                      icon={TrashIcon}
                      type="button"
                      aria-label={`Delete ${workflow}}`}
                      size="small"
                      variant="invisible"
                      onClick={() => onDeleteWorkflow(workflow)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Blankslate heading="No workflow configurations found" />
        )}
      </div>
    </div>
  )
}

function WorkflowDialog({
  onSave,
  onClose,
  existingWorkflow,
}: {
  onSave: (workflow: WorkflowConfig, newMetadata?: WorkflowMetadataEntry) => boolean
  onClose: () => void
  existingWorkflow?: {workflow: WorkflowConfig; metadata?: WorkflowMetadataEntry}
}) {
  const {resolvePath} = useRelativeNavigation()

  const [refOrSha, setRefOrSha] = useState<'ref' | 'sha'>(() => {
    return existingWorkflow ? (existingWorkflow.workflow.sha && !existingWorkflow.workflow.ref ? 'sha' : 'ref') : 'ref'
  })

  // New or existing workflow
  const [workflow, setWorkflow] = useState<Partial<WorkflowConfig>>({...existingWorkflow?.workflow} || {})

  // Loaded data
  const [repo, setRepo] = useState<WorkflowRepository | undefined>(existingWorkflow?.metadata?.repository)
  const [shaForRef] = useShaForRef(repo, workflow.ref)
  const workflowOptions = useWorkflowSuggestions(repo)

  // Validation
  const [showMissing, setShowMissing] = useState<boolean>(false)
  const [workflowAlreadyExists, setWorkflowAlreadyExists] = useState<boolean>(false)
  const {shaValid, validateSha} = useShaValidation(repo, workflow.sha)

  const onRepoChange = useCallback(
    (newRepo?: WorkflowRepository) => {
      if (newRepo) {
        setRepo(newRepo)
        setWorkflow({...workflow, repository_id: newRepo.id, ref: qualifyRef(newRepo.defaultBranch, 'branch')})
        setShowMissing(false)
      }
    },
    [workflow],
  )

  const queryForRepos = useCallback(
    async (q: string) => {
      const repos = await getWorkflowRepoSuggestions(resolvePath('../workflows'), q)
      return repos?.map(r => ({...r, enabled: r.actionsSharing})) || []
    },
    [resolvePath],
  )

  const saveChanges = useCallback(() => {
    if (!workflow.path || !repo || (!workflow.sha && !workflow.ref)) {
      setShowMissing(true)
      return
    }
    if (
      !onSave(workflow as WorkflowConfig, {
        repository: repo,
        workflowName: workflowOptions?.find(w => w.path === workflow.path)?.name,
      })
    ) {
      setWorkflowAlreadyExists(true)
      return
    }
    onClose()
  }, [onClose, onSave, repo, workflow, workflowOptions])

  const footerButtons: DialogButtonProps[] = useMemo(
    () => [
      {content: 'Cancel', onClick: onClose, buttonType: 'normal'},
      {content: 'Add workflow', onClick: saveChanges, buttonType: 'primary'},
    ],
    [onClose, saveChanges],
  )

  return (
    <Dialog title="Add required workflow" footerButtons={footerButtons} height="auto" width="medium" onClose={onClose}>
      <FormControl sx={{paddingBottom: 3}} required>
        <FormControl.Label>Repository</FormControl.Label>
        <ReposSelector
          currentSelection={repo}
          repositoryLoader={queryForRepos}
          onSelect={onRepoChange}
          selectionVariant="single"
          selectAllOption={false}
          additionalButtonProps={{alignContent: 'start', className: 'width-full'}}
        />
        {showMissing && !repo && (
          <FormControl.Validation variant="error" aria-live="polite">
            Please select a repository
          </FormControl.Validation>
        )}
      </FormControl>
      {repo && (
        <>
          <FormControl required>
            <FormControl.Label>{refOrSha === 'ref' ? 'Select branch or tag' : 'Enter a SHA'}</FormControl.Label>
            <div className="d-flex flex-row width-full">
              {refOrSha === 'ref' ? (
                <RefSelector
                  currentCommitish={unqualifyRef(workflow.ref) ?? 'Select ref'}
                  defaultBranch={repo.defaultBranch}
                  owner={repo.ownerLogin}
                  repo={repo.name}
                  canCreate={false}
                  cacheKey={repo.refCacheKey}
                  selectedRefType={mapRefType(workflow.ref)}
                  onSelectItem={(ref, refType) => setWorkflow({...workflow, ref: qualifyRef(ref, refType)})}
                  types={['branch', 'tag']}
                  buttonClassName="width-full workflows-wide-selector"
                  hideShowAll
                />
              ) : (
                <TextInput
                  className="width-full"
                  placeholder="Enter a valid SHA"
                  value={workflow.sha || ''}
                  onBlur={validateSha}
                  onChange={e => setWorkflow({...workflow, sha: e.target.value})}
                />
              )}
              <div className="pl-2">
                <RefOrShaSelector
                  selected={refOrSha}
                  onSelect={newValue => {
                    if (newValue !== refOrSha) {
                      if (newValue === 'sha') {
                        setWorkflow({...workflow, ref: undefined, sha: undefined})
                      } else if (newValue === 'ref') {
                        setWorkflow({...workflow, ref: qualifyRef(repo.defaultBranch, 'branch'), sha: undefined})
                      }
                      setRefOrSha(newValue)
                    }
                  }}
                />
              </div>
            </div>
            {refOrSha === 'sha' && (
              <>
                <FormControl.Caption>Enter the SHA for the commit you want to reference</FormControl.Caption>
                {shaValid !== undefined && shaValid === 'valid' ? (
                  <FormControl.Validation variant="success" aria-live="polite">
                    Valid SHA
                  </FormControl.Validation>
                ) : (shaValid !== undefined && shaValid === 'invalid') ||
                  (showMissing && (!workflow.sha || workflow.sha.length === 0)) ? (
                  <FormControl.Validation variant="error" aria-live="polite">
                    Invalid SHA
                  </FormControl.Validation>
                ) : shaValid !== undefined && shaValid === 'validating' ? (
                  <FormControl.Caption aria-live="polite">Validating...</FormControl.Caption>
                ) : null}
              </>
            )}
          </FormControl>
          {refOrSha === 'ref' && (
            <FormControl sx={{paddingTop: 2}}>
              <Checkbox
                tabIndex={0}
                checked={refOrSha === 'ref' && shaForRef !== undefined && workflow.sha === shaForRef}
                onChange={e => {
                  if (e.target.checked) {
                    setWorkflow({...workflow, sha: shaForRef})
                  } else {
                    setWorkflow({...workflow, sha: undefined})
                  }
                }}
              />
              <FormControl.Label>Pin to commit</FormControl.Label>
              <FormControl.Caption>
                <span>Always reference the current commit </span>
                {shaForRef && <RefPill param={shaForRef.slice(0, 7)} />}
              </FormControl.Caption>
            </FormControl>
          )}
          <FormControl sx={{width: '100%', paddingTop: 3}} required>
            <FormControl.Label>Pick a workflow file</FormControl.Label>
            <Autocomplete>
              <Autocomplete.Input
                value={workflow.path}
                onChange={e => setWorkflow({...workflow, path: e.target.value})}
                placeholder="path/workflow.yml"
                className="width-full"
              />
              <Autocomplete.Overlay>
                <Autocomplete.Menu
                  items={
                    workflowOptions?.map(w => {
                      return {
                        id: w.path,
                        text: w.path,
                      }
                    }) || []
                  }
                  selectionVariant="single"
                  onSelectedChange={item =>
                    setWorkflow({...workflow, path: Array.isArray(item) ? item[0]?.text : item.text})
                  }
                  loading={workflowOptions === undefined}
                  selectedItemIds={[]}
                  aria-labelledby="autocompleteLabel-basic"
                />
              </Autocomplete.Overlay>
            </Autocomplete>
            {showMissing && !workflow.path ? (
              <FormControl.Validation variant="error" aria-live="polite">
                Please select a workflow path
              </FormControl.Validation>
            ) : workflowAlreadyExists ? (
              <FormControl.Validation variant="error" aria-live="polite">
                Workflow already exists
              </FormControl.Validation>
            ) : null}
          </FormControl>
        </>
      )}
    </Dialog>
  )
}

function RefOrShaSelector({
  selected,
  onSelect,
}: {
  selected: 'ref' | 'sha'
  onSelect: (refOrSha: 'ref' | 'sha') => void
}) {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} aria-label="Open additional options" />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium" position="relative">
        <ActionList selectionVariant="single">
          <ActionList.Item selected={selected === 'ref'} onSelect={() => onSelect('ref')}>
            Branch or tag
          </ActionList.Item>
          <ActionList.Item selected={selected === 'sha'} onSelect={() => onSelect('sha')}>
            SHA
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

function useShaValidation(repo?: WorkflowRepository, sha?: string) {
  const {resolvePath} = useRelativeNavigation()
  const [shaValid, setShaValid] = useState<'valid' | 'invalid' | 'validating' | undefined>(undefined)

  const validateSha = async () => {
    if (sha && sha.length > 0 && repo) {
      if (sha.length !== 40) {
        setShaValid('invalid')
        return
      }
      try {
        setShaValid('validating')
        const result = await validateWorkflowSha(resolvePath('../validate_value/reachable_sha'), {
          sha,
          repo_id: repo.id,
        })
        setShaValid(result.valid ? 'valid' : 'invalid')
      } catch {
        setShaValid('invalid')
      }
    } else {
      setShaValid(undefined)
    }
  }

  return {shaValid, validateSha}
}

function useWorkflowSuggestions(repo?: WorkflowRepository) {
  const {resolvePath} = useRelativeNavigation()
  const [workflowOptions, setWorkflowOptions] = useState<WorkflowFile[] | undefined>(undefined)

  const fetchWorkflowSuggestions = useCallback(
    async (newRepo: string) => {
      try {
        const suggestedWorkflows = await getWorkflowSuggestions(resolvePath('../workflows'), newRepo)
        setWorkflowOptions(suggestedWorkflows)
      } catch {
        setWorkflowOptions([])
      }
    },
    [resolvePath, setWorkflowOptions],
  )

  useEffect(() => {
    if (repo) {
      fetchWorkflowSuggestions(repo.name)
    }
  }, [fetchWorkflowSuggestions, repo])

  return workflowOptions
}

function useShaForRef(repo?: WorkflowRepository, ref?: string) {
  const {resolvePath} = useRelativeNavigation()

  const [shaForRef, setShaForRef] = useState<string | undefined>(undefined)

  const fetchShaForRef = useCallback(async () => {
    if (ref && repo) {
      const foundSha = await getShaForRef(resolvePath('../workflows'), repo.name, ref)
      setShaForRef(foundSha.sha)
    }
  }, [resolvePath, setShaForRef, ref, repo])

  useEffect(() => {
    fetchShaForRef()
  }, [fetchShaForRef, ref, repo])

  return [shaForRef]
}

function workflowsEqual(a: WorkflowConfig, b: WorkflowConfig) {
  return a.path === b.path && a.repository_id === b.repository_id
}
