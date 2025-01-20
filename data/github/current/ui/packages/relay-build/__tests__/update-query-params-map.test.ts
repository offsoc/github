import {updateQueryParamsMap} from '../update-query-params-map'

test('updates from a set of persisted queries in multiple files', () => {
  const params = {}
  updateQueryParamsMap(params, [
    // these were excerpted from config/persisted_graphql_queries/github_ui.json
    {
      '000f5fce55296adfb1f118945be0de7c':
        'mutation addSubIssueMutation(\n  $input: AddSubIssueInput!\n) {\n  addSubIssue(input: $input) {\n    issue {\n      subIssues(first: 50) {\n        nodes {\n          id\n          title\n          titleHTML\n          url\n          state\n          labels(first: 10) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          assignees(first: 10) {\n            totalCount\n            edges {\n              node {\n                id\n                login\n                avatarUrl\n              }\n            }\n          }\n          totalCommentsCount\n        }\n      }\n      id\n    }\n  }\n}\n',
      '00373a7f95314e54628f49cf0f165618':
        'query ItemPickerProjectsStoryQuery(\n  $owner: String!\n  $repo: String!\n  $number: Int!\n) {\n  repository(owner: $owner, name: $repo) {\n    issue(number: $number) {\n      projectsV2(first: 10) {\n        ...ItemPickerProjects_SelectedProjectsV2Fragment\n      }\n      projectCards(first: 10) {\n        ...ItemPickerProjects_SelectedClassicProjectCardsFragment\n      }\n      id\n    }\n    id\n  }\n}\n\nfragment ItemPickerProjectsItem_ClassicProjectFragment on Project {\n  __typename\n  id\n  title: name\n  closed\n  columns(first: 10) {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n\nfragment ItemPickerProjectsItem_ProjectV2Fragment on ProjectV2 {\n  __typename\n  id\n  title\n  closed\n}\n\nfragment ItemPickerProjects_SelectedClassicProjectCardsFragment on ProjectCardConnection {\n  nodes {\n    project {\n      __typename\n      ...ItemPickerProjectsItem_ClassicProjectFragment\n      id\n    }\n    id\n  }\n}\n\nfragment ItemPickerProjects_SelectedProjectsV2Fragment on ProjectV2Connection {\n  nodes {\n    __typename\n    ...ItemPickerProjectsItem_ProjectV2Fragment\n    id\n  }\n}\n',
      '0064f66d41f5cbaf1946d2ccc70542cf':
        'query InboxThreadListV1Query(\n  $cursor: String = null\n  $first: Int\n  $query: String!\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...InboxList_v1_threadFragment_1BvpD0\n    id\n  }\n}\n\nfragment InboxListRow_v1_fragment on NotificationThread {\n  id\n  isUnread\n  unreadItemsCount\n  lastUpdatedAt\n  reason\n  summaryItemAuthor {\n    avatarUrl\n    id\n  }\n  summaryItemBody\n  url\n  isDone\n  subscriptionStatus\n  subject {\n    __typename\n    ... on AdvisoryCredit {\n      ghsaId\n      advisory {\n        __typename\n        summary\n        id\n      }\n    }\n    ... on CheckSuite {\n      databaseId\n      checkSuiteState: status\n      checkSuiteResult: conclusion\n    }\n    ... on Commit {\n      id\n      oid\n      message\n    }\n    ... on Discussion {\n      id\n      title\n      number\n    }\n    ... on Gist {\n      id\n      gistName: name\n      gistTitle: title\n    }\n    ... on Issue {\n      id\n      issueState: state\n      stateReason\n      title\n      number\n      url\n    }\n    ... on PullRequest {\n      id\n      prState: state\n      title\n      number\n    }\n    ... on Release {\n      tagName\n      name\n    }\n    ... on RepositoryAdvisory {\n      ghsaId\n      title\n    }\n    ... on RepositoryDependabotAlertsThread {\n      id\n    }\n    ... on RepositoryInvitation {\n      repositoryInvitation: repository {\n        __typename\n        name\n        owner {\n          __typename\n          login\n          id\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n        ... on StaffAccessedRepository {\n          id\n        }\n      }\n      inviter {\n        login\n        id\n      }\n    }\n    ... on RepositoryVulnerabilityAlert {\n      alertNumber: number\n    }\n    ... on SecurityAdvisory {\n      ghsaId\n      summary\n    }\n    ... on TeamDiscussion {\n      id\n      title\n      number\n    }\n    ... on WorkflowRun {\n      runNumber\n      workflowTitle: title\n    }\n    ... on MemberFeatureRequestNotification {\n      title\n      body\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  list {\n    __typename\n    ... on Repository {\n      name\n      owner {\n        __typename\n        login\n        id\n      }\n    }\n    ... on Team {\n      name\n      slug\n      organization {\n        login\n        id\n      }\n    }\n    ... on User {\n      login\n    }\n    ... on Organization {\n      login\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment InboxList_v1_threadFragment_1BvpD0 on User {\n  notificationThreads(query: $query, first: $first, after: $cursor) {\n    totalCount\n    edges {\n      cursor\n      node {\n        isDone\n        ...InboxListRow_v1_fragment\n        id\n        isUnread\n        url\n        subject {\n          __typename\n          ... on Issue {\n            id\n            number\n          }\n          ... on Discussion {\n            id\n            number\n          }\n          ... on PullRequest {\n            id\n            number\n          }\n          ... on Commit {\n            id\n          }\n          ... on TeamDiscussion {\n            id\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        list {\n          __typename\n          ... on Repository {\n            name\n            owner {\n              __typename\n              login\n              id\n            }\n          }\n          ... on Team {\n            name\n            slug\n            organization {\n              login\n              id\n            }\n          }\n          ... on User {\n            login\n          }\n          ... on Organization {\n            login\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n        }\n        __typename\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n',
      '011ffed3f1f0c46955a4b7307f29bfb1':
        'query IssuesShowDetailStoryQuery {\n  viewer {\n    ...IssuesShowDetail_CurrentViewerFragment\n    id\n  }\n  repository(owner: "owner", name: "repo") {\n    issue(number: 33) {\n      ...IssuesShowDetail\n      id\n    }\n    id\n  }\n}\n\nfragment IssueSubIssues_InnerFragment on Issue {\n  id\n  title\n  titleHTML\n  state\n  url\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n    }\n  }\n  assignees(first: 10) {\n    totalCount\n    edges {\n      node {\n        id\n        login\n        avatarUrl\n      }\n    }\n  }\n  subIssues(first: 1) {\n    totalCount\n  }\n  totalCommentsCount\n}\n\nfragment IssueSubIssues_SandboxFragment on Issue {\n  id\n  subIssues(first: 50) {\n    nodes {\n      id\n      ...IssueSubIssues_InnerFragment\n    }\n  }\n}\n\nfragment IssuesShowDetail on Issue {\n  id\n  title\n  bodyHTML\n  number\n  ...ItemPickerAssigneesBox_SelectedAssigneesFragment\n  labels(first: 20) {\n    ...ItemPickerLabelsBox_SelectedLabelsFragment_2Js4AG\n  }\n  projectsV2(first: 10) {\n    ...ItemPickerProjectsBox_SelectedProjectsV2Fragment\n  }\n  projectCards(first: 10) {\n    ...ItemPickerProjectsBox_SelectedClassicProjectCardsFragment\n  }\n  milestone {\n    ...ItemPickerMilestonesBox_SelectedMilestonesFragment\n    id\n  }\n  linkedBranches {\n    ...ItemPickerPullRequestsAndBranches_SelectedBranchesFragment\n  }\n  linkedPullRequests: closedByPullRequestsReferences {\n    ...ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment\n  }\n  ...IssueSubIssues_SandboxFragment\n}\n\nfragment IssuesShowDetail_CurrentViewerFragment on User {\n  ...ItemPickerAssignees_CurrentViewerFragment\n}\n\nfragment ItemPickerAssigneesBoxItem_Fragment on User {\n  login\n  avatarUrl(size: 64)\n}\n\nfragment ItemPickerAssigneesBox_SelectedAssigneesFragment on Assignable {\n  __isAssignable: __typename\n  assignees(first: 20) {\n    ...ItemPickerAssignees_SelectedAssigneesFragment\n    nodes {\n      ...ItemPickerAssigneesBoxItem_Fragment\n      id\n    }\n  }\n}\n\nfragment ItemPickerAssigneesItem_Fragment on User {\n  id\n  name\n  login\n  avatarUrl(size: 64)\n}\n\nfragment ItemPickerAssignees_CurrentViewerFragment on User {\n  id\n  login\n  name\n  ...ItemPickerAssigneesItem_Fragment\n}\n\nfragment ItemPickerAssignees_SelectedAssigneesFragment on UserConnection {\n  nodes {\n    id\n    login\n    name\n    avatarUrl(size: 64)\n    ...ItemPickerAssigneesItem_Fragment\n  }\n}\n\nfragment ItemPickerLabelsBoxItem_Fragment on Label {\n  nameHTML\n  color\n  url\n}\n\nfragment ItemPickerLabelsBox_SelectedLabelsFragment_2Js4AG on LabelConnection {\n  ...ItemPickerLabels_SelectedLabelsFragment_2Js4AG\n  nodes {\n    ...ItemPickerLabelsBoxItem_Fragment\n    id\n  }\n}\n\nfragment ItemPickerLabelsItem_DateFragment on Label {\n  createdAt\n  updatedAt\n}\n\nfragment ItemPickerLabelsItem_Fragment_2Js4AG on Label {\n  name\n  nameHTML\n  color\n  id\n  description\n  ...ItemPickerLabelsItem_PathFragment\n  ...ItemPickerLabelsItem_DateFragment\n}\n\nfragment ItemPickerLabelsItem_PathFragment on Label {\n  url\n  resourcePath\n}\n\nfragment ItemPickerLabels_SelectedLabelsFragment_2Js4AG on LabelConnection {\n  nodes {\n    ...ItemPickerLabelsItem_Fragment_2Js4AG\n    id\n  }\n}\n\nfragment ItemPickerMilestonesBox_SelectedMilestonesFragment on Milestone {\n  ...ItemPickerMilestones_SelectedMilestoneFragment\n  title\n  url\n  dueOn\n  progressPercentage\n}\n\nfragment ItemPickerMilestonesItem_Fragment on Milestone {\n  id\n  title\n  state\n}\n\nfragment ItemPickerMilestones_SelectedMilestoneFragment on Milestone {\n  title\n  state\n  id\n  ...ItemPickerMilestonesItem_Fragment\n}\n\nfragment ItemPickerProjectsBoxItem_ClassicFragment on Project {\n  title: name\n  url\n}\n\nfragment ItemPickerProjectsBoxItem_V2Fragment on ProjectV2 {\n  title\n  url\n}\n\nfragment ItemPickerProjectsBox_SelectedClassicProjectCardsFragment on ProjectCardConnection {\n  ...ItemPickerProjects_SelectedClassicProjectCardsFragment\n  nodes {\n    project {\n      __typename\n      ...ItemPickerProjectsBoxItem_ClassicFragment\n      id\n    }\n    id\n  }\n}\n\nfragment ItemPickerProjectsBox_SelectedProjectsV2Fragment on ProjectV2Connection {\n  ...ItemPickerProjects_SelectedProjectsV2Fragment\n  nodes {\n    __typename\n    ...ItemPickerProjectsBoxItem_V2Fragment\n    id\n  }\n}\n\nfragment ItemPickerProjectsItem_ClassicProjectFragment on Project {\n  __typename\n  id\n  title: name\n  closed\n  columns(first: 10) {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n\nfragment ItemPickerProjectsItem_ProjectV2Fragment on ProjectV2 {\n  __typename\n  id\n  title\n  closed\n}\n\nfragment ItemPickerProjects_SelectedClassicProjectCardsFragment on ProjectCardConnection {\n  nodes {\n    project {\n      __typename\n      ...ItemPickerProjectsItem_ClassicProjectFragment\n      id\n    }\n    id\n  }\n}\n\nfragment ItemPickerProjects_SelectedProjectsV2Fragment on ProjectV2Connection {\n  nodes {\n    __typename\n    ...ItemPickerProjectsItem_ProjectV2Fragment\n    id\n  }\n}\n\nfragment ItemPickerPullRequestsAndBranchesItem_BranchFragment on Ref {\n  id\n  __typename\n  title: name\n}\n\nfragment ItemPickerPullRequestsAndBranchesItem_PullRequestFragment on PullRequest {\n  id\n  __typename\n  title\n}\n\nfragment ItemPickerPullRequestsAndBranches_SelectedBranchesFragment on LinkedBranchConnection {\n  nodes {\n    ref {\n      __typename\n      ...ItemPickerPullRequestsAndBranchesItem_BranchFragment\n      id\n    }\n    id\n  }\n}\n\nfragment ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment on PullRequestConnection {\n  nodes {\n    __typename\n    ...ItemPickerPullRequestsAndBranchesItem_PullRequestFragment\n    id\n  }\n}\n',
      '01605ebfa9a57f7c60a96f03bb4ad2c3':
        'mutation applySuggestedChangesMutation(\n  $input: ApplySuggestedChangesInput!\n) {\n  applySuggestedChanges(input: $input) {\n    clientMutationId\n  }\n}\n',
      '01ba2647727ea5877eff4595e869734d':
        'mutation removeTeamViewMutation(\n  $input: RemoveTeamDashboardSearchShortcutInput!\n) {\n  removeTeamDashboardSearchShortcut(input: $input) {\n    shortcut {\n      id\n    }\n  }\n}\n',
      '01d289044c122c85ae92584e14377fdb':
        'query RelayTestUtilsIssuesShowFragmentQuery {\n  repository(owner: "owner", name: "repo") {\n    issue(number: 33) {\n      ...IssuesShowFragment\n      id\n    }\n    id\n  }\n}\n\nfragment IssuesShowFragment on Issue {\n  title\n  number\n}\n',
      '032734763552cba0b58dbd30f6aaf95d':
        'query IssueCommentTestComponentQuery(\n  $commentId: ID!\n) {\n  comment: node(id: $commentId) {\n    __typename\n    ... on Comment {\n      __isComment: __typename\n      ...IssueComment_issueComment\n    }\n    id\n  }\n}\n\nfragment IssueCommentEditorBodyFragment on IssueComment {\n  id\n  body\n  bodyVersion\n  author {\n    __typename\n    login\n    avatarUrl\n    id\n  }\n  issue {\n    author {\n      __typename\n      login\n      id\n    }\n    id\n  }\n  ...IssueCommentHeader\n}\n\nfragment IssueCommentEditor_repository on IssueComment {\n  repository {\n    slashCommandsEnabled\n    nameWithOwner\n    databaseId\n    id\n  }\n}\n\nfragment IssueCommentHeader on IssueComment {\n  id\n  databaseId\n  url\n  createdAt\n  body\n  authorAssociation\n  viewerCanUpdate\n  viewerCanDelete\n  viewerCanMinimize\n  viewerCanReport\n  viewerCanReportToMaintainer\n  viewerCanBlockFromOrg\n  viewerCanUnblockFromOrg\n  isHidden: isMinimized\n  minimizedReason\n  createdViaEmail\n  viewerDidAuthor\n  authorToRepoOwnerSponsorship {\n    createdAt\n    isActive\n    id\n  }\n  author {\n    __typename\n    id\n    login\n  }\n  repository {\n    id\n    name\n    owner {\n      __typename\n      id\n      login\n      url\n    }\n    isPrivate\n  }\n  issue {\n    number\n    id\n  }\n  ...MarkdownEditHistoryViewer_comment\n}\n\nfragment IssueCommentViewerCommentRow on IssueComment {\n  id\n  databaseId\n  ...IssueCommentViewerMarkdownViewer\n  ...IssueCommentHeader\n  author {\n    avatarUrl\n    login\n    __typename\n    id\n  }\n  issue {\n    id\n    locked\n  }\n  body\n  isHidden: isMinimized\n  viewerCanUpdate\n}\n\nfragment IssueCommentViewerMarkdownViewer on IssueComment {\n  id\n  body\n  bodyHTML(unfurlReferences: true)\n  bodyVersion\n  viewerCanUpdate\n}\n\nfragment IssueCommentViewerReactable on Reactable {\n  __isReactable: __typename\n  ...ReactionViewerGroups\n}\n\nfragment IssueComment_issueComment on IssueComment {\n  ...IssueCommentViewerCommentRow\n  ...IssueCommentViewerReactable\n  ...IssueCommentEditor_repository\n  ...IssueCommentEditorBodyFragment\n  issue {\n    id\n  }\n  id\n}\n\nfragment MarkdownEditHistoryViewer_comment on Comment {\n  __isComment: __typename\n  id\n  viewerCanReadUserContentEdits\n  lastEditedAt\n  lastUserContentEdit {\n    editor {\n      __typename\n      url\n      login\n      id\n    }\n    id\n  }\n}\n\nfragment ReactionButton_Reaction on ReactionGroup {\n  content\n  reactors(first: 5) {\n    edges {\n      node {\n        __typename\n        ... on User {\n          login\n          __typename\n        }\n        ... on Bot {\n          login\n          __typename\n        }\n        ... on Organization {\n          login\n          __typename\n        }\n        ... on Mannequin {\n          login\n          __typename\n        }\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n      }\n    }\n    totalCount\n  }\n  viewerHasReacted\n}\n\nfragment ReactionViewerGroups on Reactable {\n  __isReactable: __typename\n  reactionGroups {\n    ...ReactionButton_Reaction\n    ...ReactionsMenuItem_Reaction\n  }\n}\n\nfragment ReactionsMenuItem_Reaction on ReactionGroup {\n  content\n  viewerHasReacted\n}\n',
      '0352debf843706fdfe45f78e9a673e88':
        'mutation createIssueTypeMutation(\n  $input: CreateIssueTypeInput!\n) {\n  createIssueType(input: $input) {\n    issueType {\n      id\n      name\n      description\n      isEnabled\n      isPrivate\n    }\n    errors {\n      __typename\n      message\n    }\n  }\n}\n',
      '04ba37f7e52d10064ab666f7ddeec8cf':
        'mutation minimizeCommentMutation(\n  $input: MinimizeCommentInput!\n) {\n  minimizeComment(input: $input) {\n    clientMutationId\n    minimizedComment {\n      __typename\n      isMinimized\n      minimizedReason\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n  }\n}\n',
      '050f8934f18fd80a6b72aec109e7b494':
        'mutation unresolvePullRequestThreadMutation(\n  $id: ID!\n) {\n  unresolvePullRequestThread(input: {threadId: $id}) {\n    thread {\n      id\n      isResolved\n      path\n      viewerCanResolve\n      viewerCanUnresolve\n      comments {\n        totalCount\n      }\n    }\n  }\n}\n',
    },
    // these are made up just to check various argument types
    {
      '<hash1>': 'query FirstQuery($a: Int!) { id }',
      '<hash2>': 'query FirstQuery($b: String!) { id }',
      '<hash3>': 'query FirstQuery($c: Bool!) { id }',
      '<hash4>': 'query FirstQuery($d: SomeOtherType) { id }',
    },
    {
      '<hash5>': 'query FirstQuery($d: Int) { id }',
      '<hash6>': 'query FirstQuery($e: String) { id }',
      '<hash7>': 'query FirstQuery($f: Bool) { id }',
    },
    {
      '<hash8>': 'query FirstQuery($d: [Int]) { id }',
      '<hash9>': 'query FirstQuery($e: [String!]!) { id }',
      '<hash10>': 'query FirstQuery($f: [Bool]!) { id }',
    },
  ])

  expect(params).toEqual({
    '000f5fce55296adfb1f118945be0de7c': {
      input: 'AddSubIssueInput!',
    },
    '00373a7f95314e54628f49cf0f165618': {
      number: 'Int!',
      owner: 'String!',
      repo: 'String!',
    },
    '0064f66d41f5cbaf1946d2ccc70542cf': {
      cursor: 'String',
      first: 'Int',
      id: 'ID!',
      query: 'String!',
    },
    '011ffed3f1f0c46955a4b7307f29bfb1': {},
    '01605ebfa9a57f7c60a96f03bb4ad2c3': {
      input: 'ApplySuggestedChangesInput!',
    },
    '01ba2647727ea5877eff4595e869734d': {
      input: 'RemoveTeamDashboardSearchShortcutInput!',
    },
    '01d289044c122c85ae92584e14377fdb': {},
    '032734763552cba0b58dbd30f6aaf95d': {
      commentId: 'ID!',
    },
    '0352debf843706fdfe45f78e9a673e88': {
      input: 'CreateIssueTypeInput!',
    },
    '04ba37f7e52d10064ab666f7ddeec8cf': {
      input: 'MinimizeCommentInput!',
    },
    '050f8934f18fd80a6b72aec109e7b494': {
      id: 'ID!',
    },
    '<hash10>': {
      f: '[Bool]!',
    },
    '<hash1>': {
      a: 'Int!',
    },
    '<hash2>': {
      b: 'String!',
    },
    '<hash3>': {
      c: 'Bool!',
    },
    '<hash4>': {
      d: 'SomeOtherType',
    },
    '<hash5>': {
      d: 'Int',
    },
    '<hash6>': {
      e: 'String',
    },
    '<hash7>': {
      f: 'Bool',
    },
    '<hash8>': {
      d: '[Int]',
    },
    '<hash9>': {
      e: '[String!]!',
    },
  })
})
