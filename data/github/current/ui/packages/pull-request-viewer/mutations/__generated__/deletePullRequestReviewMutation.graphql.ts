/**
 * @generated SignedSource<<685224a0f77c60f4dd357268ab5425b8>>
 * @relayHash 3b1ca2bcf1e2519ec7a0749d051f04b2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3b1ca2bcf1e2519ec7a0749d051f04b2

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeletePullRequestReviewInput = {
  clientMutationId?: string | null | undefined;
  pullRequestReviewId: string;
};
export type deletePullRequestReviewMutation$variables = {
  input: DeletePullRequestReviewInput;
};
export type deletePullRequestReviewMutation$data = {
  readonly deletePullRequestReview: {
    readonly pullRequestReview: {
      readonly comments: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly id: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestReviewMutation$rawResponse = {
  readonly deletePullRequestReview: {
    readonly pullRequestReview: {
      readonly comments: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly id: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestReviewMutation = {
  rawResponse: deletePullRequestReviewMutation$rawResponse;
  response: deletePullRequestReviewMutation$data;
  variables: deletePullRequestReviewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v4 = {
  "alias": null,
  "args": null,
  "filters": null,
  "handle": "deleteRecord",
  "key": "",
  "kind": "ScalarHandle",
  "name": "id"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deletePullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestReview",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReview",
            "kind": "LinkedField",
            "name": "pullRequestReview",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "comments(first:100)"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "deletePullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestReview",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReview",
            "kind": "LinkedField",
            "name": "pullRequestReview",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "comments(first:100)"
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
    "id": "3b1ca2bcf1e2519ec7a0749d051f04b2",
    "metadata": {},
    "name": "deletePullRequestReviewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2b56b744244220d99164ec0c996df630";

export default node;
