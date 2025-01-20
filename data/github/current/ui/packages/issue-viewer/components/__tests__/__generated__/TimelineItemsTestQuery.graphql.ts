/**
 * @generated SignedSource<<d0f139cb884988c37af28ebf4583f3b9>>
 * @relayHash 0d52c5cf7193c46e49396f0f2beb7c0f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 0d52c5cf7193c46e49396f0f2beb7c0f

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TimelineItemsTestQuery$variables = Record<PropertyKey, never>;
export type TimelineItemsTestQuery$data = {
  readonly repository: {
    readonly issue: {
      readonly timelineItems: {
        readonly " $fragmentSpreads": FragmentRefs<"TimelineItemsPaginated">;
      };
    } | null | undefined;
  } | null | undefined;
  readonly viewer: {
    readonly login: string;
  };
};
export type TimelineItemsTestQuery = {
  response: TimelineItemsTestQuery$data;
  variables: TimelineItemsTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "repo"
  },
  {
    "kind": "Literal",
    "name": "owner",
    "value": "owner"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "number",
    "value": 33
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "last",
    "value": 10
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v4 = [
  (v3/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  (v5/*: any*/),
  (v3/*: any*/),
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
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
  "name": "createdAt",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameWithOwner",
  "storageKey": null
},
v16 = [
  (v7/*: any*/)
],
v17 = {
  "kind": "InlineFragment",
  "selections": (v16/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v18 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isActor"
},
v19 = {
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
v20 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v5/*: any*/),
    (v3/*: any*/),
    (v7/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/)
  ],
  "storageKey": null
},
v21 = [
  (v5/*: any*/),
  (v17/*: any*/)
],
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v24 = [
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
v25 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v8/*: any*/),
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stateReason",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v7/*: any*/),
    (v13/*: any*/),
    (v14/*: any*/),
    (v25/*: any*/)
  ],
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isDraft",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isInMergeQueue",
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
    (v13/*: any*/),
    (v25/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v31 = [
  (v11/*: any*/),
  (v20/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Label",
    "kind": "LinkedField",
    "name": "label",
    "plural": false,
    "selections": [
      (v7/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "nameHTML",
        "storageKey": null
      },
      (v13/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "color",
        "storageKey": null
      },
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
  },
  (v6/*: any*/)
],
v32 = [
  (v7/*: any*/),
  (v3/*: any*/)
],
v33 = [
  (v11/*: any*/),
  (v20/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "assignee",
    "plural": false,
    "selections": [
      (v5/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": (v32/*: any*/),
        "type": "User",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v32/*: any*/),
        "type": "Bot",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v32/*: any*/),
        "type": "Mannequin",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v32/*: any*/),
        "type": "Organization",
        "abstractKey": null
      },
      (v17/*: any*/)
    ],
    "storageKey": null
  },
  (v6/*: any*/)
],
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectV2",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v34/*: any*/),
    (v10/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v5/*: any*/),
    (v18/*: any*/),
    (v19/*: any*/),
    (v3/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "concreteType": "Project",
  "kind": "LinkedField",
  "name": "project",
  "plural": false,
  "selections": [
    (v13/*: any*/),
    (v10/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "projectColumnName",
  "storageKey": null
},
v39 = [
  (v11/*: any*/),
  (v6/*: any*/),
  (v36/*: any*/)
],
v40 = [
  (v6/*: any*/),
  (v11/*: any*/),
  (v36/*: any*/)
],
v41 = [
  (v3/*: any*/),
  (v7/*: any*/)
],
v42 = [
  (v6/*: any*/),
  (v11/*: any*/),
  (v36/*: any*/),
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
      (v7/*: any*/)
    ],
    "storageKey": null
  }
],
v43 = [
  (v6/*: any*/),
  (v36/*: any*/),
  (v11/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "subject",
    "plural": false,
    "selections": [
      (v5/*: any*/),
      {
        "kind": "InlineFragment",
        "selections": [
          (v34/*: any*/),
          (v10/*: any*/),
          (v9/*: any*/),
          (v23/*: any*/),
          (v28/*: any*/),
          (v29/*: any*/),
          (v30/*: any*/)
        ],
        "type": "PullRequest",
        "abstractKey": null
      },
      (v17/*: any*/)
    ],
    "storageKey": null
  }
],
v44 = [
  (v10/*: any*/),
  (v9/*: any*/),
  (v7/*: any*/)
],
v45 = [
  (v10/*: any*/),
  (v9/*: any*/)
],
v46 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Repository"
},
v47 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v48 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v49 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v50 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v51 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v52 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v53 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v54 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
},
v55 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v56 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Repository"
},
v57 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v58 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v59 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "CertificateAttributes"
},
v60 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v61 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ReferencedSubject"
},
v62 = {
  "enumValues": [
    "CLOSED",
    "MERGED",
    "OPEN"
  ],
  "nullable": false,
  "plural": false,
  "type": "PullRequestState"
},
v63 = {
  "enumValues": [
    "COMPLETED",
    "NOT_PLANNED",
    "REOPENED"
  ],
  "nullable": true,
  "plural": false,
  "type": "IssueStateReason"
},
v64 = {
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
    "name": "TimelineItemsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "TimelineItemsPaginated"
                  }
                ],
                "storageKey": "timelineItems(last:10)"
              }
            ],
            "storageKey": "issue(number:33)"
          }
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TimelineItemsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
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
                          (v5/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
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
                                    "selections": (v8/*: any*/),
                                    "storageKey": null
                                  },
                                  (v7/*: any*/),
                                  (v9/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "locked",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v7/*: any*/),
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
                              (v10/*: any*/),
                              (v11/*: any*/),
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
                                "concreteType": "Sponsorship",
                                "kind": "LinkedField",
                                "name": "authorToRepoOwnerSponsorship",
                                "plural": false,
                                "selections": [
                                  (v11/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isActive",
                                    "storageKey": null
                                  },
                                  (v7/*: any*/)
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
                                  (v5/*: any*/),
                                  (v7/*: any*/),
                                  (v3/*: any*/),
                                  (v12/*: any*/)
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
                                  (v7/*: any*/),
                                  (v13/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "owner",
                                    "plural": false,
                                    "selections": [
                                      (v5/*: any*/),
                                      (v7/*: any*/),
                                      (v3/*: any*/),
                                      (v10/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v14/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "slashCommandsEnabled",
                                    "storageKey": null
                                  },
                                  (v15/*: any*/),
                                  (v6/*: any*/)
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
                                          (v5/*: any*/),
                                          (v10/*: any*/),
                                          (v3/*: any*/),
                                          (v7/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v7/*: any*/)
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
                              {
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
                                              (v5/*: any*/),
                                              {
                                                "kind": "InlineFragment",
                                                "selections": (v4/*: any*/),
                                                "type": "User",
                                                "abstractKey": null
                                              },
                                              {
                                                "kind": "InlineFragment",
                                                "selections": (v4/*: any*/),
                                                "type": "Bot",
                                                "abstractKey": null
                                              },
                                              {
                                                "kind": "InlineFragment",
                                                "selections": (v4/*: any*/),
                                                "type": "Organization",
                                                "abstractKey": null
                                              },
                                              {
                                                "kind": "InlineFragment",
                                                "selections": (v4/*: any*/),
                                                "type": "Mannequin",
                                                "abstractKey": null
                                              },
                                              (v17/*: any*/)
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
                              }
                            ],
                            "type": "IssueComment",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v20/*: any*/),
                              (v6/*: any*/),
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
                                "selections": (v21/*: any*/),
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
                                  (v22/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "signature",
                                    "plural": false,
                                    "selections": [
                                      (v5/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "User",
                                        "kind": "LinkedField",
                                        "name": "signer",
                                        "plural": false,
                                        "selections": [
                                          (v3/*: any*/),
                                          (v12/*: any*/),
                                          (v7/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v23/*: any*/),
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
                                            "selections": (v24/*: any*/),
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "CertificateAttributes",
                                            "kind": "LinkedField",
                                            "name": "subject",
                                            "plural": false,
                                            "selections": (v24/*: any*/),
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
                                      (v13/*: any*/),
                                      (v25/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "defaultBranch",
                                        "storageKey": null
                                      },
                                      (v7/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v7/*: any*/)
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
                              (v11/*: any*/),
                              (v20/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "source",
                                "plural": false,
                                "selections": (v21/*: any*/),
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
                              (v6/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "target",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
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
                                        "selections": (v16/*: any*/),
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  (v17/*: any*/)
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
                                  (v5/*: any*/),
                                  {
                                    "kind": "TypeDiscriminator",
                                    "abstractKey": "__isReferencedSubject"
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v7/*: any*/),
                                      {
                                        "alias": "issueTitleHTML",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "titleHTML",
                                        "storageKey": null
                                      },
                                      (v10/*: any*/),
                                      (v9/*: any*/),
                                      (v26/*: any*/),
                                      (v27/*: any*/)
                                    ],
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v7/*: any*/),
                                      {
                                        "alias": "pullTitleHTML",
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "titleHTML",
                                        "storageKey": null
                                      },
                                      (v10/*: any*/),
                                      (v9/*: any*/),
                                      (v23/*: any*/),
                                      (v28/*: any*/),
                                      (v29/*: any*/),
                                      (v27/*: any*/)
                                    ],
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v17/*: any*/)
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
                              (v20/*: any*/),
                              (v11/*: any*/),
                              (v6/*: any*/)
                            ],
                            "type": "MentionedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v31/*: any*/),
                            "type": "LabeledEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v31/*: any*/),
                            "type": "UnlabeledEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v33/*: any*/),
                            "type": "AssignedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v33/*: any*/),
                            "type": "UnassignedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v20/*: any*/),
                              (v6/*: any*/),
                              (v35/*: any*/)
                            ],
                            "type": "AddedToProjectV2Event",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v20/*: any*/),
                              (v35/*: any*/)
                            ],
                            "type": "RemovedFromProjectV2Event",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v36/*: any*/),
                              (v37/*: any*/),
                              (v38/*: any*/),
                              (v6/*: any*/)
                            ],
                            "type": "AddedToProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v6/*: any*/),
                              (v36/*: any*/),
                              (v37/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "previousProjectColumnName",
                                "storageKey": null
                              },
                              (v38/*: any*/)
                            ],
                            "type": "MovedColumnsInProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v6/*: any*/),
                              (v36/*: any*/),
                              (v37/*: any*/),
                              (v38/*: any*/)
                            ],
                            "type": "RemovedFromProjectEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v39/*: any*/),
                            "type": "SubscribedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v39/*: any*/),
                            "type": "UnsubscribedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v11/*: any*/),
                              (v26/*: any*/),
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
                                  (v5/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/),
                                      (v34/*: any*/)
                                    ],
                                    "type": "ProjectV2",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/),
                                      (v9/*: any*/),
                                      (v30/*: any*/)
                                    ],
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/),
                                      (v22/*: any*/),
                                      (v30/*: any*/)
                                    ],
                                    "type": "Commit",
                                    "abstractKey": null
                                  },
                                  (v17/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v36/*: any*/)
                            ],
                            "type": "ClosedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v40/*: any*/),
                            "type": "ReopenedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "lockReason",
                                "storageKey": null
                              },
                              (v36/*: any*/)
                            ],
                            "type": "LockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v40/*: any*/),
                            "type": "UnlockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v40/*: any*/),
                            "type": "PinnedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v40/*: any*/),
                            "type": "UnpinnedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v11/*: any*/),
                              (v36/*: any*/),
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
                              (v6/*: any*/),
                              (v11/*: any*/),
                              (v36/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "deletedCommentAuthor",
                                "plural": false,
                                "selections": (v8/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "type": "CommentDeletedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "blockDuration",
                                "storageKey": null
                              },
                              (v36/*: any*/),
                              {
                                "alias": "blockedUser",
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "subject",
                                "plural": false,
                                "selections": (v41/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "type": "UserBlockedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v42/*: any*/),
                            "type": "MilestonedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v42/*: any*/),
                            "type": "DemilestonedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v43/*: any*/),
                            "type": "ConnectedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v36/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Repository",
                                "kind": "LinkedField",
                                "name": "fromRepository",
                                "plural": false,
                                "selections": [
                                  (v15/*: any*/),
                                  (v10/*: any*/),
                                  (v7/*: any*/)
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
                              (v6/*: any*/),
                              (v36/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Project",
                                "kind": "LinkedField",
                                "name": "project",
                                "plural": false,
                                "selections": [
                                  (v10/*: any*/),
                                  (v13/*: any*/),
                                  (v7/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "type": "ConvertedNoteToIssueEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": (v43/*: any*/),
                            "type": "DisconnectedEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v36/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "canonical",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v44/*: any*/),
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v44/*: any*/),
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v17/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanUndo",
                                "storageKey": null
                              },
                              (v7/*: any*/),
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
                              (v36/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "canonical",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v45/*: any*/),
                                    "type": "Issue",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v45/*: any*/),
                                    "type": "PullRequest",
                                    "abstractKey": null
                                  },
                                  (v17/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "type": "UnmarkedAsDuplicateEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v6/*: any*/),
                              (v36/*: any*/),
                              (v11/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Discussion",
                                "kind": "LinkedField",
                                "name": "discussion",
                                "plural": false,
                                "selections": (v44/*: any*/),
                                "storageKey": null
                              }
                            ],
                            "type": "ConvertedToDiscussionEvent",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v11/*: any*/),
                              (v36/*: any*/),
                              (v35/*: any*/),
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
                              (v11/*: any*/),
                              (v36/*: any*/),
                              (v6/*: any*/)
                            ],
                            "type": "ConvertedFromDraftEvent",
                            "abstractKey": null
                          },
                          (v17/*: any*/),
                          {
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
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "timelineItems(last:10)"
              },
              (v7/*: any*/)
            ],
            "storageKey": "issue(number:33)"
          },
          (v7/*: any*/)
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": (v41/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "0d52c5cf7193c46e49396f0f2beb7c0f",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": (v46/*: any*/),
        "repository.id": (v47/*: any*/),
        "repository.issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.id": (v47/*: any*/),
        "repository.issue.timelineItems": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueTimelineItemsConnection"
        },
        "repository.issue.timelineItems.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueTimelineItemsEdge"
        },
        "repository.issue.timelineItems.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueTimelineItems"
        },
        "repository.issue.timelineItems.edges.node.__id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.__isComment": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.__isReactable": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.actor": (v49/*: any*/),
        "repository.issue.timelineItems.edges.node.actor.__isActor": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.actor.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.actor.avatarUrl": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.actor.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.actor.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.assignee": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Assignee"
        },
        "repository.issue.timelineItems.edges.node.assignee.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.assignee.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.assignee.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.assignee.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.author": (v49/*: any*/),
        "repository.issue.timelineItems.edges.node.author.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.author.avatarUrl": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.author.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.author.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.authorAssociation": {
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
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.createdAt": (v51/*: any*/),
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.isActive": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.blockDuration": {
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
        "repository.issue.timelineItems.edges.node.blockedUser": (v53/*: any*/),
        "repository.issue.timelineItems.edges.node.blockedUser.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.blockedUser.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.body": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.bodyHTML": (v54/*: any*/),
        "repository.issue.timelineItems.edges.node.bodyVersion": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.canonical": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueOrPullRequest"
        },
        "repository.issue.timelineItems.edges.node.canonical.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.canonical.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.canonical.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.canonical.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.canonical.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.closer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Closer"
        },
        "repository.issue.timelineItems.edges.node.closer.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.abbreviatedOid": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.title": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.closer.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.closingProjectItemStatus": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Commit"
        },
        "repository.issue.timelineItems.edges.node.commit.abbreviatedOid": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.hasSignature": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.message": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.messageBodyHTML": (v54/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.messageHeadlineHTML": (v54/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.defaultBranch": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitSignature"
        },
        "repository.issue.timelineItems.edges.node.commit.signature.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.issuer": (v59/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.issuer.commonName": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.issuer.emailAddress": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.issuer.organization": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.issuer.organizationUnit": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.keyFingerprint": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.keyId": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.signer": (v53/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.signer.avatarUrl": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.signer.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.signer.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.state": {
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
        "repository.issue.timelineItems.edges.node.commit.signature.subject": (v59/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.subject.commonName": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.subject.emailAddress": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.subject.organization": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.subject.organizationUnit": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.signature.wasSignedByGitHub": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.commit.verificationStatus": {
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
        "repository.issue.timelineItems.edges.node.createdAt": (v51/*: any*/),
        "repository.issue.timelineItems.edges.node.createdViaEmail": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.currentTitle": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.databaseId": (v60/*: any*/),
        "repository.issue.timelineItems.edges.node.deletedCommentAuthor": (v49/*: any*/),
        "repository.issue.timelineItems.edges.node.deletedCommentAuthor.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.deletedCommentAuthor.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.deletedCommentAuthor.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.discussion": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Discussion"
        },
        "repository.issue.timelineItems.edges.node.discussion.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.discussion.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.discussion.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.fromRepository": (v46/*: any*/),
        "repository.issue.timelineItems.edges.node.fromRepository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.fromRepository.nameWithOwner": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.fromRepository.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource": (v61/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.__isReferencedSubject": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.isDraft": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.isInMergeQueue": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.issueTitleHTML": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.pullTitleHTML": (v54/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.isPrivate": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.state": (v62/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.stateReason": (v63/*: any*/),
        "repository.issue.timelineItems.edges.node.innerSource.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.isHidden": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.timelineItems.edges.node.issue.author": (v49/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.author.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.author.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.author.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.locked": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.label": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Label"
        },
        "repository.issue.timelineItems.edges.node.label.color": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.label.description": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.label.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.label.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.label.nameHTML": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.label.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "repository.issue.timelineItems.edges.node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor": (v49/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.lockReason": {
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
        "repository.issue.timelineItems.edges.node.milestone": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Milestone"
        },
        "repository.issue.timelineItems.edges.node.milestone.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.milestone.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.milestoneTitle": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.minimizedReason": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingBlock": (v64/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingMinimizeReason": (v58/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingUnblock": (v64/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingUndo": (v64/*: any*/),
        "repository.issue.timelineItems.edges.node.previousProjectColumnName": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.previousStatus": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.previousTitle": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.project": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2"
        },
        "repository.issue.timelineItems.edges.node.project.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.project.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.project.title": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.project.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.projectColumnName": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "repository.issue.timelineItems.edges.node.reactionGroups.content": {
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
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.nodes.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.nodes.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.nodes.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.nodes.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups.reactors.totalCount": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.reactionGroups.viewerHasReacted": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.referencedAt": (v51/*: any*/),
        "repository.issue.timelineItems.edges.node.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.databaseId": (v60/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.isPrivate": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.nameWithOwner": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.slashCommandsEnabled": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.source": (v61/*: any*/),
        "repository.issue.timelineItems.edges.node.source.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.source.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.source.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.stateReason": (v63/*: any*/),
        "repository.issue.timelineItems.edges.node.status": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject": (v61/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.isDraft": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.isInMergeQueue": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.number": (v55/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.name": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.owner": (v57/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.owner.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.owner.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.repository.owner.login": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.state": (v62/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.title": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.subject.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.target": (v61/*: any*/),
        "repository.issue.timelineItems.edges.node.target.__isNode": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.target.__typename": (v48/*: any*/),
        "repository.issue.timelineItems.edges.node.target.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.target.repository": (v56/*: any*/),
        "repository.issue.timelineItems.edges.node.target.repository.id": (v47/*: any*/),
        "repository.issue.timelineItems.edges.node.url": (v50/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanBlockFromOrg": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanDelete": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanMinimize": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReadUserContentEdits": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReport": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReportToMaintainer": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanUnblockFromOrg": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanUndo": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanUpdate": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerDidAuthor": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.willCloseSubject": (v52/*: any*/),
        "repository.issue.timelineItems.edges.node.willCloseTarget": (v52/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v47/*: any*/),
        "viewer.login": (v48/*: any*/)
      }
    },
    "name": "TimelineItemsTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "762852d7f7787525bdb9cbe52c528f33";

export default node;
