/* eslint eslint-comments/no-use: off */
/* eslint-disable filenames/match-regex */
import type React from 'react'
import {Suspense} from 'react'
import {MergeQueueGroupingStrategy, renderMergeQueueGroupingStrategy} from './MergeQueueGroupingStrategy'
import {MergeQueueMergeMethod} from './MergeQueueMergeMethod'
import {RequiredStatusCheckSelectList} from './RequiredStatusCheckSelectList'
import type {ParameterValue, RegisteredRuleErrorComponent, RegisteredRuleSchemaComponent} from '../../types/rules-types'
import {RestrictedCommitsList} from './RestrictedCommitsList'
import {RequiredDeployments} from './RequiredDeployments'
import {Workflows} from './Workflows'
import {MergeQueueError} from './errors/MergeQueueError'
import {FileExtensionRestrictions} from './FileExtensionRestrictions'
import {FilePathRestrictions} from './FilePathRestrictions'
import {MaxFilePathLength} from './MaxFilePathLength'
import {MaxFileSize} from './MaxFileSize'
import {CodeScanningTools} from './CodeScanningTools'
import {RequiredStatusChecksError} from './errors/RequiredStatusChecksError'
import {RequiredDeploymentsError} from './errors/RequiredDeploymentsError'
import {MaxFileSizeError} from './errors/MaxFileSizeError'
import {MaxFilePathError} from './errors/MaxFilePathError'
import {FilePathRestrictionsError} from './errors/FilePathRestrictionsError'
import {FileExtensionRestrictionsError} from './errors/FileExtensionRestrictionsError'
import {CodeScanningToolsError} from './errors/CodeScanningToolsError'
import {WorkflowsError} from './errors/WorkflowsError'

export const componentRegistry: Record<string, React.FC<RegisteredRuleSchemaComponent>> = {
  restricted_commits: props => <RestrictedCommitsList {...props} />,
  required_status_checks: props => <RequiredStatusCheckSelectList {...props} />,
  required_deployments: props => <RequiredDeployments {...props} />,
  workflows: props => <Workflows {...props} />,
  merge_queue_grouping_strategy: props => <MergeQueueGroupingStrategy {...props} />,
  merge_queue_merge_method: props => <MergeQueueMergeMethod {...props} />,
  file_path_restriction: props => <FilePathRestrictions {...props} />,
  file_extension_restriction: props => <FileExtensionRestrictions {...props} />,
  max_file_path_length: props => <MaxFilePathLength {...props} />,
  max_file_size: props => <MaxFileSize {...props} />,
  code_scanning_tools: props => <CodeScanningTools {...props} />,
}

export const errorRegistry: Record<string, React.FC<RegisteredRuleErrorComponent>> = {
  merge_queue: props => (
    <Suspense>
      <MergeQueueError {...props} />
    </Suspense>
  ),
  code_scanning: props => (
    <Suspense>
      <CodeScanningToolsError {...props} />
    </Suspense>
  ),
  workflows: props => (
    <Suspense>
      <WorkflowsError {...props} />
    </Suspense>
  ),
  required_status_checks: props => (
    <Suspense>
      <RequiredStatusChecksError {...props} />
    </Suspense>
  ),
  required_deployments: props => (
    <Suspense>
      <RequiredDeploymentsError {...props} />
    </Suspense>
  ),
  max_file_size: props => (
    <Suspense>
      <MaxFileSizeError {...props} />
    </Suspense>
  ),
  max_file_path_length: props => (
    <Suspense>
      <MaxFilePathError {...props} />
    </Suspense>
  ),
  file_path_restriction: props => (
    <Suspense>
      <FilePathRestrictionsError {...props} />
    </Suspense>
  ),
  file_extension_restriction: props => (
    <Suspense>
      <FileExtensionRestrictionsError {...props} />
    </Suspense>
  ),
  required_depoyments: props => (
    <Suspense>
      <RequiredDeploymentsError {...props} />
    </Suspense>
  ),
}

// Whether or not the component should be rendered
export const visibilityRegistry: Record<string, (value: ParameterValue, readonly: boolean) => boolean> = {
  merge_queue_grouping_strategy: (value: ParameterValue, readonly: boolean) =>
    renderMergeQueueGroupingStrategy({value: value as string, readonly}),
}
