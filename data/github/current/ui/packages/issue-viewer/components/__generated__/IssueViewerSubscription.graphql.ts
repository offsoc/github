/**
 * @generated SignedSource<<89a94c2348ab98a287317269d89397b5>>
 * @relayHash ec4bbecd27eaaee4a883f2fa5c8a561a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ec4bbecd27eaaee4a883f2fa5c8a561a

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerSubscription$variables = {
  connections: ReadonlyArray<string>;
  issueId: string;
  skip?: number | null | undefined;
};
export type IssueViewerSubscription$data = {
  readonly issueUpdated: {
    readonly commentReactionUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"ReactionViewerGroups">;
    } | null | undefined;
    readonly commentUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueCommentEditorBodyFragment" | "IssueCommentViewerMarkdownViewer">;
    } | null | undefined;
    readonly deletedCommentId: string | null | undefined;
    readonly issueBodyUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueBodyContent">;
    } | null | undefined;
    readonly issueMetadataUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"AssigneesSectionAssignees" | "LabelsSectionAssignedLabels" | "MilestonesSectionMilestone" | "ProjectsSectionFragment">;
    } | null | undefined;
    readonly issueReactionUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"ReactionViewerGroups">;
    } | null | undefined;
    readonly issueStateUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"HeaderState" | "IssueActions">;
    } | null | undefined;
    readonly issueTimelineUpdated: {
      readonly timelineItems: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly __typename: string;
            readonly __id: string;
            readonly " $fragmentSpreads": FragmentRefs<"AddedToProjectEvent" | "AddedToProjectV2Event" | "AssignedEvent" | "ClosedEvent" | "CommentDeletedEvent" | "ConnectedEvent" | "ConvertedFromDraftEvent" | "ConvertedNoteToIssueEvent" | "ConvertedToDiscussionEvent" | "CrossReferencedEvent" | "DemilestonedEvent" | "DisconnectedEvent" | "IssueComment_issueComment" | "LabeledEvent" | "LockedEvent" | "MarkedAsDuplicateEvent" | "MentionedEvent" | "MilestonedEvent" | "MovedColumnsInProjectEvent" | "PinnedEvent" | "ProjectV2ItemStatusChangedEvent" | "ReactionViewerGroups" | "ReferencedEvent" | "RemovedFromProjectEvent" | "RemovedFromProjectV2Event" | "RenamedTitleEvent" | "ReopenedEvent" | "SubscribedEvent" | "TransferredEvent" | "UnassignedEvent" | "UnlabeledEvent" | "UnlockedEvent" | "UnmarkedAsDuplicateEvent" | "UnpinnedEvent" | "UnsubscribedEvent" | "UserBlockedEvent">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
        readonly totalCount: number;
      };
    } | null | undefined;
    readonly issueTitleUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"Header">;
    } | null | undefined;
    readonly issueTransferStateUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueBodyViewerSubIssues" | "SubIssuesList" | "useHasSubIssues">;
    } | null | undefined;
    readonly issueTypeUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"HeaderIssueType">;
    } | null | undefined;
    readonly parentIssueUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"HeaderParentTitle" | "RelationshipsSectionFragment">;
    } | null | undefined;
    readonly subIssuesUpdated: {
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesList" | "useHasSubIssues">;
    } | null | undefined;
  };
};
export type IssueViewerSubscription = {
  response: IssueViewerSubscription$data;
  variables: IssueViewerSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "issueId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "issueId"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedCommentId",
  "storageKey": null
},
v5 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "ReactionViewerGroups"
},
v6 = [
  (v5/*: any*/)
],
v7 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "SubIssuesList"
},
v8 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "useHasSubIssues"
},
v9 = {
  "kind": "Literal",
  "name": "first",
  "value": 10
},
v10 = [
  (v9/*: any*/),
  {
    "kind": "Variable",
    "name": "skip",
    "variableName": "skip"
  },
  {
    "kind": "Literal",
    "name": "visibleEventsOnly",
    "value": true
  }
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v13 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "size",
      "value": 64
    }
  ],
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": "avatarUrl(size:64)"
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v21 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  }
],
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v28 = [
  (v12/*: any*/),
  (v15/*: any*/),
  (v14/*: any*/)
],
v29 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v28/*: any*/),
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v16/*: any*/),
    (v29/*: any*/),
    (v30/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v32 = [
  (v9/*: any*/)
],
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v34 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v36 = [
  (v14/*: any*/)
],
v37 = {
  "kind": "InlineFragment",
  "selections": (v36/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v38 = {
  "alias": null,
  "args": (v32/*: any*/),
  "concreteType": "ProjectV2ItemConnection",
  "kind": "LinkedField",
  "name": "projectItemsNext",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2ItemEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2Item",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v14/*: any*/),
            (v30/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v14/*: any*/),
                (v18/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "template",
                  "storageKey": null
                },
                (v33/*: any*/),
                (v20/*: any*/),
                {
                  "alias": null,
                  "args": (v34/*: any*/),
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "field",
                  "plural": false,
                  "selections": [
                    (v12/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v14/*: any*/),
                        (v16/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ProjectV2SingleSelectFieldOption",
                          "kind": "LinkedField",
                          "name": "options",
                          "plural": true,
                          "selections": [
                            (v14/*: any*/),
                            (v35/*: any*/),
                            (v16/*: any*/),
                            (v23/*: any*/),
                            (v22/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "descriptionHTML",
                              "storageKey": null
                            },
                            (v24/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    },
                    (v37/*: any*/)
                  ],
                  "storageKey": "field(name:\"Status\")"
                },
                (v19/*: any*/),
                (v27/*: any*/),
                (v12/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": (v34/*: any*/),
              "concreteType": null,
              "kind": "LinkedField",
              "name": "fieldValueByName",
              "plural": false,
              "selections": [
                (v12/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v14/*: any*/),
                    (v35/*: any*/),
                    (v16/*: any*/),
                    (v23/*: any*/),
                    (v22/*: any*/)
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                (v37/*: any*/)
              ],
              "storageKey": "fieldValueByName(name:\"Status\")"
            },
            (v12/*: any*/)
          ],
          "storageKey": null
        },
        (v25/*: any*/)
      ],
      "storageKey": null
    },
    (v26/*: any*/)
  ],
  "storageKey": "projectItemsNext(first:10)"
},
v39 = {
  "alias": null,
  "args": (v32/*: any*/),
  "filters": [
    "allowedOwner"
  ],
  "handle": "connection",
  "key": "ProjectSection_projectItemsNext",
  "kind": "LinkedHandle",
  "name": "projectItemsNext"
},
v40 = [
  (v14/*: any*/),
  (v16/*: any*/)
],
v41 = {
  "alias": null,
  "args": (v32/*: any*/),
  "concreteType": "ProjectCardConnection",
  "kind": "LinkedField",
  "name": "projectCards",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectCardEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectCard",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v14/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Project",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v16/*: any*/),
                (v20/*: any*/),
                (v14/*: any*/),
                {
                  "alias": null,
                  "args": (v32/*: any*/),
                  "concreteType": "ProjectColumnConnection",
                  "kind": "LinkedField",
                  "name": "columns",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "ProjectColumn",
                      "kind": "LinkedField",
                      "name": "nodes",
                      "plural": true,
                      "selections": (v40/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": "columns(first:10)"
                },
                (v19/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v27/*: any*/),
                (v33/*: any*/),
                (v12/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectColumn",
              "kind": "LinkedField",
              "name": "column",
              "plural": false,
              "selections": (v40/*: any*/),
              "storageKey": null
            },
            (v12/*: any*/)
          ],
          "storageKey": null
        },
        (v25/*: any*/)
      ],
      "storageKey": null
    },
    (v26/*: any*/)
  ],
  "storageKey": "projectCards(first:10)"
},
v42 = {
  "alias": null,
  "args": (v32/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "ProjectSection_projectCards",
  "kind": "LinkedHandle",
  "name": "projectCards"
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdateMetadata",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v45 = {
  "kind": "Literal",
  "name": "unfurlReferences",
  "value": true
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyVersion",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titleHTML",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "concreteType": "IssueType",
  "kind": "LinkedField",
  "name": "issueType",
  "plural": false,
  "selections": [
    (v16/*: any*/),
    (v22/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stateReason",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v47/*: any*/),
    (v14/*: any*/),
    (v16/*: any*/),
    (v29/*: any*/)
  ],
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "concreteType": "SubIssuesSummary",
  "kind": "LinkedField",
  "name": "subIssuesSummary",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completed",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v56 = [
  (v11/*: any*/)
],
v57 = {
  "alias": "subIssuesConnection",
  "args": null,
  "concreteType": "IssueConnection",
  "kind": "LinkedField",
  "name": "subIssues",
  "plural": false,
  "selections": (v56/*: any*/),
  "storageKey": null
},
v58 = [
  (v15/*: any*/)
],
v59 = {
  "kind": "InlineFragment",
  "selections": (v58/*: any*/),
  "type": "User",
  "abstractKey": null
},
v60 = {
  "kind": "InlineFragment",
  "selections": (v58/*: any*/),
  "type": "Bot",
  "abstractKey": null
},
v61 = {
  "kind": "InlineFragment",
  "selections": (v58/*: any*/),
  "type": "Organization",
  "abstractKey": null
},
v62 = {
  "kind": "InlineFragment",
  "selections": (v58/*: any*/),
  "type": "Mannequin",
  "abstractKey": null
},
v63 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ReactionGroup",
      "kind": "LinkedField",
      "name": "reactionGroups",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "content",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 5
            }
          ],
          "concreteType": "ReactorConnection",
          "kind": "LinkedField",
          "name": "reactors",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "nodes",
              "plural": true,
              "selections": [
                (v12/*: any*/),
                (v59/*: any*/),
                (v60/*: any*/),
                (v61/*: any*/),
                (v62/*: any*/),
                (v37/*: any*/)
              ],
              "storageKey": null
            },
            (v11/*: any*/)
          ],
          "storageKey": "reactors(first:5)"
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerHasReacted",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Reactable",
  "abstractKey": "__isReactable"
},
v64 = [
  (v14/*: any*/),
  (v63/*: any*/)
],
v65 = {
  "alias": null,
  "args": [
    (v45/*: any*/)
  ],
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": "bodyHTML(unfurlReferences:true)"
},
v66 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": (v28/*: any*/),
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorAssociation",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanMinimize",
  "storageKey": null
},
v73 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v75 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v77 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v78 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
},
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdViaEmail",
  "storageKey": null
},
v80 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v81 = {
  "alias": null,
  "args": null,
  "concreteType": "Sponsorship",
  "kind": "LinkedField",
  "name": "authorToRepoOwnerSponsorship",
  "plural": false,
  "selections": [
    (v69/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isActive",
      "storageKey": null
    },
    (v14/*: any*/)
  ],
  "storageKey": null
},
v82 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    (v12/*: any*/),
    (v14/*: any*/),
    (v15/*: any*/),
    (v20/*: any*/)
  ],
  "storageKey": null
},
v83 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanReadUserContentEdits",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastEditedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserContentEdit",
      "kind": "LinkedField",
      "name": "lastUserContentEdit",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "editor",
          "plural": false,
          "selections": [
            (v12/*: any*/),
            (v20/*: any*/),
            (v15/*: any*/),
            (v14/*: any*/)
          ],
          "storageKey": null
        },
        (v14/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v84 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pendingMinimizeReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pendingBlock",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pendingUnblock",
      "storageKey": null
    }
  ]
},
v85 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v16/*: any*/),
    (v29/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v86 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "first",
      "value": 50
    }
  ],
  "concreteType": "IssueConnection",
  "kind": "LinkedField",
  "name": "subIssues",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        (v14/*: any*/),
        (v51/*: any*/),
        (v52/*: any*/),
        {
          "alias": null,
          "args": (v32/*: any*/),
          "concreteType": "UserConnection",
          "kind": "LinkedField",
          "name": "assignees",
          "plural": false,
          "selections": [
            (v11/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "UserEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v14/*: any*/),
                    (v15/*: any*/),
                    (v66/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": "assignees(first:10)"
        },
        (v20/*: any*/),
        (v85/*: any*/),
        (v68/*: any*/),
        (v27/*: any*/),
        (v18/*: any*/),
        (v49/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "IssueType",
          "kind": "LinkedField",
          "name": "issueType",
          "plural": false,
          "selections": [
            (v14/*: any*/),
            (v16/*: any*/),
            (v22/*: any*/)
          ],
          "storageKey": null
        },
        (v55/*: any*/),
        (v57/*: any*/),
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 0
            },
            {
              "kind": "Literal",
              "name": "includeClosedPrs",
              "value": true
            }
          ],
          "concreteType": "PullRequestConnection",
          "kind": "LinkedField",
          "name": "closedByPullRequestsReferences",
          "plural": false,
          "selections": (v56/*: any*/),
          "storageKey": "closedByPullRequestsReferences(first:0,includeClosedPrs:true)"
        },
        (v19/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": "subIssues(first:50)"
},
v87 = {
  "alias": null,
  "args": null,
  "concreteType": "Issue",
  "kind": "LinkedField",
  "name": "parent",
  "plural": false,
  "selections": (v36/*: any*/),
  "storageKey": null
},
v88 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v47/*: any*/),
    (v29/*: any*/),
    (v14/*: any*/),
    (v30/*: any*/)
  ],
  "storageKey": null
},
v89 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
},
v90 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v12/*: any*/),
    (v89/*: any*/),
    (v17/*: any*/),
    (v15/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v91 = {
  "alias": null,
  "args": null,
  "concreteType": "Project",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v16/*: any*/),
    (v20/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
},
v92 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectColumnName",
  "storageKey": null
},
v93 = [
  (v69/*: any*/),
  (v68/*: any*/),
  (v90/*: any*/)
],
v94 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v95 = [
  (v68/*: any*/),
  (v69/*: any*/),
  (v90/*: any*/)
],
v96 = [
  (v68/*: any*/),
  (v69/*: any*/),
  (v90/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Label",
    "kind": "LinkedField",
    "name": "label",
    "plural": false,
    "selections": [
      (v23/*: any*/),
      (v16/*: any*/),
      (v22/*: any*/),
      (v14/*: any*/),
      (v24/*: any*/),
      (v85/*: any*/)
    ],
    "storageKey": null
  }
],
v97 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "assignee",
  "plural": false,
  "selections": [
    (v12/*: any*/),
    (v59/*: any*/),
    (v62/*: any*/),
    (v61/*: any*/),
    (v60/*: any*/),
    (v37/*: any*/)
  ],
  "storageKey": null
},
v98 = [
  (v68/*: any*/),
  (v69/*: any*/),
  (v90/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "milestoneTitle",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Milestone",
    "kind": "LinkedField",
    "name": "milestone",
    "plural": false,
    "selections": [
      (v20/*: any*/),
      (v14/*: any*/)
    ],
    "storageKey": null
  }
],
v99 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v14/*: any*/),
    (v16/*: any*/),
    (v48/*: any*/),
    (v29/*: any*/)
  ],
  "storageKey": null
},
v100 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v101 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "commonName",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "emailAddress",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "organization",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "organizationUnit",
    "storageKey": null
  }
],
v102 = [
  (v68/*: any*/),
  (v90/*: any*/),
  (v69/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "subject",
    "plural": false,
    "selections": [
      (v12/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          (v18/*: any*/),
          (v20/*: any*/),
          (v27/*: any*/),
          (v51/*: any*/),
          (v54/*: any*/),
          (v100/*: any*/),
          (v85/*: any*/)
        ],
        "type": "PullRequest",
        "abstractKey": null
      },
      (v37/*: any*/)
    ],
    "storageKey": null
  }
],
v103 = [
  (v20/*: any*/),
  (v27/*: any*/),
  (v14/*: any*/)
],
v104 = [
  (v20/*: any*/),
  (v27/*: any*/)
],
v105 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v18/*: any*/),
    (v20/*: any*/),
    (v14/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueViewerSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueMetadataUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LabelsSectionAssignedLabels"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "AssigneesSectionAssignees"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "MilestonesSectionMilestone"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ProjectsSectionFragment"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueBodyUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueBodyContent"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTitleUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Header"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueStateUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "HeaderState"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueActions"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTypeUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "HeaderIssueType"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueReactionUpdated",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "commentReactionUpdated",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "commentUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueCommentViewerMarkdownViewer"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueCommentEditorBodyFragment"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTransferStateUpdated",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueBodyViewerSubIssues"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "parentIssueUpdated",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelationshipsSectionFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "HeaderParentTitle"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTimelineUpdated",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v10/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTimelineItemsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v12/*: any*/),
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "AddedToProjectEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "MovedColumnsInProjectEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "RemovedFromProjectEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "SubscribedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnsubscribedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "MentionedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "IssueComment_issueComment"
                          },
                          (v5/*: any*/),
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ClosedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ReopenedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "LockedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnlockedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "PinnedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnpinnedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "LabeledEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "RenamedTitleEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnlabeledEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnassignedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "AssignedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "CommentDeletedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UserBlockedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "MilestonedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "DemilestonedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "CrossReferencedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ReferencedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ConnectedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "TransferredEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ConvertedNoteToIssueEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "DisconnectedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "MarkedAsDuplicateEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "UnmarkedAsDuplicateEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ConvertedToDiscussionEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "AddedToProjectV2Event"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "RemovedFromProjectV2Event"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ProjectV2ItemStatusChangedEvent"
                          },
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "ConvertedFromDraftEvent"
                          },
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "IssueViewerSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "IssueUpdatedPayload",
        "kind": "LinkedField",
        "name": "issueUpdated",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteRecord",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedCommentId"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueMetadataUpdated",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 20
                  }
                ],
                "concreteType": "UserConnection",
                "kind": "LinkedField",
                "name": "assignees",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v14/*: any*/),
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Milestone",
                "kind": "LinkedField",
                "name": "milestone",
                "plural": false,
                "selections": [
                  (v14/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dueOn",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressPercentage",
                    "storageKey": null
                  },
                  (v20/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "closedAt",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v14/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v21/*: any*/),
                    "concreteType": "LabelConnection",
                    "kind": "LinkedField",
                    "name": "labels",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "LabelEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Label",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v14/*: any*/),
                              (v22/*: any*/),
                              (v16/*: any*/),
                              (v23/*: any*/),
                              (v24/*: any*/),
                              (v20/*: any*/),
                              (v12/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v25/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v26/*: any*/)
                    ],
                    "storageKey": "labels(first:100,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
                  },
                  {
                    "alias": null,
                    "args": (v21/*: any*/),
                    "filters": [
                      "orderBy"
                    ],
                    "handle": "connection",
                    "key": "MetadataSectionAssignedLabels_labels",
                    "kind": "LinkedHandle",
                    "name": "labels"
                  },
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isNode"
                  }
                ],
                "type": "Labelable",
                "abstractKey": "__isLabelable"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v27/*: any*/),
                      (v31/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v41/*: any*/),
                      (v42/*: any*/),
                      (v43/*: any*/)
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v27/*: any*/),
                      (v31/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v41/*: any*/),
                      (v42/*: any*/),
                      (v33/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  }
                ],
                "type": "IssueOrPullRequest",
                "abstractKey": "__isIssueOrPullRequest"
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueBodyUpdated",
            "plural": false,
            "selections": [
              (v44/*: any*/),
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "renderTasklistBlocks",
                    "value": true
                  },
                  (v45/*: any*/)
                ],
                "kind": "ScalarField",
                "name": "bodyHTML",
                "storageKey": "bodyHTML(renderTasklistBlocks:true,unfurlReferences:true)"
              },
              (v46/*: any*/),
              (v14/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTitleUpdated",
            "plural": false,
            "selections": [
              (v18/*: any*/),
              (v27/*: any*/),
              (v14/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v47/*: any*/),
                  (v14/*: any*/),
                  (v16/*: any*/),
                  (v29/*: any*/),
                  (v30/*: any*/),
                  (v48/*: any*/)
                ],
                "storageKey": null
              },
              (v49/*: any*/),
              (v20/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateNext",
                "storageKey": null
              },
              (v50/*: any*/),
              (v51/*: any*/),
              (v52/*: any*/),
              {
                "alias": "linkedPullRequests",
                "args": [
                  (v9/*: any*/),
                  {
                    "kind": "Literal",
                    "name": "includeClosedPrs",
                    "value": false
                  },
                  {
                    "kind": "Literal",
                    "name": "orderByState",
                    "value": true
                  }
                ],
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequest",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v53/*: any*/),
                      (v51/*: any*/),
                      (v54/*: any*/),
                      (v20/*: any*/),
                      (v27/*: any*/),
                      (v14/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
              },
              (v55/*: any*/),
              (v57/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueStateUpdated",
            "plural": false,
            "selections": [
              (v51/*: any*/),
              (v52/*: any*/),
              (v14/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTypeUpdated",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v47/*: any*/),
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              (v50/*: any*/),
              (v14/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueReactionUpdated",
            "plural": false,
            "selections": (v64/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "commentReactionUpdated",
            "plural": false,
            "selections": (v64/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueComment",
            "kind": "LinkedField",
            "name": "commentUpdated",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              (v44/*: any*/),
              (v65/*: any*/),
              (v46/*: any*/),
              (v33/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v12/*: any*/),
                  (v15/*: any*/),
                  (v66/*: any*/),
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "issue",
                "plural": false,
                "selections": [
                  (v67/*: any*/),
                  (v14/*: any*/),
                  (v27/*: any*/)
                ],
                "storageKey": null
              },
              (v68/*: any*/),
              (v20/*: any*/),
              (v69/*: any*/),
              (v70/*: any*/),
              (v71/*: any*/),
              (v72/*: any*/),
              (v73/*: any*/),
              (v74/*: any*/),
              (v75/*: any*/),
              (v76/*: any*/),
              (v77/*: any*/),
              (v78/*: any*/),
              (v79/*: any*/),
              (v80/*: any*/),
              (v81/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v14/*: any*/),
                  (v16/*: any*/),
                  (v82/*: any*/),
                  (v48/*: any*/)
                ],
                "storageKey": null
              },
              (v83/*: any*/),
              (v84/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "subIssuesUpdated",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              (v86/*: any*/),
              (v57/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v47/*: any*/),
                  (v29/*: any*/),
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              (v87/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTransferStateUpdated",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              (v86/*: any*/),
              (v57/*: any*/),
              (v88/*: any*/),
              (v87/*: any*/),
              (v43/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "parentIssueUpdated",
            "plural": false,
            "selections": [
              (v14/*: any*/),
              (v88/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": [
                  (v14/*: any*/),
                  (v18/*: any*/),
                  (v20/*: any*/),
                  (v27/*: any*/),
                  (v53/*: any*/),
                  (v51/*: any*/),
                  (v52/*: any*/),
                  (v55/*: any*/),
                  (v57/*: any*/)
                ],
                "storageKey": null
              },
              (v43/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issueTimelineUpdated",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v10/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTimelineItemsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v12/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v91/*: any*/),
                              (v92/*: any*/),
                              (v68/*: any*/)
                            ],
                            "type": "AddedToProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v68/*: any*/),
                              (v90/*: any*/),
                              (v91/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "previousProjectColumnName",
                                "storageKey": null
                              },
                              (v92/*: any*/)
                            ],
                            "type": "MovedColumnsInProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v68/*: any*/),
                              (v90/*: any*/),
                              (v91/*: any*/),
                              (v92/*: any*/)
                            ],
                            "type": "RemovedFromProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v93/*: any*/),
                            "type": "SubscribedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v93/*: any*/),
                            "type": "UnsubscribedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v93/*: any*/),
                            "type": "MentionedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v14/*: any*/),
                              (v68/*: any*/),
                              (v44/*: any*/),
                              (v65/*: any*/),
                              (v46/*: any*/),
                              (v33/*: any*/),
                              (v20/*: any*/),
                              (v69/*: any*/),
                              (v70/*: any*/),
                              (v71/*: any*/),
                              (v72/*: any*/),
                              (v73/*: any*/),
                              (v74/*: any*/),
                              (v75/*: any*/),
                              (v76/*: any*/),
                              (v77/*: any*/),
                              (v78/*: any*/),
                              (v79/*: any*/),
                              (v80/*: any*/),
                              (v81/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  (v14/*: any*/),
                                  (v15/*: any*/),
                                  (v66/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Repository",
                                "kind": "LinkedField",
                                "name": "repository",
                                "plural": false,
                                "selections": [
                                  (v14/*: any*/),
                                  (v16/*: any*/),
                                  (v82/*: any*/),
                                  (v48/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "slashCommandsEnabled",
                                    "storageKey": null
                                  },
                                  (v47/*: any*/),
                                  (v68/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Issue",
                                "kind": "LinkedField",
                                "name": "issue",
                                "plural": false,
                                "selections": [
                                  (v27/*: any*/),
                                  (v14/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "locked",
                                    "storageKey": null
                                  },
                                  (v67/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v83/*: any*/),
                              (v84/*: any*/),
                              (v63/*: any*/)
                            ],
                            "type": "IssueComment",
                            "abstractKey": null
                          },
                          (v63/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              (v52/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "closingProjectItemStatus",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "closer",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v20/*: any*/),
                                      (v18/*: any*/)
                                    ],
                                    "type": "ProjectV2",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v20/*: any*/),
                                      (v27/*: any*/),
                                      (v85/*: any*/)
                                    ],
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v20/*: any*/),
                                      (v94/*: any*/),
                                      (v85/*: any*/)
                                    ],
                                    "type": "Commit",
                                    "abstractKey": null
                                  },
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v90/*: any*/)
                            ],
                            "type": "ClosedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v95/*: any*/),
                            "type": "ReopenedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "lockReason",
                                "storageKey": null
                              },
                              (v90/*: any*/)
                            ],
                            "type": "LockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v95/*: any*/),
                            "type": "UnlockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v95/*: any*/),
                            "type": "PinnedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v95/*: any*/),
                            "type": "UnpinnedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v96/*: any*/),
                            "type": "LabeledEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              (v90/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "currentTitle",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "previousTitle",
                                "storageKey": null
                              }
                            ],
                            "type": "RenamedTitleEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v96/*: any*/),
                            "type": "UnlabeledEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "actor",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  (v15/*: any*/),
                                  (v89/*: any*/),
                                  (v17/*: any*/),
                                  (v14/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v97/*: any*/)
                            ],
                            "type": "UnassignedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v97/*: any*/)
                            ],
                            "type": "AssignedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              (v90/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "deletedCommentAuthor",
                                "plural": false,
                                "selections": (v28/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "type": "CommentDeletedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "blockDuration",
                                "storageKey": null
                              },
                              (v90/*: any*/),
                              {
                                "alias": "blockedUser",
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "subject",
                                "plural": false,
                                "selections": [
                                  (v15/*: any*/),
                                  (v14/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "UserBlockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v98/*: any*/),
                            "type": "MilestonedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v98/*: any*/),
                            "type": "DemilestonedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "referencedAt",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "willCloseTarget",
                                "storageKey": null
                              },
                              (v68/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "target",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Repository",
                                        "kind": "LinkedField",
                                        "name": "repository",
                                        "plural": false,
                                        "selections": (v36/*: any*/),
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": "innerSource",
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "source",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  {
                                    "kind": "TypeDiscriminator",
                                    "abstractKey": "__isReferencedSubject"
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v14/*: any*/),
                                      {
                                        "alias": "issueTitleHTML",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "titleHTML",
                                        "storageKey": null
                                      },
                                      (v20/*: any*/),
                                      (v27/*: any*/),
                                      (v52/*: any*/),
                                      (v99/*: any*/)
                                    ],
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v14/*: any*/),
                                      {
                                        "alias": "pullTitleHTML",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "titleHTML",
                                        "storageKey": null
                                      },
                                      (v20/*: any*/),
                                      (v27/*: any*/),
                                      (v51/*: any*/),
                                      (v54/*: any*/),
                                      (v100/*: any*/),
                                      (v99/*: any*/)
                                    ],
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v90/*: any*/)
                            ],
                            "type": "CrossReferencedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "willCloseSubject",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "subject",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v90/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Commit",
                                "kind": "LinkedField",
                                "name": "commit",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "message",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "messageHeadlineHTML",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "messageBodyHTML",
                                    "storageKey": null
                                  },
                                  (v20/*: any*/),
                                  (v94/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "signature",
                                    "plural": false,
                                    "selections": [
                                      (v12/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "User",
                                        "kind": "LinkedField",
                                        "name": "signer",
                                        "plural": false,
                                        "selections": [
                                          (v15/*: any*/),
                                          (v66/*: any*/),
                                          (v14/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v51/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "wasSignedByGitHub",
                                        "storageKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "CertificateAttributes",
                                            "kind": "LinkedField",
                                            "name": "issuer",
                                            "plural": false,
                                            "selections": (v101/*: any*/),
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "CertificateAttributes",
                                            "kind": "LinkedField",
                                            "name": "subject",
                                            "plural": false,
                                            "selections": (v101/*: any*/),
                                            "storageKey": null
                                          }
                                        ],
                                        "type": "SmimeSignature",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "keyId",
                                            "storageKey": null
                                          }
                                        ],
                                        "type": "GpgSignature",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "keyFingerprint",
                                            "storageKey": null
                                          }
                                        ],
                                        "type": "SshSignature",
                                        "abstractKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "verificationStatus",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "hasSignature",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Repository",
                                    "kind": "LinkedField",
                                    "name": "repository",
                                    "plural": false,
                                    "selections": [
                                      (v16/*: any*/),
                                      (v29/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "defaultBranch",
                                        "storageKey": null
                                      },
                                      (v14/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v14/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v69/*: any*/)
                            ],
                            "type": "ReferencedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v102/*: any*/),
                            "type": "ConnectedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v90/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Repository",
                                "kind": "LinkedField",
                                "name": "fromRepository",
                                "plural": false,
                                "selections": [
                                  (v47/*: any*/),
                                  (v20/*: any*/),
                                  (v14/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "TransferredEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v90/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Project",
                                "kind": "LinkedField",
                                "name": "project",
                                "plural": false,
                                "selections": [
                                  (v20/*: any*/),
                                  (v16/*: any*/),
                                  (v14/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "ConvertedNoteToIssueEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v102/*: any*/),
                            "type": "DisconnectedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v90/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "canonical",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v103/*: any*/),
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v103/*: any*/),
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v68/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanUndo",
                                "storageKey": null
                              },
                              (v14/*: any*/),
                              {
                                "kind": "ClientExtension",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingUndo",
                                    "storageKey": null
                                  }
                                ]
                              }
                            ],
                            "type": "MarkedAsDuplicateEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v90/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "canonical",
                                "plural": false,
                                "selections": [
                                  (v12/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v104/*: any*/),
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v104/*: any*/),
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v37/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v68/*: any*/)
                            ],
                            "type": "UnmarkedAsDuplicateEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v90/*: any*/),
                              (v69/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Discussion",
                                "kind": "LinkedField",
                                "name": "discussion",
                                "plural": false,
                                "selections": (v103/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "type": "ConvertedToDiscussionEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v68/*: any*/),
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v105/*: any*/)
                            ],
                            "type": "AddedToProjectV2Event",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v105/*: any*/)
                            ],
                            "type": "RemovedFromProjectV2Event",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v105/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "previousStatus",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "status",
                                "storageKey": null
                              }
                            ],
                            "type": "ProjectV2ItemStatusChangedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v69/*: any*/),
                              (v90/*: any*/),
                              (v68/*: any*/)
                            ],
                            "type": "ConvertedFromDraftEvent",
                            "abstractKey": null
                          },
                          (v37/*: any*/),
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "filters": null,
                    "handle": "appendEdge",
                    "key": "",
                    "kind": "LinkedHandle",
                    "name": "edges",
                    "handleArgs": [
                      {
                        "kind": "Variable",
                        "name": "connections",
                        "variableName": "connections"
                      }
                    ]
                  }
                ],
                "storageKey": null
              },
              (v14/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "ec4bbecd27eaaee4a883f2fa5c8a561a",
    "metadata": {},
    "name": "IssueViewerSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "0db22a08e5f7a8718bfc335ef68cd88a";

export default node;
