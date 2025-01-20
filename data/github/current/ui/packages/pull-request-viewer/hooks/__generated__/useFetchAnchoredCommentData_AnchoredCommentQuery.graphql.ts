/**
 * @generated SignedSource<<c0c7605968c431399a2075a9c64d02ba>>
 * @relayHash 5358a11694b4ef59c298353499a644b5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 5358a11694b4ef59c298353499a644b5

import { ConcreteRequest, Query } from 'relay-runtime';
export type useFetchAnchoredCommentData_AnchoredCommentQuery$variables = {
  commentId: number;
  number: number;
  owner: string;
  repo: string;
};
export type useFetchAnchoredCommentData_AnchoredCommentQuery$data = {
  readonly repository: {
    readonly pullRequest: {
      readonly reviewComment: {
        readonly pullRequestThread: {
          readonly id: string;
          readonly pathDigest: string;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type useFetchAnchoredCommentData_AnchoredCommentQuery = {
  response: useFetchAnchoredCommentData_AnchoredCommentQuery$data;
  variables: useFetchAnchoredCommentData_AnchoredCommentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "commentId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v4 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v5 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v6 = [
  {
    "kind": "Variable",
    "name": "databaseId",
    "variableName": "commentId"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestThread",
  "kind": "LinkedField",
  "name": "pullRequestThread",
  "plural": false,
  "selections": [
    (v7/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pathDigest",
      "storageKey": null
    }
  ],
  "storageKey": null
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
    "name": "useFetchAnchoredCommentData_AnchoredCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": "PullRequestReviewComment",
                "kind": "LinkedField",
                "name": "reviewComment",
                "plural": false,
                "selections": [
                  (v8/*: any*/)
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useFetchAnchoredCommentData_AnchoredCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v6/*: any*/),
                "concreteType": "PullRequestReviewComment",
                "kind": "LinkedField",
                "name": "reviewComment",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v7/*: any*/)
                ],
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
    ]
  },
  "params": {
    "id": "5358a11694b4ef59c298353499a644b5",
    "metadata": {},
    "name": "useFetchAnchoredCommentData_AnchoredCommentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "33039e0c3942f33debe4107eedf329d4";

export default node;
