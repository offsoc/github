/**
 * @generated SignedSource<<3ea3c6e8c8a7f4071549de5d96c7469c>>
 * @relayHash 758cd7edf1b7eb2bbc5f3dffe75a688a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 758cd7edf1b7eb2bbc5f3dffe75a688a

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type closePullRequestMutation$variables = {
  pullRequestId: string;
};
export type closePullRequestMutation$data = {
  readonly closePullRequest: {
    readonly pullRequest: {
      readonly id: string;
      readonly state: PullRequestState;
      readonly viewerCanChangeBaseBranch: boolean;
      readonly viewerCanDeleteHeadRef: boolean;
      readonly viewerCanReopen: boolean;
      readonly viewerCanRestoreHeadRef: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type closePullRequestMutation = {
  response: closePullRequestMutation$data;
  variables: closePullRequestMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pullRequestId"
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
            "name": "pullRequestId",
            "variableName": "pullRequestId"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "ClosePullRequestPayload",
    "kind": "LinkedField",
    "name": "closePullRequest",
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
            "name": "state",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanReopen",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanChangeBaseBranch",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanDeleteHeadRef",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanRestoreHeadRef",
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
    "name": "closePullRequestMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "closePullRequestMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "758cd7edf1b7eb2bbc5f3dffe75a688a",
    "metadata": {},
    "name": "closePullRequestMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "e15bd63c5f4181abc793c73fb1defcfc";

export default node;
