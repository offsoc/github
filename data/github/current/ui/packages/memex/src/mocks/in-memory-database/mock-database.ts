import type {MemexChart} from '../../client/api/charts/contracts/api'
import type {MemexColumn} from '../../client/api/columns/contracts/memex-column'
import type {
  Collaborator,
  CustomTemplate,
  IAssignee,
  IssueType,
  Label,
  Milestone,
  ParentIssue,
} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import type {Memex, MemexStatus} from '../../client/api/memex/contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import type {SuggestedRepository} from '../../client/api/repository/contracts'
import type {SidePanelMetadata} from '../../client/api/side-panel/contracts'
import type {PageView} from '../../client/api/view/contracts'
import type {MemexWorkflowPersisted} from '../../client/api/workflows/contracts'
import {AssigneesCollection} from './assignees'
import {ChartsCollection} from './charts'
import {CollaboratorsCollection} from './collaborators'
import {ColumnsCollection} from './columns'
import {CustomTemplatesCollection} from './custom-templates'
import {FailbotCollection} from './failbot'
import {FilesCollection} from './files'
import {IssueTypesCollection} from './issue-types'
import {IssuesCollection} from './issues'
import {JobsCollection} from './jobs'
import {LabelsCollection} from './labels'
import {MemexItemsCollection} from './memex-items'
import {MemexesCollection} from './memexes'
import {MilestonesCollection} from './milestones'
import {NotificationsSubscriptionsCollection} from './notifications-subscriptions'
import {OrganizationAccessCollection} from './organization-access'
import {ParentIssuesCollection} from './parent-issues'
import {RepositoriesCollection} from './repositories'
import {RepositoryItemsCollection} from './repository-items'
import {StatsCollection} from './stats'
import {StatusesCollection} from './statuses'
import {TrackedByCollection} from './tracked-by'
import {ViewsCollection} from './views'
import {WorkflowsCollection} from './workflows'

type MockDatabaseSyncData = {
  memex?: Memex
  memexItems?: Array<MemexItem>
  columns?: Array<MemexColumn>
  views?: Array<PageView>
  workflows?: Array<MemexWorkflowPersisted>
  charts?: Array<MemexChart>
  files?: Array<Blob>
}

export type MockDatabaseAsyncData = {
  suggestedRepositories?: Array<SuggestedRepository>
  suggestedAssignees?: Array<IAssignee>
  suggestedLabels?: Array<Label>
  suggestedMilestones?: Map<number, Array<Milestone>>
  suggestedIssueTypes?: Map<number, Array<IssueType>>
  parentIssues?: Array<ParentIssue>
  trackedBy?: Array<TrackedByItem>
  collaborators?: Array<Collaborator>
  issues?: Array<SidePanelMetadata>
  templates?: Array<CustomTemplate>
  statuses?: Array<MemexStatus>
}

type MockDatabaseData = MockDatabaseSyncData & MockDatabaseAsyncData

export class MockDatabase {
  public declare memexes: MemexesCollection
  public declare memexItems: MemexItemsCollection
  public declare columns: ColumnsCollection
  public declare repositories: RepositoriesCollection
  public declare trackedBy: TrackedByCollection
  public declare repositoryItems: RepositoryItemsCollection
  public declare assignees: AssigneesCollection
  public declare labels: LabelsCollection
  public declare milestones: MilestonesCollection
  public declare issueTypes: IssueTypesCollection
  public declare parentIssues: ParentIssuesCollection
  public declare views: ViewsCollection
  public declare workflows: WorkflowsCollection
  public declare collaborators: CollaboratorsCollection
  public declare charts: ChartsCollection
  public declare stats: StatsCollection
  public declare issues: IssuesCollection
  public declare files: FilesCollection
  public declare jobs: JobsCollection
  public declare organizationAccess: OrganizationAccessCollection
  public declare failbot: FailbotCollection
  public declare templates: CustomTemplatesCollection
  public declare statuses: StatusesCollection
  public declare notificationsSubscriptions: NotificationsSubscriptionsCollection

  constructor({
    memex,
    memexItems,
    columns,
    views,
    workflows,
    trackedBy,
    suggestedRepositories,
    suggestedAssignees,
    suggestedLabels,
    suggestedMilestones,
    suggestedIssueTypes,
    collaborators,
    charts,
    issues,
    parentIssues,
    files,
    templates,
    statuses,
  }: MockDatabaseData) {
    this.memexes = new MemexesCollection(memex)
    this.memexItems = new MemexItemsCollection(memexItems)
    this.columns = new ColumnsCollection(columns)
    this.repositories = new RepositoriesCollection(suggestedRepositories)
    this.trackedBy = new TrackedByCollection(trackedBy)
    this.repositoryItems = new RepositoryItemsCollection()
    this.assignees = new AssigneesCollection(suggestedAssignees)
    this.labels = new LabelsCollection(suggestedLabels)
    this.milestones = new MilestonesCollection(suggestedMilestones)
    this.issueTypes = new IssueTypesCollection(suggestedIssueTypes)
    this.parentIssues = new ParentIssuesCollection(parentIssues)
    this.views = new ViewsCollection(views)
    this.workflows = new WorkflowsCollection(workflows)
    this.collaborators = new CollaboratorsCollection(collaborators)
    this.charts = new ChartsCollection(charts)
    this.stats = new StatsCollection()
    this.issues = new IssuesCollection(issues)
    this.files = new FilesCollection(files)
    this.jobs = new JobsCollection()
    this.organizationAccess = new OrganizationAccessCollection()
    this.failbot = new FailbotCollection()
    this.templates = new CustomTemplatesCollection(templates)
    this.statuses = new StatusesCollection(statuses)
    this.notificationsSubscriptions = new NotificationsSubscriptionsCollection()
  }
}
