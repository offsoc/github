/**
 * @generated SignedSource<<2fad179846f6ab7c161e91b5a9ca3b44>>
 * @relayHash 3ecbe7f989372dc737ac580a4a020b10
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3ecbe7f989372dc737ac580a4a020b10

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueEventWrapperQuery$variables = Record<PropertyKey, never>;
export type IssueEventWrapperQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly " $fragmentSpreads": FragmentRefs<"AddedToProjectEvent" | "AddedToProjectV2Event" | "AssignedEvent" | "ClosedEvent" | "CommentDeletedEvent" | "ConnectedEvent" | "ConvertedFromDraftEvent" | "ConvertedNoteToIssueEvent" | "ConvertedToDiscussionEvent" | "CrossReferencedEvent" | "DemilestonedEvent" | "DisconnectedEvent" | "IssueComment_issueComment" | "LabeledEvent" | "LockedEvent" | "MarkedAsDuplicateEvent" | "MentionedEvent" | "MilestonedEvent" | "MovedColumnsInProjectEvent" | "PinnedEvent" | "ProjectV2ItemStatusChangedEvent" | "ReactionViewerGroups" | "ReferencedEvent" | "RemovedFromProjectEvent" | "RemovedFromProjectV2Event" | "RenamedTitleEvent" | "ReopenedEvent" | "SubscribedEvent" | "TransferredEvent" | "UnassignedEvent" | "UnlabeledEvent" | "UnlockedEvent" | "UnmarkedAsDuplicateEvent" | "UnpinnedEvent" | "UnsubscribedEvent" | "UserBlockedEvent">;
  } | null | undefined;
};
export type IssueEventWrapperQuery = {
  response: IssueEventWrapperQuery$data;
  variables: IssueEventWrapperQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "SSC_asdkasd"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v12 = [
  (v1/*: any*/),
  (v6/*: any*/),
  (v2/*: any*/)
],
v13 = [
  (v6/*: any*/)
],
v14 = {
  "kind": "InlineFragment",
  "selections": (v13/*: any*/),
  "type": "User",
  "abstractKey": null
},
v15 = {
  "kind": "InlineFragment",
  "selections": (v13/*: any*/),
  "type": "Bot",
  "abstractKey": null
},
v16 = {
  "kind": "InlineFragment",
  "selections": (v13/*: any*/),
  "type": "Organization",
  "abstractKey": null
},
v17 = {
  "kind": "InlineFragment",
  "selections": (v13/*: any*/),
  "type": "Mannequin",
  "abstractKey": null
},
v18 = [
  (v2/*: any*/)
],
v19 = {
  "kind": "InlineFragment",
  "selections": (v18/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v20 = {
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
                (v1/*: any*/),
                (v14/*: any*/),
                (v15/*: any*/),
                (v16/*: any*/),
                (v17/*: any*/),
                (v19/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalCount",
              "storageKey": null
            }
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
v21 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
},
v22 = {
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
v23 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v1/*: any*/),
    (v21/*: any*/),
    (v22/*: any*/),
    (v6/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "concreteType": "Project",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v4/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectColumnName",
  "storageKey": null
},
v26 = [
  (v5/*: any*/),
  (v3/*: any*/),
  (v23/*: any*/)
],
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stateReason",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v29/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v32 = [
  (v3/*: any*/),
  (v5/*: any*/),
  (v23/*: any*/)
],
v33 = [
  (v3/*: any*/),
  (v5/*: any*/),
  (v23/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Label",
    "kind": "LinkedField",
    "name": "label",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "nameHTML",
        "storageKey": null
      },
      (v8/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "color",
        "storageKey": null
      },
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      (v30/*: any*/)
    ],
    "storageKey": null
  }
],
v34 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "assignee",
  "plural": false,
  "selections": [
    (v1/*: any*/),
    (v14/*: any*/),
    (v17/*: any*/),
    (v16/*: any*/),
    (v15/*: any*/),
    (v19/*: any*/)
  ],
  "storageKey": null
},
v35 = [
  (v3/*: any*/),
  (v5/*: any*/),
  (v23/*: any*/),
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
      (v4/*: any*/),
      (v2/*: any*/)
    ],
    "storageKey": null
  }
],
v36 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v8/*: any*/),
    (v9/*: any*/),
    (v29/*: any*/)
  ],
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v40 = [
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
v41 = [
  (v3/*: any*/),
  (v23/*: any*/),
  (v5/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "subject",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          (v28/*: any*/),
          (v4/*: any*/),
          (v11/*: any*/),
          (v37/*: any*/),
          (v38/*: any*/),
          (v39/*: any*/),
          (v30/*: any*/)
        ],
        "type": "PullRequest",
        "abstractKey": null
      },
      (v19/*: any*/)
    ],
    "storageKey": null
  }
],
v42 = [
  (v4/*: any*/),
  (v11/*: any*/),
  (v2/*: any*/)
],
v43 = [
  (v4/*: any*/),
  (v11/*: any*/)
],
v44 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v28/*: any*/),
    (v4/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v45 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v46 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v47 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v48 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v49 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v50 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v51 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v52 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v53 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v54 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v55 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v56 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v57 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "CertificateAttributes"
},
v58 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v59 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReferencedSubject"
},
v60 = {
  "enumValues": [
    "CLOSED",
    "MERGED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestState"
},
v61 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v62 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueEventWrapperQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "IssueComment_issueComment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactionViewerGroups"
          },
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
          }
        ],
        "storageKey": "node(id:\"SSC_asdkasd\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueEventWrapperQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "body",
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "unfurlReferences",
                    "value": true
                  }
                ],
                "kind": "ScalarField",
                "name": "bodyHTML",
                "storageKey": "bodyHTML(unfurlReferences:true)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyVersion",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdate",
                "storageKey": null
              },
              (v4/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "authorAssociation",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanDelete",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanMinimize",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReport",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReportToMaintainer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanBlockFromOrg",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUnblockFromOrg",
                "storageKey": null
              },
              {
                "alias": "isHidden",
                "args": null,
                "kind": "ScalarField",
                "name": "isMinimized",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "minimizedReason",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdViaEmail",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerDidAuthor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Sponsorship",
                "kind": "LinkedField",
                "name": "authorToRepoOwnerSponsorship",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isActive",
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/)
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
                  (v2/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      (v2/*: any*/),
                      (v6/*: any*/),
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "slashCommandsEnabled",
                    "storageKey": null
                  },
                  (v10/*: any*/),
                  (v3/*: any*/)
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
                  (v11/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "locked",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": (v12/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
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
                          (v1/*: any*/),
                          (v4/*: any*/),
                          (v6/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              {
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
              (v20/*: any*/)
            ],
            "type": "IssueComment",
            "abstractKey": null
          },
          (v20/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              (v25/*: any*/),
              (v3/*: any*/)
            ],
            "type": "AddedToProjectEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              (v3/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "previousProjectColumnName",
                "storageKey": null
              },
              (v25/*: any*/)
            ],
            "type": "MovedColumnsInProjectEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              (v3/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              (v25/*: any*/)
            ],
            "type": "RemovedFromProjectEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v26/*: any*/),
            "type": "SubscribedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v26/*: any*/),
            "type": "UnsubscribedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v26/*: any*/),
            "type": "MentionedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v27/*: any*/),
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
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v4/*: any*/),
                      (v28/*: any*/)
                    ],
                    "type": "ProjectV2",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v4/*: any*/),
                      (v11/*: any*/),
                      (v30/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v4/*: any*/),
                      (v31/*: any*/),
                      (v30/*: any*/)
                    ],
                    "type": "Commit",
                    "abstractKey": null
                  },
                  (v19/*: any*/)
                ],
                "storageKey": null
              },
              (v23/*: any*/)
            ],
            "type": "ClosedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v32/*: any*/),
            "type": "ReopenedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lockReason",
                "storageKey": null
              },
              (v23/*: any*/)
            ],
            "type": "LockedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v32/*: any*/),
            "type": "UnlockedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v32/*: any*/),
            "type": "PinnedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v32/*: any*/),
            "type": "UnpinnedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v33/*: any*/),
            "type": "LabeledEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v23/*: any*/),
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
            "selections": (v33/*: any*/),
            "type": "UnlabeledEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v6/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v34/*: any*/)
            ],
            "type": "UnassignedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v23/*: any*/),
              (v34/*: any*/)
            ],
            "type": "AssignedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v23/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "deletedCommentAuthor",
                "plural": false,
                "selections": (v12/*: any*/),
                "storageKey": null
              }
            ],
            "type": "CommentDeletedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "blockDuration",
                "storageKey": null
              },
              (v23/*: any*/),
              {
                "alias": "blockedUser",
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "UserBlockedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v35/*: any*/),
            "type": "MilestonedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v35/*: any*/),
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
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "target",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
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
                        "selections": (v18/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  (v19/*: any*/)
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
                  (v1/*: any*/),
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isReferencedSubject"
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": "issueTitleHTML",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titleHTML",
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      (v11/*: any*/),
                      (v27/*: any*/),
                      (v36/*: any*/)
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": "pullTitleHTML",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titleHTML",
                        "storageKey": null
                      },
                      (v4/*: any*/),
                      (v11/*: any*/),
                      (v37/*: any*/),
                      (v38/*: any*/),
                      (v39/*: any*/),
                      (v36/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  (v19/*: any*/)
                ],
                "storageKey": null
              },
              (v23/*: any*/)
            ],
            "type": "CrossReferencedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
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
                  (v1/*: any*/),
                  (v19/*: any*/)
                ],
                "storageKey": null
              },
              (v23/*: any*/),
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
                  (v4/*: any*/),
                  (v31/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "signature",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "signer",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          (v7/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v37/*: any*/),
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
                            "selections": (v40/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "CertificateAttributes",
                            "kind": "LinkedField",
                            "name": "subject",
                            "plural": false,
                            "selections": (v40/*: any*/),
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
                      (v8/*: any*/),
                      (v29/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "defaultBranch",
                        "storageKey": null
                      },
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v5/*: any*/)
            ],
            "type": "ReferencedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v41/*: any*/),
            "type": "ConnectedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v23/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "fromRepository",
                "plural": false,
                "selections": [
                  (v10/*: any*/),
                  (v4/*: any*/),
                  (v2/*: any*/)
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
              (v3/*: any*/),
              (v23/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Project",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v8/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "ConvertedNoteToIssueEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v41/*: any*/),
            "type": "DisconnectedEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v23/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "canonical",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v42/*: any*/),
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v42/*: any*/),
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  (v19/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUndo",
                "storageKey": null
              },
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
              (v23/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "canonical",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v43/*: any*/),
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v43/*: any*/),
                    "type": "PullRequest",
                    "abstractKey": null
                  },
                  (v19/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "type": "UnmarkedAsDuplicateEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v23/*: any*/),
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Discussion",
                "kind": "LinkedField",
                "name": "discussion",
                "plural": false,
                "selections": (v42/*: any*/),
                "storageKey": null
              }
            ],
            "type": "ConvertedToDiscussionEvent",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v23/*: any*/),
              (v44/*: any*/)
            ],
            "type": "AddedToProjectV2Event",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              (v23/*: any*/),
              (v44/*: any*/)
            ],
            "type": "RemovedFromProjectV2Event",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v5/*: any*/),
              (v23/*: any*/),
              (v44/*: any*/),
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
              (v5/*: any*/),
              (v23/*: any*/),
              (v3/*: any*/)
            ],
            "type": "ConvertedFromDraftEvent",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"SSC_asdkasd\")"
      }
    ]
  },
  "params": {
    "id": "3ecbe7f989372dc737ac580a4a020b10",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__isComment": (v45/*: any*/),
        "node.__isReactable": (v45/*: any*/),
        "node.__typename": (v45/*: any*/),
        "node.actor": (v46/*: any*/),
        "node.actor.__isActor": (v45/*: any*/),
        "node.actor.__typename": (v45/*: any*/),
        "node.actor.avatarUrl": (v47/*: any*/),
        "node.actor.id": (v48/*: any*/),
        "node.actor.login": (v45/*: any*/),
        "node.assignee": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Assignee"
        },
        "node.assignee.__isNode": (v45/*: any*/),
        "node.assignee.__typename": (v45/*: any*/),
        "node.assignee.id": (v48/*: any*/),
        "node.assignee.login": (v45/*: any*/),
        "node.author": (v46/*: any*/),
        "node.author.__typename": (v45/*: any*/),
        "node.author.avatarUrl": (v47/*: any*/),
        "node.author.id": (v48/*: any*/),
        "node.author.login": (v45/*: any*/),
        "node.authorAssociation": {
          "enumValues": [
            "COLLABORATOR",
            "CONTRIBUTOR",
            "FIRST_TIMER",
            "FIRST_TIME_CONTRIBUTOR",
            "MANNEQUIN",
            "MEMBER",
            "NONE",
            "OWNER"
          ],
          "nullable": false,
          "plural": false,
          "type": "CommentAuthorAssociation"
        },
        "node.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "node.authorToRepoOwnerSponsorship.createdAt": (v49/*: any*/),
        "node.authorToRepoOwnerSponsorship.id": (v48/*: any*/),
        "node.authorToRepoOwnerSponsorship.isActive": (v50/*: any*/),
        "node.blockDuration": {
          "enumValues": [
            "ONE_DAY",
            "ONE_MONTH",
            "ONE_WEEK",
            "PERMANENT",
            "THREE_DAYS"
          ],
          "nullable": false,
          "plural": false,
          "type": "UserBlockDuration"
        },
        "node.blockedUser": (v51/*: any*/),
        "node.blockedUser.id": (v48/*: any*/),
        "node.blockedUser.login": (v45/*: any*/),
        "node.body": (v45/*: any*/),
        "node.bodyHTML": (v52/*: any*/),
        "node.bodyVersion": (v45/*: any*/),
        "node.canonical": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueOrPullRequest"
        },
        "node.canonical.__isNode": (v45/*: any*/),
        "node.canonical.__typename": (v45/*: any*/),
        "node.canonical.id": (v48/*: any*/),
        "node.canonical.number": (v53/*: any*/),
        "node.canonical.url": (v47/*: any*/),
        "node.closer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Closer"
        },
        "node.closer.__isNode": (v45/*: any*/),
        "node.closer.__typename": (v45/*: any*/),
        "node.closer.abbreviatedOid": (v45/*: any*/),
        "node.closer.id": (v48/*: any*/),
        "node.closer.number": (v53/*: any*/),
        "node.closer.repository": (v54/*: any*/),
        "node.closer.repository.id": (v48/*: any*/),
        "node.closer.repository.name": (v45/*: any*/),
        "node.closer.repository.owner": (v55/*: any*/),
        "node.closer.repository.owner.__typename": (v45/*: any*/),
        "node.closer.repository.owner.id": (v48/*: any*/),
        "node.closer.repository.owner.login": (v45/*: any*/),
        "node.closer.title": (v45/*: any*/),
        "node.closer.url": (v47/*: any*/),
        "node.closingProjectItemStatus": (v56/*: any*/),
        "node.commit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Commit"
        },
        "node.commit.abbreviatedOid": (v45/*: any*/),
        "node.commit.hasSignature": (v50/*: any*/),
        "node.commit.id": (v48/*: any*/),
        "node.commit.message": (v45/*: any*/),
        "node.commit.messageBodyHTML": (v52/*: any*/),
        "node.commit.messageHeadlineHTML": (v52/*: any*/),
        "node.commit.repository": (v54/*: any*/),
        "node.commit.repository.defaultBranch": (v45/*: any*/),
        "node.commit.repository.id": (v48/*: any*/),
        "node.commit.repository.name": (v45/*: any*/),
        "node.commit.repository.owner": (v55/*: any*/),
        "node.commit.repository.owner.__typename": (v45/*: any*/),
        "node.commit.repository.owner.id": (v48/*: any*/),
        "node.commit.repository.owner.login": (v45/*: any*/),
        "node.commit.signature": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitSignature"
        },
        "node.commit.signature.__typename": (v45/*: any*/),
        "node.commit.signature.issuer": (v57/*: any*/),
        "node.commit.signature.issuer.commonName": (v56/*: any*/),
        "node.commit.signature.issuer.emailAddress": (v56/*: any*/),
        "node.commit.signature.issuer.organization": (v56/*: any*/),
        "node.commit.signature.issuer.organizationUnit": (v56/*: any*/),
        "node.commit.signature.keyFingerprint": (v56/*: any*/),
        "node.commit.signature.keyId": (v56/*: any*/),
        "node.commit.signature.signer": (v51/*: any*/),
        "node.commit.signature.signer.avatarUrl": (v47/*: any*/),
        "node.commit.signature.signer.id": (v48/*: any*/),
        "node.commit.signature.signer.login": (v45/*: any*/),
        "node.commit.signature.state": {
          "enumValues": [
            "BAD_CERT",
            "BAD_EMAIL",
            "EXPIRED_KEY",
            "GPGVERIFY_ERROR",
            "GPGVERIFY_UNAVAILABLE",
            "INVALID",
            "MALFORMED_SIG",
            "NOT_SIGNING_KEY",
            "NO_USER",
            "OCSP_ERROR",
            "OCSP_PENDING",
            "OCSP_REVOKED",
            "UNKNOWN_KEY",
            "UNKNOWN_SIG_TYPE",
            "UNSIGNED",
            "UNVERIFIED_EMAIL",
            "VALID"
          ],
          "nullable": false,
          "plural": false,
          "type": "GitSignatureState"
        },
        "node.commit.signature.subject": (v57/*: any*/),
        "node.commit.signature.subject.commonName": (v56/*: any*/),
        "node.commit.signature.subject.emailAddress": (v56/*: any*/),
        "node.commit.signature.subject.organization": (v56/*: any*/),
        "node.commit.signature.subject.organizationUnit": (v56/*: any*/),
        "node.commit.signature.wasSignedByGitHub": (v50/*: any*/),
        "node.commit.url": (v47/*: any*/),
        "node.commit.verificationStatus": {
          "enumValues": [
            "PARTIALLY_VERIFIED",
            "UNSIGNED",
            "UNVERIFIED",
            "VERIFIED"
          ],
          "nullable": true,
          "plural": false,
          "type": "CommitVerificationStatus"
        },
        "node.createdAt": (v49/*: any*/),
        "node.createdViaEmail": (v50/*: any*/),
        "node.currentTitle": (v45/*: any*/),
        "node.databaseId": (v58/*: any*/),
        "node.deletedCommentAuthor": (v46/*: any*/),
        "node.deletedCommentAuthor.__typename": (v45/*: any*/),
        "node.deletedCommentAuthor.id": (v48/*: any*/),
        "node.deletedCommentAuthor.login": (v45/*: any*/),
        "node.discussion": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Discussion"
        },
        "node.discussion.id": (v48/*: any*/),
        "node.discussion.number": (v53/*: any*/),
        "node.discussion.url": (v47/*: any*/),
        "node.fromRepository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "node.fromRepository.id": (v48/*: any*/),
        "node.fromRepository.nameWithOwner": (v45/*: any*/),
        "node.fromRepository.url": (v47/*: any*/),
        "node.id": (v48/*: any*/),
        "node.innerSource": (v59/*: any*/),
        "node.innerSource.__isNode": (v45/*: any*/),
        "node.innerSource.__isReferencedSubject": (v45/*: any*/),
        "node.innerSource.__typename": (v45/*: any*/),
        "node.innerSource.id": (v48/*: any*/),
        "node.innerSource.isDraft": (v50/*: any*/),
        "node.innerSource.isInMergeQueue": (v50/*: any*/),
        "node.innerSource.issueTitleHTML": (v45/*: any*/),
        "node.innerSource.number": (v53/*: any*/),
        "node.innerSource.pullTitleHTML": (v52/*: any*/),
        "node.innerSource.repository": (v54/*: any*/),
        "node.innerSource.repository.id": (v48/*: any*/),
        "node.innerSource.repository.isPrivate": (v50/*: any*/),
        "node.innerSource.repository.name": (v45/*: any*/),
        "node.innerSource.repository.owner": (v55/*: any*/),
        "node.innerSource.repository.owner.__typename": (v45/*: any*/),
        "node.innerSource.repository.owner.id": (v48/*: any*/),
        "node.innerSource.repository.owner.login": (v45/*: any*/),
        "node.innerSource.state": (v60/*: any*/),
        "node.innerSource.stateReason": (v61/*: any*/),
        "node.innerSource.url": (v47/*: any*/),
        "node.isHidden": (v50/*: any*/),
        "node.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "node.issue.author": (v46/*: any*/),
        "node.issue.author.__typename": (v45/*: any*/),
        "node.issue.author.id": (v48/*: any*/),
        "node.issue.author.login": (v45/*: any*/),
        "node.issue.id": (v48/*: any*/),
        "node.issue.locked": (v50/*: any*/),
        "node.issue.number": (v53/*: any*/),
        "node.label": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Label"
        },
        "node.label.color": (v45/*: any*/),
        "node.label.description": (v56/*: any*/),
        "node.label.id": (v48/*: any*/),
        "node.label.name": (v45/*: any*/),
        "node.label.nameHTML": (v45/*: any*/),
        "node.label.repository": (v54/*: any*/),
        "node.label.repository.id": (v48/*: any*/),
        "node.label.repository.name": (v45/*: any*/),
        "node.label.repository.owner": (v55/*: any*/),
        "node.label.repository.owner.__typename": (v45/*: any*/),
        "node.label.repository.owner.id": (v48/*: any*/),
        "node.label.repository.owner.login": (v45/*: any*/),
        "node.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "node.lastUserContentEdit.editor": (v46/*: any*/),
        "node.lastUserContentEdit.editor.__typename": (v45/*: any*/),
        "node.lastUserContentEdit.editor.id": (v48/*: any*/),
        "node.lastUserContentEdit.editor.login": (v45/*: any*/),
        "node.lastUserContentEdit.editor.url": (v47/*: any*/),
        "node.lastUserContentEdit.id": (v48/*: any*/),
        "node.lockReason": {
          "enumValues": [
            "OFF_TOPIC",
            "RESOLVED",
            "SPAM",
            "TOO_HEATED"
          ],
          "nullable": true,
          "plural": false,
          "type": "LockReason"
        },
        "node.milestone": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Milestone"
        },
        "node.milestone.id": (v48/*: any*/),
        "node.milestone.url": (v47/*: any*/),
        "node.milestoneTitle": (v45/*: any*/),
        "node.minimizedReason": (v56/*: any*/),
        "node.pendingBlock": (v62/*: any*/),
        "node.pendingMinimizeReason": (v56/*: any*/),
        "node.pendingUnblock": (v62/*: any*/),
        "node.pendingUndo": (v62/*: any*/),
        "node.previousProjectColumnName": (v45/*: any*/),
        "node.previousStatus": (v45/*: any*/),
        "node.previousTitle": (v45/*: any*/),
        "node.project": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Project"
        },
        "node.project.id": (v48/*: any*/),
        "node.project.name": (v45/*: any*/),
        "node.project.title": (v45/*: any*/),
        "node.project.url": (v47/*: any*/),
        "node.projectColumnName": (v45/*: any*/),
        "node.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "node.reactionGroups.content": {
          "enumValues": [
            "CONFUSED",
            "EYES",
            "HEART",
            "HOORAY",
            "LAUGH",
            "ROCKET",
            "THUMBS_DOWN",
            "THUMBS_UP"
          ],
          "nullable": false,
          "plural": false,
          "type": "ReactionContent"
        },
        "node.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "node.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "node.reactionGroups.reactors.nodes.__isNode": (v45/*: any*/),
        "node.reactionGroups.reactors.nodes.__typename": (v45/*: any*/),
        "node.reactionGroups.reactors.nodes.id": (v48/*: any*/),
        "node.reactionGroups.reactors.nodes.login": (v45/*: any*/),
        "node.reactionGroups.reactors.totalCount": (v53/*: any*/),
        "node.reactionGroups.viewerHasReacted": (v50/*: any*/),
        "node.referencedAt": (v49/*: any*/),
        "node.repository": (v54/*: any*/),
        "node.repository.databaseId": (v58/*: any*/),
        "node.repository.id": (v48/*: any*/),
        "node.repository.isPrivate": (v50/*: any*/),
        "node.repository.name": (v45/*: any*/),
        "node.repository.nameWithOwner": (v45/*: any*/),
        "node.repository.owner": (v55/*: any*/),
        "node.repository.owner.__typename": (v45/*: any*/),
        "node.repository.owner.id": (v48/*: any*/),
        "node.repository.owner.login": (v45/*: any*/),
        "node.repository.owner.url": (v47/*: any*/),
        "node.repository.slashCommandsEnabled": (v50/*: any*/),
        "node.stateReason": (v61/*: any*/),
        "node.status": (v45/*: any*/),
        "node.subject": (v59/*: any*/),
        "node.subject.__isNode": (v45/*: any*/),
        "node.subject.__typename": (v45/*: any*/),
        "node.subject.id": (v48/*: any*/),
        "node.subject.isDraft": (v50/*: any*/),
        "node.subject.isInMergeQueue": (v50/*: any*/),
        "node.subject.number": (v53/*: any*/),
        "node.subject.repository": (v54/*: any*/),
        "node.subject.repository.id": (v48/*: any*/),
        "node.subject.repository.name": (v45/*: any*/),
        "node.subject.repository.owner": (v55/*: any*/),
        "node.subject.repository.owner.__typename": (v45/*: any*/),
        "node.subject.repository.owner.id": (v48/*: any*/),
        "node.subject.repository.owner.login": (v45/*: any*/),
        "node.subject.state": (v60/*: any*/),
        "node.subject.title": (v45/*: any*/),
        "node.subject.url": (v47/*: any*/),
        "node.target": (v59/*: any*/),
        "node.target.__isNode": (v45/*: any*/),
        "node.target.__typename": (v45/*: any*/),
        "node.target.id": (v48/*: any*/),
        "node.target.repository": (v54/*: any*/),
        "node.target.repository.id": (v48/*: any*/),
        "node.url": (v47/*: any*/),
        "node.viewerCanBlockFromOrg": (v50/*: any*/),
        "node.viewerCanDelete": (v50/*: any*/),
        "node.viewerCanMinimize": (v50/*: any*/),
        "node.viewerCanReadUserContentEdits": (v50/*: any*/),
        "node.viewerCanReport": (v50/*: any*/),
        "node.viewerCanReportToMaintainer": (v50/*: any*/),
        "node.viewerCanUnblockFromOrg": (v50/*: any*/),
        "node.viewerCanUndo": (v50/*: any*/),
        "node.viewerCanUpdate": (v50/*: any*/),
        "node.viewerDidAuthor": (v50/*: any*/),
        "node.willCloseSubject": (v50/*: any*/),
        "node.willCloseTarget": (v50/*: any*/)
      }
    },
    "name": "IssueEventWrapperQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "403abd409fc508d7693c2d529a5e0f5b";

export default node;
