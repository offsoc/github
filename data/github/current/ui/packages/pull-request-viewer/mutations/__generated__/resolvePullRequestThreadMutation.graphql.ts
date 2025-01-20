/**
 * @generated SignedSource<<251184f2db85bf3fc7e42de776e809ba>>
 * @relayHash dfe2daef1c505c94ba363c2d4334c83b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID dfe2daef1c505c94ba363c2d4334c83b

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type resolvePullRequestThreadMutation$variables = {
  id: string;
};
export type resolvePullRequestThreadMutation$data = {
  readonly resolvePullRequestThread: {
    readonly thread: {
      readonly comments: {
        readonly totalCount: number;
      };
      readonly id: string;
      readonly isResolved: boolean;
      readonly path: string;
      readonly resolvedByActor: {
        readonly login: string;
      } | null | undefined;
      readonly viewerCanResolve: boolean;
      readonly viewerCanUnresolve: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type resolvePullRequestThreadMutation$rawResponse = {
  readonly resolvePullRequestThread: {
    readonly thread: {
      readonly comments: {
        readonly totalCount: number;
      };
      readonly id: string;
      readonly isResolved: boolean;
      readonly path: string;
      readonly resolvedByActor: {
        readonly __typename: string;
        readonly id: string;
        readonly login: string;
      } | null | undefined;
      readonly viewerCanResolve: boolean;
      readonly viewerCanUnresolve: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type resolvePullRequestThreadMutation = {
  rawResponse: resolvePullRequestThreadMutation$rawResponse;
  response: resolvePullRequestThreadMutation$data;
  variables: resolvePullRequestThreadMutation$variables;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
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
  "name": "isResolved",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanResolve",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnresolve",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v8 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "resolvePullRequestThreadMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ResolvePullRequestThreadPayload",
        "kind": "LinkedField",
        "name": "resolvePullRequestThread",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "resolvedByActor",
                "plural": false,
                "selections": [
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/)
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
    "name": "resolvePullRequestThreadMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ResolvePullRequestThreadPayload",
        "kind": "LinkedField",
        "name": "resolvePullRequestThread",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "resolvedByActor",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "dfe2daef1c505c94ba363c2d4334c83b",
    "metadata": {},
    "name": "resolvePullRequestThreadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "d4a31613d49208322ec5ea0da84e2ef9";

export default node;
