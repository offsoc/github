/**
 * @generated SignedSource<<a3cce6bd6ff132b73f4cec07ca9fc39e>>
 * @relayHash 7277378540f4d2f3046c88b62cc85fed
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7277378540f4d2f3046c88b62cc85fed

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FilesChangedHeadingTestQuery$variables = {
  endOid?: string | null | undefined;
  pullRequestId: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type FilesChangedHeadingTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"FilesChangedHeading_pullRequest">;
  } | null | undefined;
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"FilesChangedHeading_viewer">;
  };
};
export type FilesChangedHeadingTestQuery = {
  response: FilesChangedHeadingTestQuery$data;
  variables: FilesChangedHeadingTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pullRequestId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestId"
  }
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
  "name": "id",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "oid",
    "storageKey": null
  },
  (v6/*: any*/)
],
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Commit"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "PullRequestUserPreferences"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FilesChangedHeadingTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v4/*: any*/),
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
                "name": "FilesChangedHeading_pullRequest"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FilesChangedHeading_viewer"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "FilesChangedHeadingTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestUserPreferences",
                "kind": "LinkedField",
                "name": "viewerPreferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "ignoreWhitespace",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "endOid",
                    "variableName": "endOid"
                  },
                  {
                    "kind": "Variable",
                    "name": "singleCommitOid",
                    "variableName": "singleCommitOid"
                  },
                  {
                    "kind": "Variable",
                    "name": "startOid",
                    "variableName": "startOid"
                  }
                ],
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestSummaryDelta",
                    "kind": "LinkedField",
                    "name": "summary",
                    "plural": true,
                    "selections": [
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "oldCommit",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "newCommit",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "linesAdded",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "linesDeleted",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerViewedFiles",
                "storageKey": null
              },
              {
                "alias": "allThreads",
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 50
                  },
                  {
                    "kind": "Literal",
                    "name": "isPositioned",
                    "value": false
                  }
                ],
                "concreteType": "PullRequestThreadConnection",
                "kind": "LinkedField",
                "name": "threads",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "totalCommentsCount",
                    "storageKey": null
                  }
                ],
                "storageKey": "threads(first:50,isPositioned:false)"
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "number",
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "login",
                        "storageKey": null
                      },
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestUserPreferences",
            "kind": "LinkedField",
            "name": "pullRequestUserPreferences",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "diffView",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "7277378540f4d2f3046c88b62cc85fed",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v8/*: any*/),
        "pullRequest.allThreads": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestThreadConnection"
        },
        "pullRequest.allThreads.totalCommentsCount": (v9/*: any*/),
        "pullRequest.comparison": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestComparison"
        },
        "pullRequest.comparison.linesAdded": (v9/*: any*/),
        "pullRequest.comparison.linesDeleted": (v9/*: any*/),
        "pullRequest.comparison.newCommit": (v10/*: any*/),
        "pullRequest.comparison.newCommit.id": (v11/*: any*/),
        "pullRequest.comparison.newCommit.oid": (v12/*: any*/),
        "pullRequest.comparison.oldCommit": (v10/*: any*/),
        "pullRequest.comparison.oldCommit.id": (v11/*: any*/),
        "pullRequest.comparison.oldCommit.oid": (v12/*: any*/),
        "pullRequest.comparison.summary": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestSummaryDelta"
        },
        "pullRequest.comparison.summary.__typename": (v8/*: any*/),
        "pullRequest.id": (v11/*: any*/),
        "pullRequest.number": (v9/*: any*/),
        "pullRequest.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.repository.id": (v11/*: any*/),
        "pullRequest.repository.name": (v8/*: any*/),
        "pullRequest.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequest.repository.owner.__typename": (v8/*: any*/),
        "pullRequest.repository.owner.id": (v11/*: any*/),
        "pullRequest.repository.owner.login": (v8/*: any*/),
        "pullRequest.viewerPreferences": (v13/*: any*/),
        "pullRequest.viewerPreferences.ignoreWhitespace": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "pullRequest.viewerViewedFiles": (v9/*: any*/),
        "viewer": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "User"
        },
        "viewer.id": (v11/*: any*/),
        "viewer.pullRequestUserPreferences": (v13/*: any*/),
        "viewer.pullRequestUserPreferences.diffView": (v8/*: any*/)
      }
    },
    "name": "FilesChangedHeadingTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b8f3b99ececc0a103de9c4191ea72125";

export default node;
