/**
 * @generated SignedSource<<e2b11668a9754d361a6d953f53f1daa1>>
 * @relayHash 25f800cb238b5fc25c5887ee623cd6d9
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 25f800cb238b5fc25c5887ee623cd6d9

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ConvertPullRequestToDraftInput = {
  clientMutationId?: string | null | undefined;
  pullRequestId: string;
};
export type convertPullRequestToDraftMutation$variables = {
  input: ConvertPullRequestToDraftInput;
};
export type convertPullRequestToDraftMutation$data = {
  readonly convertPullRequestToDraft: {
    readonly pullRequest: {
      readonly id: string;
      readonly isDraft: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type convertPullRequestToDraftMutation$rawResponse = {
  readonly convertPullRequestToDraft: {
    readonly pullRequest: {
      readonly id: string;
      readonly isDraft: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type convertPullRequestToDraftMutation = {
  rawResponse: convertPullRequestToDraftMutation$rawResponse;
  response: convertPullRequestToDraftMutation$data;
  variables: convertPullRequestToDraftMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ConvertPullRequestToDraftPayload",
    "kind": "LinkedField",
    "name": "convertPullRequestToDraft",
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
            "name": "isDraft",
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
    "name": "convertPullRequestToDraftMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "convertPullRequestToDraftMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "25f800cb238b5fc25c5887ee623cd6d9",
    "metadata": {},
    "name": "convertPullRequestToDraftMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "7e89477d49f701a937ed2636e613a461";

export default node;
