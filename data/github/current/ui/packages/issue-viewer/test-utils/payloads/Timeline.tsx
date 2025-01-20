type MakeTimelineProps = {
  issueId?: string
  numComments?: number
  numPinnedEvents?: number
  hasNextPage?: boolean
  totalComments?: number
  startIndex?: number
  startCursor?: string
}

const TIMELINE_DEFAULT_ARGS = {
  numComments: 3,
  numPinnedEvents: 0,
  overwrite: undefined,
  hasNextPage: false,
  totalComments: 3,
  startIndex: 0,
}

export const makeTimelineComment = (number: number) => {
  return {
    __typename: 'IssueComment',
    id: `comment ${number}`,
    bodyHTML: `comment body ${number}`,
    databaseId: number,
    isHidden: false,
    reactionGroups: [],
  }
}

export const makeTimelinePinnedEvent = (number: number) => {
  return {
    __typename: 'PinnedEvent',
    id: `pinned_event_${number}`,
  }
}

export const makeTimelineLabeledEvent = (id: number) => {
  return {
    __typename: 'LabeledEvent',
    id: `labeled_event_${id}`,
    label: {
      id: `label_${id}`,
    },
  }
}

export const makeTimelineAssignedEvent = (id: number, assignee?: string, actor?: string) => {
  return {
    __typename: 'AssignedEvent',
    id: `assigned_event_${id}`,
    assignee: {
      id: `assignee_${id}`,
      login: assignee ?? 'monalisa',
    },
    actor: {
      login: actor ?? 'monalisa',
    },
  }
}

export const makeTimelineUnassignedEvent = (id: number, assignee?: string, actor?: string) => {
  return {
    __typename: 'UnassignedEvent',
    id: `unassigned_event_${id}`,
    assignee: {
      id: `assignee_${id}`,
      login: assignee ?? 'monalisa',
    },
    actor: {
      login: actor ?? 'monalisa',
    },
  }
}

export const makeTimelineAddedToProjectV2Event = (id: number, projectName?: string, actor?: string) => {
  return {
    __typename: 'AddedToProjectV2Event',
    id: `added_to_projectv2_event_${id}`,
    project: {
      title: projectName ?? 'project name',
    },
    actor: {
      login: actor ?? 'monalisa',
    },
  }
}

export const makeTimelineRemovedFromProjectV2Event = (id: number, projectName?: string, actor?: string) => {
  return {
    __typename: 'RemovedFromProjectV2Event',
    id: `removed_from_projectv2_event_${id}`,
    project: {
      title: projectName ?? 'project name',
    },
    actor: {
      login: actor ?? 'monalisa',
    },
  }
}

export const makeTimelineClosedEvent = (id?: string) => {
  return {
    __typename: 'ClosedEvent',
    id: id ?? `closed_event`,
  }
}

export const makeTimelineReopenedEvent = (id?: string) => {
  return {
    __typename: 'ReopenedEvent',
    id: id ?? `reopened_event`,
  }
}

export const makeTimelineCrossReferenceEvent = (
  id?: string,
  sourceId?: string,
  actor?: string,
  innerSourceTitle?: string,
  innerSourceNumber?: number,
) => {
  return {
    __typename: 'CrossReferencedEvent',
    id: id ?? `cross_references_event`,
    source: {
      __typename: 'Issue',
      id: sourceId ?? 'source_issue_id',
    },
    actor: {
      login: actor ?? 'monalisa',
    },
    innerSource: {
      __typename: 'Issue',
      id: sourceId ?? 'inner_source_issue_id',
      issueTitleHTML: innerSourceTitle ?? 'inner source title',
      number: innerSourceNumber ?? 54321,
    },
  }
}

export const makeTimeline = (props: MakeTimelineProps) => {
  const {numComments, hasNextPage, totalComments, startIndex, numPinnedEvents} = {
    ...TIMELINE_DEFAULT_ARGS,
    ...props,
  }
  const events = []
  for (let i = startIndex; i < numComments + startIndex; i++) {
    events.push({node: makeTimelineComment(i)})
  }

  for (let i = 0; i < numPinnedEvents; i++) {
    events.push({node: makeTimelineLabeledEvent(i)})
  }

  return {
    id: props.issueId || 'mockIssueId1',
    frontTimeline: {
      totalCount: totalComments,
      edges: events,
      pageInfo: {
        hasNextPage,
        endCursor: 'foocursor',
        startCursor: null,
      },
    },
    timelineItems: {
      totalCount: totalComments,
      edges: [],
      pageInfo: {
        hasPreviousPage: numComments > 0,
        hasNextPage: false,
        startCursor: null,
      },
    },
  }
}

export const makeBackTimeline = (props: MakeTimelineProps) => {
  const {numComments, totalComments, startIndex, startCursor} = {
    ...TIMELINE_DEFAULT_ARGS,
    ...props,
  }
  const comments = []
  for (let i = startIndex; i < numComments + startIndex; i++) {
    comments.push({node: makeTimelineComment(i)})
  }

  return {
    id: 'mockIssueId1',
    timelineItems: {
      totalCount: totalComments,
      edges: comments,
      pageInfo: {
        startCursor: startCursor ?? 'foocursorstart',
        hasPreviousPage: true,
      },
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toEdges = (items: any[]) => {
  return items.map(item => ({
    node: {
      ...item,
    },
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const timelineEdges = (items: any[]) => {
  return {
    edges: toEdges(items),
  }
}
