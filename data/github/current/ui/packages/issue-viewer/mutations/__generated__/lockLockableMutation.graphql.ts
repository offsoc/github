/**
 * @generated SignedSource<<8a709fbf0bc5d82c7f5420c7a27cf04b>>
 * @relayHash 51d52d48ef78c496e8b2f1ca9c16fa4c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 51d52d48ef78c496e8b2f1ca9c16fa4c

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type LockReason = "OFF_TOPIC" | "RESOLVED" | "SPAM" | "TOO_HEATED" | "%future added value";
export type LockLockableInput = {
  clientMutationId?: string | null | undefined;
  lockReason?: LockReason | null | undefined;
  lockableId: string;
};
export type lockLockableMutation$variables = {
  input: LockLockableInput;
};
export type lockLockableMutation$data = {
  readonly lockLockable: {
    readonly lockedRecord: {
      readonly locked?: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type lockLockableMutation$rawResponse = {
  readonly lockLockable: {
    readonly lockedRecord: {
      readonly __typename: "Issue";
      readonly __isNode: "Issue";
      readonly id: string;
      readonly locked: boolean;
    } | {
      readonly __typename: string;
      readonly __isNode: string;
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type lockLockableMutation = {
  rawResponse: lockLockableMutation$rawResponse;
  response: lockLockableMutation$data;
  variables: lockLockableMutation$variables;
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
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "locked",
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "lockLockableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "LockLockablePayload",
        "kind": "LinkedField",
        "name": "lockLockable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "lockedRecord",
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
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "lockLockableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "LockLockablePayload",
        "kind": "LinkedField",
        "name": "lockLockable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "lockedRecord",
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
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "type": "Node",
                "abstractKey": "__isNode"
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
    "id": "51d52d48ef78c496e8b2f1ca9c16fa4c",
    "metadata": {},
    "name": "lockLockableMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "e04343a36495fed9a45144b2d8c84a3e";

export default node;
