/**
 * @generated SignedSource<<aaf527838192e74c2e77bbe161021abb>>
 * @relayHash b41422b226bba3d19bb8acbc53414315
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b41422b226bba3d19bb8acbc53414315

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type restorePullRequestHeadRefMutation$variables = {
  id: string;
};
export type restorePullRequestHeadRefMutation$data = {
  readonly restorePullRequestHeadRef: {
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
export type restorePullRequestHeadRefMutation$rawResponse = {
  readonly restorePullRequestHeadRef: {
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
export type restorePullRequestHeadRefMutation = {
  rawResponse: restorePullRequestHeadRefMutation$rawResponse;
  response: restorePullRequestHeadRefMutation$data;
  variables: restorePullRequestHeadRefMutation$variables;
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
    "name": "restorePullRequestHeadRefMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RestorePullRequestHeadRefPayload",
        "kind": "LinkedField",
        "name": "restorePullRequestHeadRef",
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
    "name": "restorePullRequestHeadRefMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RestorePullRequestHeadRefPayload",
        "kind": "LinkedField",
        "name": "restorePullRequestHeadRef",
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
    "id": "b41422b226bba3d19bb8acbc53414315",
    "metadata": {},
    "name": "restorePullRequestHeadRefMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "c067d7b422f78d12ca0b2ee7222e6566";

export default node;
