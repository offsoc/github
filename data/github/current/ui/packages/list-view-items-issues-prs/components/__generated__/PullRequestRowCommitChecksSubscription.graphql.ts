/**
 * @generated SignedSource<<438acf376d5cf2bf7450bd896685c56c>>
 * @relayHash 3326b1e4b960cfe7156499d6f7aa9f47
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3326b1e4b960cfe7156499d6f7aa9f47

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type CheckRunState = "ACTION_REQUIRED" | "CANCELLED" | "COMPLETED" | "FAILURE" | "IN_PROGRESS" | "NEUTRAL" | "PENDING" | "QUEUED" | "SKIPPED" | "STALE" | "STARTUP_FAILURE" | "SUCCESS" | "TIMED_OUT" | "WAITING" | "%future added value";
export type StatusState = "ERROR" | "EXPECTED" | "FAILURE" | "PENDING" | "SUCCESS" | "%future added value";
export type PullRequestRowCommitChecksSubscription$variables = {
  id: string;
};
export type PullRequestRowCommitChecksSubscription$data = {
  readonly commitChecksUpdated: {
    readonly id: string;
    readonly statusCheckRollup: {
      readonly contexts: {
        readonly checkRunCount: number;
        readonly checkRunCountsByState: ReadonlyArray<{
          readonly count: number;
          readonly state: CheckRunState;
        }> | null | undefined;
      };
      readonly state: StatusState;
    } | null | undefined;
  };
};
export type PullRequestRowCommitChecksSubscription = {
  response: PullRequestRowCommitChecksSubscription$data;
  variables: PullRequestRowCommitChecksSubscription$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
  "concreteType": "StatusCheckRollupContextConnection",
  "kind": "LinkedField",
  "name": "contexts",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "checkRunCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CheckRunStateCount",
      "kind": "LinkedField",
      "name": "checkRunCountsByState",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
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
    "name": "PullRequestRowCommitChecksSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Commit",
        "kind": "LinkedField",
        "name": "commitChecksUpdated",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "StatusCheckRollup",
            "kind": "LinkedField",
            "name": "statusCheckRollup",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "EventSubscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PullRequestRowCommitChecksSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Commit",
        "kind": "LinkedField",
        "name": "commitChecksUpdated",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "StatusCheckRollup",
            "kind": "LinkedField",
            "name": "statusCheckRollup",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "3326b1e4b960cfe7156499d6f7aa9f47",
    "metadata": {},
    "name": "PullRequestRowCommitChecksSubscription",
    "operationKind": "subscription",
    "text": null
  }
};
})();

(node as any).hash = "5dee87e2713acc6cc0a5df4aebd42df6";

export default node;
