/**
 * @generated SignedSource<<5b06b1260bbcdbdcd1f4892a2f3b77d4>>
 * @relayHash 2438569a9ee2f29f44d2b4568d05d5ba
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 2438569a9ee2f29f44d2b4568d05d5ba

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkPullRequestReadyForReviewInput = {
  clientMutationId?: string | null | undefined;
  pullRequestId: string;
};
export type markPullRequestReadyForReviewMutation$variables = {
  input: MarkPullRequestReadyForReviewInput;
};
export type markPullRequestReadyForReviewMutation$data = {
  readonly markPullRequestReadyForReview: {
    readonly pullRequest: {
      readonly id: string;
      readonly isDraft: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type markPullRequestReadyForReviewMutation$rawResponse = {
  readonly markPullRequestReadyForReview: {
    readonly pullRequest: {
      readonly id: string;
      readonly isDraft: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type markPullRequestReadyForReviewMutation = {
  rawResponse: markPullRequestReadyForReviewMutation$rawResponse;
  response: markPullRequestReadyForReviewMutation$data;
  variables: markPullRequestReadyForReviewMutation$variables;
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
    "concreteType": "MarkPullRequestReadyForReviewPayload",
    "kind": "LinkedField",
    "name": "markPullRequestReadyForReview",
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
    "name": "markPullRequestReadyForReviewMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markPullRequestReadyForReviewMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "2438569a9ee2f29f44d2b4568d05d5ba",
    "metadata": {},
    "name": "markPullRequestReadyForReviewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "303dd574e7d2f59c3d4c6c1ecec8cd8b";

export default node;
