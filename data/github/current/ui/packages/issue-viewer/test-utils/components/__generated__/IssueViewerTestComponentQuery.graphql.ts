/**
 * @generated SignedSource<<6ec865739b9fc4d692920b3afd24c630>>
 * @relayHash dfa0b6a7bbad4efb222fca4a4a67bcdf
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID dfa0b6a7bbad4efb222fca4a4a67bcdf

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerTestComponentQuery$variables = Record<PropertyKey, never>;
export type IssueViewerTestComponentQuery$data = {
  readonly issue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueViewerIssue">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueViewerViewer">;
  } | null | undefined;
};
export type IssueViewerTestComponentQuery = {
  response: IssueViewerTestComponentQuery$data;
  variables: IssueViewerTestComponentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "mockIssueId1"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-id-viewer"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
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
  "name": "login",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slashCommandsEnabled",
  "storageKey": null
},
v14 = {
  "kind": "Literal",
  "name": "first",
  "value": 10
},
v15 = [
  (v14/*: any*/)
],
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
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
  "name": "number",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stateReason",
  "storageKey": null
},
v22 = [
  (v2/*: any*/),
  (v9/*: any*/),
  (v3/*: any*/)
],
v23 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v22/*: any*/),
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "locked",
  "storageKey": null
},
v27 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v29 = {
  "kind": "Literal",
  "name": "unfurlReferences",
  "value": true
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyVersion",
  "storageKey": null
},
v31 = [
  (v3/*: any*/)
],
v32 = {
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
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "closed",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v35 = {
  "kind": "Literal",
  "name": "visibleEventsOnly",
  "value": true
},
v36 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 15
  },
  (v35/*: any*/)
],
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hasNextPage",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endCursor",
  "storageKey": null
},
v39 = {
  "kind": "InlineFragment",
  "selections": (v31/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v40 = {
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
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pendingBlock",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pendingUnblock",
  "storageKey": null
},
v46 = [
  (v9/*: any*/)
],
v47 = {
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
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v46/*: any*/),
                  "type": "User",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v46/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v46/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v46/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": null
            },
            (v4/*: any*/)
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
v48 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v9/*: any*/),
    (v3/*: any*/),
    (v27/*: any*/),
    (v32/*: any*/)
  ],
  "storageKey": null
},
v49 = [
  (v2/*: any*/),
  (v39/*: any*/)
],
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v51 = [
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
v52 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v8/*: any*/),
    (v11/*: any*/),
    (v23/*: any*/)
  ],
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v23/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v56 = [
  (v42/*: any*/),
  (v48/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Label",
    "kind": "LinkedField",
    "name": "label",
    "plural": false,
    "selections": [
      (v3/*: any*/),
      (v54/*: any*/),
      (v8/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v55/*: any*/)
    ],
    "storageKey": null
  },
  (v12/*: any*/)
],
v57 = [
  (v3/*: any*/),
  (v9/*: any*/)
],
v58 = [
  (v42/*: any*/),
  (v48/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "assignee",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": (v57/*: any*/),
        "type": "User",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v57/*: any*/),
        "type": "Bot",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v57/*: any*/),
        "type": "Mannequin",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v57/*: any*/),
        "type": "Organization",
        "abstractKey": null
      },
      (v39/*: any*/)
    ],
    "storageKey": null
  },
  (v12/*: any*/)
],
v59 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v18/*: any*/),
    (v10/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v27/*: any*/),
    (v32/*: any*/),
    (v9/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "concreteType": "Project",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v8/*: any*/),
    (v10/*: any*/),
    (v3/*: any*/)
  ],
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectColumnName",
  "storageKey": null
},
v63 = [
  (v42/*: any*/),
  (v12/*: any*/),
  (v60/*: any*/)
],
v64 = [
  (v12/*: any*/),
  (v42/*: any*/),
  (v60/*: any*/)
],
v65 = [
  (v12/*: any*/),
  (v42/*: any*/),
  (v60/*: any*/),
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
      (v10/*: any*/),
      (v3/*: any*/)
    ],
    "storageKey": null
  }
],
v66 = [
  (v12/*: any*/),
  (v60/*: any*/),
  (v42/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "subject",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          (v18/*: any*/),
          (v10/*: any*/),
          (v19/*: any*/),
          (v20/*: any*/),
          (v24/*: any*/),
          (v53/*: any*/),
          (v55/*: any*/)
        ],
        "type": "PullRequest",
        "abstractKey": null
      },
      (v39/*: any*/)
    ],
    "storageKey": null
  }
],
v67 = [
  (v10/*: any*/),
  (v19/*: any*/),
  (v3/*: any*/)
],
v68 = [
  (v10/*: any*/),
  (v19/*: any*/)
],
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v70 = {
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
        (v2/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/)
          ],
          "type": "TimelineEvent",
          "abstractKey": "__isTimelineEvent"
        },
        (v39/*: any*/),
        (v40/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v25/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Issue",
              "kind": "LinkedField",
              "name": "issue",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "author",
                  "plural": false,
                  "selections": (v22/*: any*/),
                  "storageKey": null
                },
                (v3/*: any*/),
                (v19/*: any*/),
                (v26/*: any*/)
              ],
              "storageKey": null
            },
            (v3/*: any*/),
            (v28/*: any*/),
            {
              "alias": null,
              "args": [
                (v29/*: any*/)
              ],
              "kind": "ScalarField",
              "name": "bodyHTML",
              "storageKey": "bodyHTML(unfurlReferences:true)"
            },
            (v30/*: any*/),
            (v41/*: any*/),
            (v10/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "authorAssociation",
              "storageKey": null
            },
            (v34/*: any*/),
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
              "concreteType": "Sponsorship",
              "kind": "LinkedField",
              "name": "authorToRepoOwnerSponsorship",
              "plural": false,
              "selections": [
                (v42/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "isActive",
                  "storageKey": null
                },
                (v3/*: any*/)
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
                (v2/*: any*/),
                (v3/*: any*/),
                (v9/*: any*/),
                (v43/*: any*/)
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
                (v3/*: any*/),
                (v8/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "owner",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    (v3/*: any*/),
                    (v9/*: any*/),
                    (v10/*: any*/)
                  ],
                  "storageKey": null
                },
                (v11/*: any*/),
                (v13/*: any*/),
                (v7/*: any*/),
                (v12/*: any*/)
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
                        (v2/*: any*/),
                        (v10/*: any*/),
                        (v9/*: any*/),
                        (v3/*: any*/)
                      ],
                      "storageKey": null
                    },
                    (v3/*: any*/)
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
                (v44/*: any*/),
                (v45/*: any*/)
              ]
            },
            (v47/*: any*/)
          ],
          "type": "IssueComment",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v48/*: any*/),
            (v12/*: any*/),
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
              "selections": (v49/*: any*/),
              "storageKey": null
            },
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
                (v10/*: any*/),
                (v50/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "signature",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "User",
                      "kind": "LinkedField",
                      "name": "signer",
                      "plural": false,
                      "selections": [
                        (v9/*: any*/),
                        (v43/*: any*/),
                        (v3/*: any*/)
                      ],
                      "storageKey": null
                    },
                    (v20/*: any*/),
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
                          "selections": (v51/*: any*/),
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "CertificateAttributes",
                          "kind": "LinkedField",
                          "name": "subject",
                          "plural": false,
                          "selections": (v51/*: any*/),
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
                    (v23/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "defaultBranch",
                      "storageKey": null
                    },
                    (v3/*: any*/)
                  ],
                  "storageKey": null
                },
                (v3/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "ReferencedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v48/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "source",
              "plural": false,
              "selections": (v49/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "willCloseTarget",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "referencedAt",
              "storageKey": null
            },
            (v12/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "target",
              "plural": false,
              "selections": [
                (v2/*: any*/),
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
                      "selections": (v31/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "type": "Issue",
                  "abstractKey": null
                },
                (v39/*: any*/)
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
                (v2/*: any*/),
                {
                  "kind": "TypeDiscriminator",
                  "abstractKey": "__isReferencedSubject"
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v3/*: any*/),
                    {
                      "alias": "issueTitleHTML",
                      "args": null,
                      "kind": "ScalarField",
                      "name": "titleHTML",
                      "storageKey": null
                    },
                    (v10/*: any*/),
                    (v19/*: any*/),
                    (v21/*: any*/),
                    (v52/*: any*/)
                  ],
                  "type": "Issue",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v3/*: any*/),
                    {
                      "alias": "pullTitleHTML",
                      "args": null,
                      "kind": "ScalarField",
                      "name": "titleHTML",
                      "storageKey": null
                    },
                    (v10/*: any*/),
                    (v19/*: any*/),
                    (v20/*: any*/),
                    (v24/*: any*/),
                    (v53/*: any*/),
                    (v52/*: any*/)
                  ],
                  "type": "PullRequest",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "CrossReferencedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v48/*: any*/),
            (v42/*: any*/),
            (v12/*: any*/)
          ],
          "type": "MentionedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v56/*: any*/),
          "type": "LabeledEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v56/*: any*/),
          "type": "UnlabeledEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v58/*: any*/),
          "type": "AssignedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v58/*: any*/),
          "type": "UnassignedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v48/*: any*/),
            (v12/*: any*/),
            (v59/*: any*/)
          ],
          "type": "AddedToProjectV2Event",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v48/*: any*/),
            (v59/*: any*/)
          ],
          "type": "RemovedFromProjectV2Event",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v60/*: any*/),
            (v61/*: any*/),
            (v62/*: any*/),
            (v12/*: any*/)
          ],
          "type": "AddedToProjectEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v12/*: any*/),
            (v60/*: any*/),
            (v61/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "previousProjectColumnName",
              "storageKey": null
            },
            (v62/*: any*/)
          ],
          "type": "MovedColumnsInProjectEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v12/*: any*/),
            (v60/*: any*/),
            (v61/*: any*/),
            (v62/*: any*/)
          ],
          "type": "RemovedFromProjectEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v63/*: any*/),
          "type": "SubscribedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v63/*: any*/),
          "type": "UnsubscribedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v42/*: any*/),
            (v21/*: any*/),
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
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v10/*: any*/),
                    (v18/*: any*/)
                  ],
                  "type": "ProjectV2",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v10/*: any*/),
                    (v19/*: any*/),
                    (v55/*: any*/)
                  ],
                  "type": "PullRequest",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v10/*: any*/),
                    (v50/*: any*/),
                    (v55/*: any*/)
                  ],
                  "type": "Commit",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": null
            },
            (v60/*: any*/)
          ],
          "type": "ClosedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v64/*: any*/),
          "type": "ReopenedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lockReason",
              "storageKey": null
            },
            (v60/*: any*/)
          ],
          "type": "LockedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v64/*: any*/),
          "type": "UnlockedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v64/*: any*/),
          "type": "PinnedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v64/*: any*/),
          "type": "UnpinnedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v42/*: any*/),
            (v60/*: any*/),
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
          "selections": [
            (v12/*: any*/),
            (v42/*: any*/),
            (v60/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "deletedCommentAuthor",
              "plural": false,
              "selections": (v22/*: any*/),
              "storageKey": null
            }
          ],
          "type": "CommentDeletedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "blockDuration",
              "storageKey": null
            },
            (v60/*: any*/),
            {
              "alias": "blockedUser",
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "subject",
              "plural": false,
              "selections": [
                (v9/*: any*/),
                (v3/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "UserBlockedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v65/*: any*/),
          "type": "MilestonedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v65/*: any*/),
          "type": "DemilestonedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v66/*: any*/),
          "type": "ConnectedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v60/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "fromRepository",
              "plural": false,
              "selections": [
                (v7/*: any*/),
                (v10/*: any*/),
                (v3/*: any*/)
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
            (v12/*: any*/),
            (v60/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Project",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v10/*: any*/),
                (v8/*: any*/),
                (v3/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "ConvertedNoteToIssueEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v66/*: any*/),
          "type": "DisconnectedEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v60/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "canonical",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v67/*: any*/),
                  "type": "Issue",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v67/*: any*/),
                  "type": "PullRequest",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": null
            },
            (v12/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "viewerCanUndo",
              "storageKey": null
            },
            (v3/*: any*/),
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
            (v60/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "canonical",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v68/*: any*/),
                  "type": "Issue",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v68/*: any*/),
                  "type": "PullRequest",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": null
            },
            (v12/*: any*/)
          ],
          "type": "UnmarkedAsDuplicateEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v12/*: any*/),
            (v60/*: any*/),
            (v42/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Discussion",
              "kind": "LinkedField",
              "name": "discussion",
              "plural": false,
              "selections": (v67/*: any*/),
              "storageKey": null
            }
          ],
          "type": "ConvertedToDiscussionEvent",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v42/*: any*/),
            (v60/*: any*/),
            (v59/*: any*/),
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
            (v42/*: any*/),
            (v60/*: any*/),
            (v12/*: any*/)
          ],
          "type": "ConvertedFromDraftEvent",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    (v69/*: any*/)
  ],
  "storageKey": null
},
v71 = [
  "visibleEventsOnly"
],
v72 = [
  {
    "kind": "Literal",
    "name": "last",
    "value": 0
  },
  (v35/*: any*/)
],
v73 = [
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
v74 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    (v38/*: any*/),
    (v37/*: any*/)
  ],
  "storageKey": null
},
v75 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v77 = {
  "alias": null,
  "args": (v15/*: any*/),
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
            (v3/*: any*/),
            (v6/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v3/*: any*/),
                (v18/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "template",
                  "storageKey": null
                },
                (v41/*: any*/),
                (v10/*: any*/),
                {
                  "alias": null,
                  "args": (v75/*: any*/),
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "field",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v3/*: any*/),
                        (v8/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ProjectV2SingleSelectFieldOption",
                          "kind": "LinkedField",
                          "name": "options",
                          "plural": true,
                          "selections": [
                            (v3/*: any*/),
                            (v76/*: any*/),
                            (v8/*: any*/),
                            (v54/*: any*/),
                            (v16/*: any*/),
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "descriptionHTML",
                              "storageKey": null
                            },
                            (v17/*: any*/)
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    },
                    (v39/*: any*/)
                  ],
                  "storageKey": "field(name:\"Status\")"
                },
                (v33/*: any*/),
                (v19/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": (v75/*: any*/),
              "concreteType": null,
              "kind": "LinkedField",
              "name": "fieldValueByName",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v3/*: any*/),
                    (v76/*: any*/),
                    (v8/*: any*/),
                    (v54/*: any*/),
                    (v16/*: any*/)
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                (v39/*: any*/)
              ],
              "storageKey": "fieldValueByName(name:\"Status\")"
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        },
        (v69/*: any*/)
      ],
      "storageKey": null
    },
    (v74/*: any*/)
  ],
  "storageKey": "projectItemsNext(first:10)"
},
v78 = {
  "alias": null,
  "args": (v15/*: any*/),
  "filters": [
    "allowedOwner"
  ],
  "handle": "connection",
  "key": "ProjectSection_projectItemsNext",
  "kind": "LinkedHandle",
  "name": "projectItemsNext"
},
v79 = [
  (v3/*: any*/),
  (v8/*: any*/)
],
v80 = {
  "alias": null,
  "args": (v15/*: any*/),
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
            (v3/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Project",
              "kind": "LinkedField",
              "name": "project",
              "plural": false,
              "selections": [
                (v8/*: any*/),
                (v10/*: any*/),
                (v3/*: any*/),
                {
                  "alias": null,
                  "args": (v15/*: any*/),
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
                      "selections": (v79/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": "columns(first:10)"
                },
                (v33/*: any*/),
                {
                  "alias": "title",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                (v19/*: any*/),
                (v41/*: any*/),
                (v2/*: any*/)
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
              "selections": (v79/*: any*/),
              "storageKey": null
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        },
        (v69/*: any*/)
      ],
      "storageKey": null
    },
    (v74/*: any*/)
  ],
  "storageKey": "projectCards(first:10)"
},
v81 = {
  "alias": null,
  "args": (v15/*: any*/),
  "filters": null,
  "handle": "connection",
  "key": "ProjectSection_projectCards",
  "kind": "LinkedHandle",
  "name": "projectCards"
},
v82 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Node"
},
v83 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v84 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v85 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v86 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v87 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v88 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v89 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v90 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v91 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "IssueTimelineItemsConnection"
},
v92 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "IssueTimelineItemsEdge"
},
v93 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "IssueTimelineItems"
},
v94 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Assignee"
},
v95 = {
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
v96 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Sponsorship"
},
v97 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v98 = {
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
v99 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v100 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "IssueOrPullRequest"
},
v101 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v102 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Closer"
},
v103 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v104 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v105 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Commit"
},
v106 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "GitSignature"
},
v107 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "CertificateAttributes"
},
v108 = {
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
v109 = {
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
v110 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Discussion"
},
v111 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Repository"
},
v112 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReferencedSubject"
},
v113 = {
  "enumValues": [
    "CLOSED",
    "MERGED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestState"
},
v114 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v115 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Issue"
},
v116 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Label"
},
v117 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v118 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserContentEdit"
},
v119 = {
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
v120 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Milestone"
},
v121 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
},
v122 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ProjectV2"
},
v123 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "ReactionGroup"
},
v124 = {
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
v125 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReactorConnection"
},
v126 = {
  "enumValues": null,
  "nullable": true,
  "plural": true,
  "type": "Reactor"
},
v127 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PageInfo"
},
v128 = [
  "BLUE",
  "GRAY",
  "GREEN",
  "ORANGE",
  "PINK",
  "PURPLE",
  "RED",
  "YELLOW"
],
v129 = {
  "enumValues": (v128/*: any*/),
  "nullable": false,
  "plural": false,
  "type": "IssueTypeColor"
},
v130 = {
  "enumValues": (v128/*: any*/),
  "nullable": false,
  "plural": false,
  "type": "ProjectV2SingleSelectFieldOptionColor"
},
v131 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "IssueConnection"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueViewerTestComponentQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueViewerIssue"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"mockIssueId1\")"
      },
      {
        "alias": "viewer",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueViewerViewer"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id-viewer\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueViewerTestComponentQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "updatedAt",
                "storageKey": null
              },
              {
                "alias": "subIssuesConnection",
                "args": null,
                "concreteType": "IssueConnection",
                "kind": "LinkedField",
                "name": "subIssues",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateMetadata",
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
                  (v6/*: any*/),
                  (v3/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v9/*: any*/),
                      (v3/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanInteract",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerInteractionLimitReasonHTML",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RepositoryPlanFeatures",
                    "kind": "LinkedField",
                    "name": "planFeatures",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "maximumAssignees",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v15/*: any*/),
                    "concreteType": "IssueTypeConnection",
                    "kind": "LinkedField",
                    "name": "issueTypes",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "IssueType",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": [
                          (v3/*: any*/),
                          (v8/*: any*/),
                          (v16/*: any*/),
                          (v17/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isEnabled",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": "issueTypes(first:10)"
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 3
                      }
                    ],
                    "concreteType": "PinnedIssueConnection",
                    "kind": "LinkedField",
                    "name": "pinnedIssues",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": "pinnedIssues(first:3)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanPinIssues",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v18/*: any*/),
              (v19/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "titleHTML",
                "storageKey": null
              },
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdateNext",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueType",
                "kind": "LinkedField",
                "name": "issueType",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v16/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v20/*: any*/),
              (v21/*: any*/),
              {
                "alias": "linkedPullRequests",
                "args": [
                  (v14/*: any*/),
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
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Repository",
                        "kind": "LinkedField",
                        "name": "repository",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          (v3/*: any*/),
                          (v8/*: any*/),
                          (v23/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v20/*: any*/),
                      (v24/*: any*/),
                      (v10/*: any*/),
                      (v19/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:false,orderByState:true)"
              },
              {
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
              (v12/*: any*/),
              (v25/*: any*/),
              (v26/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v27/*: any*/),
                  (v9/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v28/*: any*/),
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "renderTasklistBlocks",
                    "value": true
                  },
                  (v29/*: any*/)
                ],
                "kind": "ScalarField",
                "name": "bodyHTML",
                "storageKey": "bodyHTML(renderTasklistBlocks:true,unfurlReferences:true)"
              },
              (v30/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Issue",
                "kind": "LinkedField",
                "name": "parent",
                "plural": false,
                "selections": (v31/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanComment",
                "storageKey": null
              },
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
                      (v3/*: any*/),
                      (v9/*: any*/),
                      (v8/*: any*/),
                      (v32/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "assignees(first:20)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanAssign",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanLabel",
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
                  (v3/*: any*/),
                  (v18/*: any*/),
                  (v33/*: any*/),
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
                  (v10/*: any*/),
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanSetMilestone",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isPinned",
                "storageKey": null
              },
              (v34/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanTransfer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanConvertToDiscussion",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanType",
                "storageKey": null
              },
              {
                "alias": "frontTimeline",
                "args": (v36/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      (v37/*: any*/),
                      (v38/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v70/*: any*/),
                  (v40/*: any*/)
                ],
                "storageKey": "timelineItems(first:15,visibleEventsOnly:true)"
              },
              {
                "alias": "frontTimeline",
                "args": (v36/*: any*/),
                "filters": (v71/*: any*/),
                "handle": "connection",
                "key": "Issue_frontTimeline",
                "kind": "LinkedHandle",
                "name": "timelineItems"
              },
              {
                "alias": null,
                "args": (v72/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  {
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
                        "name": "hasPreviousPage",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startCursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v70/*: any*/),
                  (v40/*: any*/)
                ],
                "storageKey": "timelineItems(last:0,visibleEventsOnly:true)"
              },
              {
                "alias": null,
                "args": (v72/*: any*/),
                "filters": (v71/*: any*/),
                "handle": "connection",
                "key": "IssueBacksideTimeline_timelineItems",
                "kind": "LinkedHandle",
                "name": "timelineItems"
              },
              {
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
                      (v33/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "subIssues(first:50)"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v42/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": [
                      (v43/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "profileUrl",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              (v47/*: any*/),
              {
                "kind": "ClientExtension",
                "selections": [
                  (v44/*: any*/),
                  (v45/*: any*/)
                ]
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": (v73/*: any*/),
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
                              (v3/*: any*/),
                              (v16/*: any*/),
                              (v8/*: any*/),
                              (v54/*: any*/),
                              (v17/*: any*/),
                              (v10/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v69/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v74/*: any*/)
                    ],
                    "storageKey": "labels(first:100,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
                  },
                  {
                    "alias": null,
                    "args": (v73/*: any*/),
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
                      (v77/*: any*/),
                      (v78/*: any*/),
                      (v80/*: any*/),
                      (v81/*: any*/)
                    ],
                    "type": "Issue",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v77/*: any*/),
                      (v78/*: any*/),
                      (v80/*: any*/),
                      (v81/*: any*/),
                      (v41/*: any*/)
                    ],
                    "type": "PullRequest",
                    "abstractKey": null
                  }
                ],
                "type": "IssueOrPullRequest",
                "abstractKey": "__isIssueOrPullRequest"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"mockIssueId1\")"
      },
      {
        "alias": "viewer",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "enterpriseManagedEnterpriseId",
                "storageKey": null
              },
              (v9/*: any*/),
              (v32/*: any*/),
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isEmployee",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"test-id-viewer\")"
      }
    ]
  },
  "params": {
    "id": "dfa0b6a7bbad4efb222fca4a4a67bcdf",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "issue": (v82/*: any*/),
        "issue.__isComment": (v83/*: any*/),
        "issue.__isIssueOrPullRequest": (v83/*: any*/),
        "issue.__isLabelable": (v83/*: any*/),
        "issue.__isNode": (v83/*: any*/),
        "issue.__isReactable": (v83/*: any*/),
        "issue.__typename": (v83/*: any*/),
        "issue.assignees": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserConnection"
        },
        "issue.assignees.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "User"
        },
        "issue.assignees.nodes.avatarUrl": (v84/*: any*/),
        "issue.assignees.nodes.id": (v85/*: any*/),
        "issue.assignees.nodes.login": (v83/*: any*/),
        "issue.assignees.nodes.name": (v86/*: any*/),
        "issue.author": (v87/*: any*/),
        "issue.author.__isActor": (v83/*: any*/),
        "issue.author.__typename": (v83/*: any*/),
        "issue.author.avatarUrl": (v84/*: any*/),
        "issue.author.id": (v85/*: any*/),
        "issue.author.login": (v83/*: any*/),
        "issue.author.profileUrl": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "issue.body": (v83/*: any*/),
        "issue.bodyHTML": (v88/*: any*/),
        "issue.bodyVersion": (v83/*: any*/),
        "issue.createdAt": (v89/*: any*/),
        "issue.databaseId": (v90/*: any*/),
        "issue.frontTimeline": (v91/*: any*/),
        "issue.frontTimeline.__id": (v85/*: any*/),
        "issue.frontTimeline.edges": (v92/*: any*/),
        "issue.frontTimeline.edges.cursor": (v83/*: any*/),
        "issue.frontTimeline.edges.node": (v93/*: any*/),
        "issue.frontTimeline.edges.node.__id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.__isComment": (v83/*: any*/),
        "issue.frontTimeline.edges.node.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.__isReactable": (v83/*: any*/),
        "issue.frontTimeline.edges.node.__isTimelineEvent": (v83/*: any*/),
        "issue.frontTimeline.edges.node.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.actor": (v87/*: any*/),
        "issue.frontTimeline.edges.node.actor.__isActor": (v83/*: any*/),
        "issue.frontTimeline.edges.node.actor.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.actor.avatarUrl": (v84/*: any*/),
        "issue.frontTimeline.edges.node.actor.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.actor.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.assignee": (v94/*: any*/),
        "issue.frontTimeline.edges.node.assignee.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.assignee.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.assignee.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.assignee.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.author": (v87/*: any*/),
        "issue.frontTimeline.edges.node.author.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.author.avatarUrl": (v84/*: any*/),
        "issue.frontTimeline.edges.node.author.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.author.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.authorAssociation": (v95/*: any*/),
        "issue.frontTimeline.edges.node.authorToRepoOwnerSponsorship": (v96/*: any*/),
        "issue.frontTimeline.edges.node.authorToRepoOwnerSponsorship.createdAt": (v89/*: any*/),
        "issue.frontTimeline.edges.node.authorToRepoOwnerSponsorship.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.authorToRepoOwnerSponsorship.isActive": (v97/*: any*/),
        "issue.frontTimeline.edges.node.blockDuration": (v98/*: any*/),
        "issue.frontTimeline.edges.node.blockedUser": (v99/*: any*/),
        "issue.frontTimeline.edges.node.blockedUser.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.blockedUser.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.body": (v83/*: any*/),
        "issue.frontTimeline.edges.node.bodyHTML": (v88/*: any*/),
        "issue.frontTimeline.edges.node.bodyVersion": (v83/*: any*/),
        "issue.frontTimeline.edges.node.canonical": (v100/*: any*/),
        "issue.frontTimeline.edges.node.canonical.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.canonical.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.canonical.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.canonical.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.canonical.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.closer": (v102/*: any*/),
        "issue.frontTimeline.edges.node.closer.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.abbreviatedOid": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.closer.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.closer.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.title": (v83/*: any*/),
        "issue.frontTimeline.edges.node.closer.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.closingProjectItemStatus": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit": (v105/*: any*/),
        "issue.frontTimeline.edges.node.commit.abbreviatedOid": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.hasSignature": (v97/*: any*/),
        "issue.frontTimeline.edges.node.commit.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.commit.message": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.messageBodyHTML": (v88/*: any*/),
        "issue.frontTimeline.edges.node.commit.messageHeadlineHTML": (v88/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.defaultBranch": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.commit.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature": (v106/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.issuer": (v107/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.issuer.commonName": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.issuer.emailAddress": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.issuer.organization": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.issuer.organizationUnit": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.keyFingerprint": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.keyId": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.signer": (v99/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.signer.avatarUrl": (v84/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.signer.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.signer.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.state": (v108/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.subject": (v107/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.subject.commonName": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.subject.emailAddress": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.subject.organization": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.subject.organizationUnit": (v86/*: any*/),
        "issue.frontTimeline.edges.node.commit.signature.wasSignedByGitHub": (v97/*: any*/),
        "issue.frontTimeline.edges.node.commit.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.commit.verificationStatus": (v109/*: any*/),
        "issue.frontTimeline.edges.node.createdAt": (v89/*: any*/),
        "issue.frontTimeline.edges.node.createdViaEmail": (v97/*: any*/),
        "issue.frontTimeline.edges.node.currentTitle": (v83/*: any*/),
        "issue.frontTimeline.edges.node.databaseId": (v90/*: any*/),
        "issue.frontTimeline.edges.node.deletedCommentAuthor": (v87/*: any*/),
        "issue.frontTimeline.edges.node.deletedCommentAuthor.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.deletedCommentAuthor.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.deletedCommentAuthor.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.discussion": (v110/*: any*/),
        "issue.frontTimeline.edges.node.discussion.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.discussion.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.discussion.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.fromRepository": (v111/*: any*/),
        "issue.frontTimeline.edges.node.fromRepository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.fromRepository.nameWithOwner": (v83/*: any*/),
        "issue.frontTimeline.edges.node.fromRepository.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.innerSource": (v112/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.__isReferencedSubject": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.isDraft": (v97/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.isInMergeQueue": (v97/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.issueTitleHTML": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.pullTitleHTML": (v88/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.isPrivate": (v97/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.state": (v113/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.stateReason": (v114/*: any*/),
        "issue.frontTimeline.edges.node.innerSource.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.isHidden": (v97/*: any*/),
        "issue.frontTimeline.edges.node.issue": (v115/*: any*/),
        "issue.frontTimeline.edges.node.issue.author": (v87/*: any*/),
        "issue.frontTimeline.edges.node.issue.author.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.issue.author.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.issue.author.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.issue.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.issue.locked": (v97/*: any*/),
        "issue.frontTimeline.edges.node.issue.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.label": (v116/*: any*/),
        "issue.frontTimeline.edges.node.label.color": (v83/*: any*/),
        "issue.frontTimeline.edges.node.label.description": (v86/*: any*/),
        "issue.frontTimeline.edges.node.label.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.label.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.label.nameHTML": (v83/*: any*/),
        "issue.frontTimeline.edges.node.label.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.label.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.lastEditedAt": (v117/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit": (v118/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.editor": (v87/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.editor.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.editor.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.editor.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.editor.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.lastUserContentEdit.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.lockReason": (v119/*: any*/),
        "issue.frontTimeline.edges.node.milestone": (v120/*: any*/),
        "issue.frontTimeline.edges.node.milestone.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.milestone.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.milestoneTitle": (v83/*: any*/),
        "issue.frontTimeline.edges.node.minimizedReason": (v86/*: any*/),
        "issue.frontTimeline.edges.node.pendingBlock": (v121/*: any*/),
        "issue.frontTimeline.edges.node.pendingMinimizeReason": (v86/*: any*/),
        "issue.frontTimeline.edges.node.pendingUnblock": (v121/*: any*/),
        "issue.frontTimeline.edges.node.pendingUndo": (v121/*: any*/),
        "issue.frontTimeline.edges.node.previousProjectColumnName": (v83/*: any*/),
        "issue.frontTimeline.edges.node.previousStatus": (v83/*: any*/),
        "issue.frontTimeline.edges.node.previousTitle": (v83/*: any*/),
        "issue.frontTimeline.edges.node.project": (v122/*: any*/),
        "issue.frontTimeline.edges.node.project.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.project.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.project.title": (v83/*: any*/),
        "issue.frontTimeline.edges.node.project.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.projectColumnName": (v83/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups": (v123/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.content": (v124/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors": (v125/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.nodes": (v126/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.nodes.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.nodes.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.nodes.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.nodes.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.reactors.totalCount": (v101/*: any*/),
        "issue.frontTimeline.edges.node.reactionGroups.viewerHasReacted": (v97/*: any*/),
        "issue.frontTimeline.edges.node.referencedAt": (v89/*: any*/),
        "issue.frontTimeline.edges.node.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.repository.databaseId": (v90/*: any*/),
        "issue.frontTimeline.edges.node.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.repository.isPrivate": (v97/*: any*/),
        "issue.frontTimeline.edges.node.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.repository.nameWithOwner": (v83/*: any*/),
        "issue.frontTimeline.edges.node.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.repository.owner.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.repository.slashCommandsEnabled": (v97/*: any*/),
        "issue.frontTimeline.edges.node.source": (v112/*: any*/),
        "issue.frontTimeline.edges.node.source.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.source.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.source.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.stateReason": (v114/*: any*/),
        "issue.frontTimeline.edges.node.status": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject": (v112/*: any*/),
        "issue.frontTimeline.edges.node.subject.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.subject.isDraft": (v97/*: any*/),
        "issue.frontTimeline.edges.node.subject.isInMergeQueue": (v97/*: any*/),
        "issue.frontTimeline.edges.node.subject.number": (v101/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.name": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.owner": (v104/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.owner.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.owner.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.subject.repository.owner.login": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.state": (v113/*: any*/),
        "issue.frontTimeline.edges.node.subject.title": (v83/*: any*/),
        "issue.frontTimeline.edges.node.subject.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.target": (v112/*: any*/),
        "issue.frontTimeline.edges.node.target.__isNode": (v83/*: any*/),
        "issue.frontTimeline.edges.node.target.__typename": (v83/*: any*/),
        "issue.frontTimeline.edges.node.target.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.target.repository": (v103/*: any*/),
        "issue.frontTimeline.edges.node.target.repository.id": (v85/*: any*/),
        "issue.frontTimeline.edges.node.url": (v84/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanBlockFromOrg": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanDelete": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanMinimize": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanReadUserContentEdits": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanReport": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanReportToMaintainer": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanUnblockFromOrg": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanUndo": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerCanUpdate": (v97/*: any*/),
        "issue.frontTimeline.edges.node.viewerDidAuthor": (v97/*: any*/),
        "issue.frontTimeline.edges.node.willCloseSubject": (v97/*: any*/),
        "issue.frontTimeline.edges.node.willCloseTarget": (v97/*: any*/),
        "issue.frontTimeline.pageInfo": (v127/*: any*/),
        "issue.frontTimeline.pageInfo.endCursor": (v86/*: any*/),
        "issue.frontTimeline.pageInfo.hasNextPage": (v97/*: any*/),
        "issue.frontTimeline.totalCount": (v101/*: any*/),
        "issue.id": (v85/*: any*/),
        "issue.isPinned": (v121/*: any*/),
        "issue.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "issue.issueType.color": (v129/*: any*/),
        "issue.issueType.id": (v85/*: any*/),
        "issue.issueType.name": (v83/*: any*/),
        "issue.labels": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "LabelConnection"
        },
        "issue.labels.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "LabelEdge"
        },
        "issue.labels.edges.cursor": (v83/*: any*/),
        "issue.labels.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Label"
        },
        "issue.labels.edges.node.__typename": (v83/*: any*/),
        "issue.labels.edges.node.color": (v83/*: any*/),
        "issue.labels.edges.node.description": (v86/*: any*/),
        "issue.labels.edges.node.id": (v85/*: any*/),
        "issue.labels.edges.node.name": (v83/*: any*/),
        "issue.labels.edges.node.nameHTML": (v83/*: any*/),
        "issue.labels.edges.node.url": (v84/*: any*/),
        "issue.labels.pageInfo": (v127/*: any*/),
        "issue.labels.pageInfo.endCursor": (v86/*: any*/),
        "issue.labels.pageInfo.hasNextPage": (v97/*: any*/),
        "issue.linkedPullRequests": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestConnection"
        },
        "issue.linkedPullRequests.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequest"
        },
        "issue.linkedPullRequests.nodes.id": (v85/*: any*/),
        "issue.linkedPullRequests.nodes.isDraft": (v97/*: any*/),
        "issue.linkedPullRequests.nodes.number": (v101/*: any*/),
        "issue.linkedPullRequests.nodes.repository": (v103/*: any*/),
        "issue.linkedPullRequests.nodes.repository.id": (v85/*: any*/),
        "issue.linkedPullRequests.nodes.repository.name": (v83/*: any*/),
        "issue.linkedPullRequests.nodes.repository.nameWithOwner": (v83/*: any*/),
        "issue.linkedPullRequests.nodes.repository.owner": (v104/*: any*/),
        "issue.linkedPullRequests.nodes.repository.owner.__typename": (v83/*: any*/),
        "issue.linkedPullRequests.nodes.repository.owner.id": (v85/*: any*/),
        "issue.linkedPullRequests.nodes.repository.owner.login": (v83/*: any*/),
        "issue.linkedPullRequests.nodes.state": (v113/*: any*/),
        "issue.linkedPullRequests.nodes.url": (v84/*: any*/),
        "issue.locked": (v97/*: any*/),
        "issue.milestone": (v120/*: any*/),
        "issue.milestone.closed": (v97/*: any*/),
        "issue.milestone.closedAt": (v117/*: any*/),
        "issue.milestone.dueOn": (v117/*: any*/),
        "issue.milestone.id": (v85/*: any*/),
        "issue.milestone.progressPercentage": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Float"
        },
        "issue.milestone.title": (v83/*: any*/),
        "issue.milestone.url": (v84/*: any*/),
        "issue.number": (v101/*: any*/),
        "issue.parent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "issue.parent.id": (v85/*: any*/),
        "issue.pendingBlock": (v121/*: any*/),
        "issue.pendingUnblock": (v121/*: any*/),
        "issue.projectCards": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectCardConnection"
        },
        "issue.projectCards.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectCardEdge"
        },
        "issue.projectCards.edges.cursor": (v83/*: any*/),
        "issue.projectCards.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectCard"
        },
        "issue.projectCards.edges.node.__typename": (v83/*: any*/),
        "issue.projectCards.edges.node.column": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "issue.projectCards.edges.node.column.id": (v85/*: any*/),
        "issue.projectCards.edges.node.column.name": (v83/*: any*/),
        "issue.projectCards.edges.node.id": (v85/*: any*/),
        "issue.projectCards.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "issue.projectCards.edges.node.project.__typename": (v83/*: any*/),
        "issue.projectCards.edges.node.project.closed": (v97/*: any*/),
        "issue.projectCards.edges.node.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "issue.projectCards.edges.node.project.columns.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumn"
        },
        "issue.projectCards.edges.node.project.columns.nodes.id": (v85/*: any*/),
        "issue.projectCards.edges.node.project.columns.nodes.name": (v83/*: any*/),
        "issue.projectCards.edges.node.project.id": (v85/*: any*/),
        "issue.projectCards.edges.node.project.name": (v83/*: any*/),
        "issue.projectCards.edges.node.project.number": (v101/*: any*/),
        "issue.projectCards.edges.node.project.title": (v83/*: any*/),
        "issue.projectCards.edges.node.project.url": (v84/*: any*/),
        "issue.projectCards.edges.node.project.viewerCanUpdate": (v97/*: any*/),
        "issue.projectCards.pageInfo": (v127/*: any*/),
        "issue.projectCards.pageInfo.endCursor": (v86/*: any*/),
        "issue.projectCards.pageInfo.hasNextPage": (v97/*: any*/),
        "issue.projectItemsNext": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemConnection"
        },
        "issue.projectItemsNext.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectV2ItemEdge"
        },
        "issue.projectItemsNext.edges.cursor": (v83/*: any*/),
        "issue.projectItemsNext.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2Item"
        },
        "issue.projectItemsNext.edges.node.__typename": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "issue.projectItemsNext.edges.node.fieldValueByName.__isNode": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.__typename": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.color": (v130/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.id": (v85/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.name": (v86/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.nameHTML": (v86/*: any*/),
        "issue.projectItemsNext.edges.node.fieldValueByName.optionId": (v86/*: any*/),
        "issue.projectItemsNext.edges.node.id": (v85/*: any*/),
        "issue.projectItemsNext.edges.node.isArchived": (v97/*: any*/),
        "issue.projectItemsNext.edges.node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "issue.projectItemsNext.edges.node.project.__typename": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.closed": (v97/*: any*/),
        "issue.projectItemsNext.edges.node.project.field": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "issue.projectItemsNext.edges.node.project.field.__isNode": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.__typename": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.id": (v85/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.name": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "issue.projectItemsNext.edges.node.project.field.options.color": (v130/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.description": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.descriptionHTML": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.id": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.name": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.nameHTML": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.field.options.optionId": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.id": (v85/*: any*/),
        "issue.projectItemsNext.edges.node.project.number": (v101/*: any*/),
        "issue.projectItemsNext.edges.node.project.template": (v97/*: any*/),
        "issue.projectItemsNext.edges.node.project.title": (v83/*: any*/),
        "issue.projectItemsNext.edges.node.project.url": (v84/*: any*/),
        "issue.projectItemsNext.edges.node.project.viewerCanUpdate": (v97/*: any*/),
        "issue.projectItemsNext.pageInfo": (v127/*: any*/),
        "issue.projectItemsNext.pageInfo.endCursor": (v86/*: any*/),
        "issue.projectItemsNext.pageInfo.hasNextPage": (v97/*: any*/),
        "issue.reactionGroups": (v123/*: any*/),
        "issue.reactionGroups.content": (v124/*: any*/),
        "issue.reactionGroups.reactors": (v125/*: any*/),
        "issue.reactionGroups.reactors.nodes": (v126/*: any*/),
        "issue.reactionGroups.reactors.nodes.__isNode": (v83/*: any*/),
        "issue.reactionGroups.reactors.nodes.__typename": (v83/*: any*/),
        "issue.reactionGroups.reactors.nodes.id": (v85/*: any*/),
        "issue.reactionGroups.reactors.nodes.login": (v83/*: any*/),
        "issue.reactionGroups.reactors.totalCount": (v101/*: any*/),
        "issue.reactionGroups.viewerHasReacted": (v97/*: any*/),
        "issue.repository": (v103/*: any*/),
        "issue.repository.databaseId": (v90/*: any*/),
        "issue.repository.id": (v85/*: any*/),
        "issue.repository.isArchived": (v97/*: any*/),
        "issue.repository.isPrivate": (v97/*: any*/),
        "issue.repository.issueTypes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueTypeConnection"
        },
        "issue.repository.issueTypes.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueType"
        },
        "issue.repository.issueTypes.nodes.color": (v129/*: any*/),
        "issue.repository.issueTypes.nodes.description": (v86/*: any*/),
        "issue.repository.issueTypes.nodes.id": (v85/*: any*/),
        "issue.repository.issueTypes.nodes.isEnabled": (v97/*: any*/),
        "issue.repository.issueTypes.nodes.name": (v83/*: any*/),
        "issue.repository.issueTypes.totalCount": (v101/*: any*/),
        "issue.repository.name": (v83/*: any*/),
        "issue.repository.nameWithOwner": (v83/*: any*/),
        "issue.repository.owner": (v104/*: any*/),
        "issue.repository.owner.__typename": (v83/*: any*/),
        "issue.repository.owner.id": (v85/*: any*/),
        "issue.repository.owner.login": (v83/*: any*/),
        "issue.repository.owner.url": (v84/*: any*/),
        "issue.repository.pinnedIssues": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PinnedIssueConnection"
        },
        "issue.repository.pinnedIssues.totalCount": (v101/*: any*/),
        "issue.repository.planFeatures": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryPlanFeatures"
        },
        "issue.repository.planFeatures.maximumAssignees": (v101/*: any*/),
        "issue.repository.slashCommandsEnabled": (v97/*: any*/),
        "issue.repository.viewerCanInteract": (v97/*: any*/),
        "issue.repository.viewerCanPinIssues": (v97/*: any*/),
        "issue.repository.viewerInteractionLimitReasonHTML": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "HTML"
        },
        "issue.state": {
          "enumValues": [
            "CLOSED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueState"
        },
        "issue.stateReason": (v114/*: any*/),
        "issue.subIssues": (v131/*: any*/),
        "issue.subIssues.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Issue"
        },
        "issue.subIssues.nodes.closed": (v97/*: any*/),
        "issue.subIssues.nodes.id": (v85/*: any*/),
        "issue.subIssuesConnection": (v131/*: any*/),
        "issue.subIssuesConnection.totalCount": (v101/*: any*/),
        "issue.subIssuesSummary": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "SubIssuesSummary"
        },
        "issue.subIssuesSummary.completed": (v101/*: any*/),
        "issue.timelineItems": (v91/*: any*/),
        "issue.timelineItems.__id": (v85/*: any*/),
        "issue.timelineItems.edges": (v92/*: any*/),
        "issue.timelineItems.edges.cursor": (v83/*: any*/),
        "issue.timelineItems.edges.node": (v93/*: any*/),
        "issue.timelineItems.edges.node.__id": (v85/*: any*/),
        "issue.timelineItems.edges.node.__isComment": (v83/*: any*/),
        "issue.timelineItems.edges.node.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.__isReactable": (v83/*: any*/),
        "issue.timelineItems.edges.node.__isTimelineEvent": (v83/*: any*/),
        "issue.timelineItems.edges.node.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.actor": (v87/*: any*/),
        "issue.timelineItems.edges.node.actor.__isActor": (v83/*: any*/),
        "issue.timelineItems.edges.node.actor.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.actor.avatarUrl": (v84/*: any*/),
        "issue.timelineItems.edges.node.actor.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.actor.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.assignee": (v94/*: any*/),
        "issue.timelineItems.edges.node.assignee.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.assignee.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.assignee.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.assignee.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.author": (v87/*: any*/),
        "issue.timelineItems.edges.node.author.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.author.avatarUrl": (v84/*: any*/),
        "issue.timelineItems.edges.node.author.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.author.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.authorAssociation": (v95/*: any*/),
        "issue.timelineItems.edges.node.authorToRepoOwnerSponsorship": (v96/*: any*/),
        "issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.createdAt": (v89/*: any*/),
        "issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.isActive": (v97/*: any*/),
        "issue.timelineItems.edges.node.blockDuration": (v98/*: any*/),
        "issue.timelineItems.edges.node.blockedUser": (v99/*: any*/),
        "issue.timelineItems.edges.node.blockedUser.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.blockedUser.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.body": (v83/*: any*/),
        "issue.timelineItems.edges.node.bodyHTML": (v88/*: any*/),
        "issue.timelineItems.edges.node.bodyVersion": (v83/*: any*/),
        "issue.timelineItems.edges.node.canonical": (v100/*: any*/),
        "issue.timelineItems.edges.node.canonical.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.canonical.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.canonical.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.canonical.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.canonical.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.closer": (v102/*: any*/),
        "issue.timelineItems.edges.node.closer.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.abbreviatedOid": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.closer.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.closer.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.closer.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.title": (v83/*: any*/),
        "issue.timelineItems.edges.node.closer.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.closingProjectItemStatus": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit": (v105/*: any*/),
        "issue.timelineItems.edges.node.commit.abbreviatedOid": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.hasSignature": (v97/*: any*/),
        "issue.timelineItems.edges.node.commit.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.commit.message": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.messageBodyHTML": (v88/*: any*/),
        "issue.timelineItems.edges.node.commit.messageHeadlineHTML": (v88/*: any*/),
        "issue.timelineItems.edges.node.commit.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.defaultBranch": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.commit.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.signature": (v106/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.issuer": (v107/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.issuer.commonName": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.issuer.emailAddress": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.issuer.organization": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.issuer.organizationUnit": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.keyFingerprint": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.keyId": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.signer": (v99/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.signer.avatarUrl": (v84/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.signer.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.signer.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.state": (v108/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.subject": (v107/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.subject.commonName": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.subject.emailAddress": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.subject.organization": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.subject.organizationUnit": (v86/*: any*/),
        "issue.timelineItems.edges.node.commit.signature.wasSignedByGitHub": (v97/*: any*/),
        "issue.timelineItems.edges.node.commit.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.commit.verificationStatus": (v109/*: any*/),
        "issue.timelineItems.edges.node.createdAt": (v89/*: any*/),
        "issue.timelineItems.edges.node.createdViaEmail": (v97/*: any*/),
        "issue.timelineItems.edges.node.currentTitle": (v83/*: any*/),
        "issue.timelineItems.edges.node.databaseId": (v90/*: any*/),
        "issue.timelineItems.edges.node.deletedCommentAuthor": (v87/*: any*/),
        "issue.timelineItems.edges.node.deletedCommentAuthor.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.deletedCommentAuthor.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.deletedCommentAuthor.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.discussion": (v110/*: any*/),
        "issue.timelineItems.edges.node.discussion.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.discussion.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.discussion.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.fromRepository": (v111/*: any*/),
        "issue.timelineItems.edges.node.fromRepository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.fromRepository.nameWithOwner": (v83/*: any*/),
        "issue.timelineItems.edges.node.fromRepository.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.innerSource": (v112/*: any*/),
        "issue.timelineItems.edges.node.innerSource.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.__isReferencedSubject": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.innerSource.isDraft": (v97/*: any*/),
        "issue.timelineItems.edges.node.innerSource.isInMergeQueue": (v97/*: any*/),
        "issue.timelineItems.edges.node.innerSource.issueTitleHTML": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.innerSource.pullTitleHTML": (v88/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.isPrivate": (v97/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.innerSource.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.innerSource.state": (v113/*: any*/),
        "issue.timelineItems.edges.node.innerSource.stateReason": (v114/*: any*/),
        "issue.timelineItems.edges.node.innerSource.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.isHidden": (v97/*: any*/),
        "issue.timelineItems.edges.node.issue": (v115/*: any*/),
        "issue.timelineItems.edges.node.issue.author": (v87/*: any*/),
        "issue.timelineItems.edges.node.issue.author.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.issue.author.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.issue.author.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.issue.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.issue.locked": (v97/*: any*/),
        "issue.timelineItems.edges.node.issue.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.label": (v116/*: any*/),
        "issue.timelineItems.edges.node.label.color": (v83/*: any*/),
        "issue.timelineItems.edges.node.label.description": (v86/*: any*/),
        "issue.timelineItems.edges.node.label.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.label.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.label.nameHTML": (v83/*: any*/),
        "issue.timelineItems.edges.node.label.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.label.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.label.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.label.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.label.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.label.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.label.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.lastEditedAt": (v117/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit": (v118/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.editor": (v87/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.editor.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.editor.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.editor.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.editor.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.lastUserContentEdit.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.lockReason": (v119/*: any*/),
        "issue.timelineItems.edges.node.milestone": (v120/*: any*/),
        "issue.timelineItems.edges.node.milestone.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.milestone.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.milestoneTitle": (v83/*: any*/),
        "issue.timelineItems.edges.node.minimizedReason": (v86/*: any*/),
        "issue.timelineItems.edges.node.pendingBlock": (v121/*: any*/),
        "issue.timelineItems.edges.node.pendingMinimizeReason": (v86/*: any*/),
        "issue.timelineItems.edges.node.pendingUnblock": (v121/*: any*/),
        "issue.timelineItems.edges.node.pendingUndo": (v121/*: any*/),
        "issue.timelineItems.edges.node.previousProjectColumnName": (v83/*: any*/),
        "issue.timelineItems.edges.node.previousStatus": (v83/*: any*/),
        "issue.timelineItems.edges.node.previousTitle": (v83/*: any*/),
        "issue.timelineItems.edges.node.project": (v122/*: any*/),
        "issue.timelineItems.edges.node.project.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.project.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.project.title": (v83/*: any*/),
        "issue.timelineItems.edges.node.project.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.projectColumnName": (v83/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups": (v123/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.content": (v124/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors": (v125/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.nodes": (v126/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.nodes.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.nodes.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.nodes.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.nodes.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.reactors.totalCount": (v101/*: any*/),
        "issue.timelineItems.edges.node.reactionGroups.viewerHasReacted": (v97/*: any*/),
        "issue.timelineItems.edges.node.referencedAt": (v89/*: any*/),
        "issue.timelineItems.edges.node.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.repository.databaseId": (v90/*: any*/),
        "issue.timelineItems.edges.node.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.repository.isPrivate": (v97/*: any*/),
        "issue.timelineItems.edges.node.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.repository.nameWithOwner": (v83/*: any*/),
        "issue.timelineItems.edges.node.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.repository.owner.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.repository.slashCommandsEnabled": (v97/*: any*/),
        "issue.timelineItems.edges.node.source": (v112/*: any*/),
        "issue.timelineItems.edges.node.source.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.source.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.source.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.stateReason": (v114/*: any*/),
        "issue.timelineItems.edges.node.status": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject": (v112/*: any*/),
        "issue.timelineItems.edges.node.subject.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.subject.isDraft": (v97/*: any*/),
        "issue.timelineItems.edges.node.subject.isInMergeQueue": (v97/*: any*/),
        "issue.timelineItems.edges.node.subject.number": (v101/*: any*/),
        "issue.timelineItems.edges.node.subject.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.name": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.owner": (v104/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.owner.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.owner.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.subject.repository.owner.login": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.state": (v113/*: any*/),
        "issue.timelineItems.edges.node.subject.title": (v83/*: any*/),
        "issue.timelineItems.edges.node.subject.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.target": (v112/*: any*/),
        "issue.timelineItems.edges.node.target.__isNode": (v83/*: any*/),
        "issue.timelineItems.edges.node.target.__typename": (v83/*: any*/),
        "issue.timelineItems.edges.node.target.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.target.repository": (v103/*: any*/),
        "issue.timelineItems.edges.node.target.repository.id": (v85/*: any*/),
        "issue.timelineItems.edges.node.url": (v84/*: any*/),
        "issue.timelineItems.edges.node.viewerCanBlockFromOrg": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanDelete": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanMinimize": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanReadUserContentEdits": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanReport": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanReportToMaintainer": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanUnblockFromOrg": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanUndo": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerCanUpdate": (v97/*: any*/),
        "issue.timelineItems.edges.node.viewerDidAuthor": (v97/*: any*/),
        "issue.timelineItems.edges.node.willCloseSubject": (v97/*: any*/),
        "issue.timelineItems.edges.node.willCloseTarget": (v97/*: any*/),
        "issue.timelineItems.pageInfo": (v127/*: any*/),
        "issue.timelineItems.pageInfo.hasPreviousPage": (v97/*: any*/),
        "issue.timelineItems.pageInfo.startCursor": (v86/*: any*/),
        "issue.timelineItems.totalCount": (v101/*: any*/),
        "issue.title": (v83/*: any*/),
        "issue.titleHTML": (v83/*: any*/),
        "issue.updatedAt": (v89/*: any*/),
        "issue.url": (v84/*: any*/),
        "issue.viewerCanAssign": (v97/*: any*/),
        "issue.viewerCanComment": (v97/*: any*/),
        "issue.viewerCanConvertToDiscussion": (v121/*: any*/),
        "issue.viewerCanDelete": (v97/*: any*/),
        "issue.viewerCanLabel": (v97/*: any*/),
        "issue.viewerCanSetMilestone": (v97/*: any*/),
        "issue.viewerCanTransfer": (v97/*: any*/),
        "issue.viewerCanType": (v121/*: any*/),
        "issue.viewerCanUpdate": (v97/*: any*/),
        "issue.viewerCanUpdateMetadata": (v121/*: any*/),
        "issue.viewerCanUpdateNext": (v121/*: any*/),
        "issue.viewerDidAuthor": (v97/*: any*/),
        "viewer": (v82/*: any*/),
        "viewer.__typename": (v83/*: any*/),
        "viewer.avatarUrl": (v84/*: any*/),
        "viewer.enterpriseManagedEnterpriseId": (v86/*: any*/),
        "viewer.id": (v85/*: any*/),
        "viewer.isEmployee": (v97/*: any*/),
        "viewer.login": (v83/*: any*/),
        "viewer.name": (v86/*: any*/)
      }
    },
    "name": "IssueViewerTestComponentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "eda3fda938a2ea034d739d9cfc579001";

export default node;
