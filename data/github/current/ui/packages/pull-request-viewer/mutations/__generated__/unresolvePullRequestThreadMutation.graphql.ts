/**
 * @generated SignedSource<<baa084500d2862523ab5e732a161d4b3>>
 * @relayHash 050f8934f18fd80a6b72aec109e7b494
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 050f8934f18fd80a6b72aec109e7b494

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type unresolvePullRequestThreadMutation$variables = {
  id: string;
};
export type unresolvePullRequestThreadMutation$data = {
  readonly unresolvePullRequestThread: {
    readonly thread: {
      readonly comments: {
        readonly totalCount: number;
      };
      readonly id: string;
      readonly isResolved: boolean;
      readonly path: string;
      readonly viewerCanResolve: boolean;
      readonly viewerCanUnresolve: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type unresolvePullRequestThreadMutation$rawResponse = {
  readonly unresolvePullRequestThread: {
    readonly thread: {
      readonly comments: {
        readonly totalCount: number;
      };
      readonly id: string;
      readonly isResolved: boolean;
      readonly path: string;
      readonly viewerCanResolve: boolean;
      readonly viewerCanUnresolve: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type unresolvePullRequestThreadMutation = {
  rawResponse: unresolvePullRequestThreadMutation$rawResponse;
  response: unresolvePullRequestThreadMutation$data;
  variables: unresolvePullRequestThreadMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "threadId",
            "variableName": "id"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "UnresolvePullRequestThreadPayload",
    "kind": "LinkedField",
    "name": "unresolvePullRequestThread",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PullRequestThread",
        "kind": "LinkedField",
        "name": "thread",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isResolved",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "path",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanResolve",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanUnresolve",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReviewCommentConnection",
            "kind": "LinkedField",
            "name": "comments",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totalCount",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unresolvePullRequestThreadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unresolvePullRequestThreadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "050f8934f18fd80a6b72aec109e7b494",
    "metadata": {},
    "name": "unresolvePullRequestThreadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b14a3723892cee9c934b49e2bdbcf8b1";

export default node;
