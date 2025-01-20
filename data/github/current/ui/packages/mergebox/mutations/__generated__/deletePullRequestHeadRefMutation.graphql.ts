/**
 * @generated SignedSource<<541ce87f57e9bac4ad7f6eb2c2c31e62>>
 * @relayHash 831b62c6f7adf910fb7a952c06d34686
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 831b62c6f7adf910fb7a952c06d34686

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type deletePullRequestHeadRefMutation$variables = {
  id: string;
};
export type deletePullRequestHeadRefMutation$data = {
  readonly deletePullRequestHeadRef: {
    readonly pullRequest: {
      readonly headRefName: string;
      readonly headRepository: {
        readonly name: string;
        readonly owner: {
          readonly login: string;
        };
      } | null | undefined;
      readonly id: string;
      readonly state: PullRequestState;
      readonly viewerCanDeleteHeadRef: boolean;
      readonly viewerCanReopen: boolean;
      readonly viewerCanRestoreHeadRef: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestHeadRefMutation$rawResponse = {
  readonly deletePullRequestHeadRef: {
    readonly pullRequest: {
      readonly headRefName: string;
      readonly headRepository: {
        readonly id: string;
        readonly name: string;
        readonly owner: {
          readonly __typename: string;
          readonly id: string;
          readonly login: string;
        };
      } | null | undefined;
      readonly id: string;
      readonly state: PullRequestState;
      readonly viewerCanDeleteHeadRef: boolean;
      readonly viewerCanReopen: boolean;
      readonly viewerCanRestoreHeadRef: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type deletePullRequestHeadRefMutation = {
  rawResponse: deletePullRequestHeadRefMutation$rawResponse;
  response: deletePullRequestHeadRefMutation$data;
  variables: deletePullRequestHeadRefMutation$variables;
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
        "name": "pullRequestId",
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "headRefName",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDeleteHeadRef",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanRestoreHeadRef",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReopen",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deletePullRequestHeadRefMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePullRequestHeadRefPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestHeadRef",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "headRepository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
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
    "name": "deletePullRequestHeadRefMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePullRequestHeadRefPayload",
        "kind": "LinkedField",
        "name": "deletePullRequestHeadRef",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "headRepository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      },
                      (v5/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "831b62c6f7adf910fb7a952c06d34686",
    "metadata": {},
    "name": "deletePullRequestHeadRefMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "2de3ea20505338de53eaaed2eb2a2109";

export default node;
