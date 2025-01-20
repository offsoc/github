/**
 * @generated SignedSource<<e264a09ce9a1a105a58c2dd08114be03>>
 * @relayHash 8a0640819be89a72ebfbeb065e4a91cf
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8a0640819be89a72ebfbeb065e4a91cf

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
export type reopenPullRequestMutation$variables = {
  pullRequestId: string;
};
export type reopenPullRequestMutation$data = {
  readonly reopenPullRequest: {
    readonly pullRequest: {
      readonly id: string;
      readonly state: PullRequestState;
      readonly viewerCanChangeBaseBranch: boolean;
      readonly viewerCanClose: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type reopenPullRequestMutation$rawResponse = {
  readonly reopenPullRequest: {
    readonly pullRequest: {
      readonly id: string;
      readonly state: PullRequestState;
      readonly viewerCanChangeBaseBranch: boolean;
      readonly viewerCanClose: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type reopenPullRequestMutation = {
  rawResponse: reopenPullRequestMutation$rawResponse;
  response: reopenPullRequestMutation$data;
  variables: reopenPullRequestMutation$variables;
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
    "concreteType": "ReopenPullRequestPayload",
    "kind": "LinkedField",
    "name": "reopenPullRequest",
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
            "name": "viewerCanClose",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerCanChangeBaseBranch",
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
    "name": "reopenPullRequestMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "reopenPullRequestMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "8a0640819be89a72ebfbeb065e4a91cf",
    "metadata": {},
    "name": "reopenPullRequestMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "49cc3a59f80dbe77634f1ae14930fc76";

export default node;
