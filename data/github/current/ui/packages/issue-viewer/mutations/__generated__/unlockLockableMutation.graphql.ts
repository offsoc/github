/**
 * @generated SignedSource<<8cdad74348d3143562dcf0124a245a77>>
 * @relayHash 6f0faa96940cf1b4018ce92434b218eb
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6f0faa96940cf1b4018ce92434b218eb

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnlockLockableInput = {
  clientMutationId?: string | null | undefined;
  lockableId: string;
};
export type unlockLockableMutation$variables = {
  input: UnlockLockableInput;
};
export type unlockLockableMutation$data = {
  readonly unlockLockable: {
    readonly unlockedRecord: {
      readonly locked?: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type unlockLockableMutation$rawResponse = {
  readonly unlockLockable: {
    readonly unlockedRecord: {
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
export type unlockLockableMutation = {
  rawResponse: unlockLockableMutation$rawResponse;
  response: unlockLockableMutation$data;
  variables: unlockLockableMutation$variables;
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
    "name": "unlockLockableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnlockLockablePayload",
        "kind": "LinkedField",
        "name": "unlockLockable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "unlockedRecord",
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
    "name": "unlockLockableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnlockLockablePayload",
        "kind": "LinkedField",
        "name": "unlockLockable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "unlockedRecord",
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
    "id": "6f0faa96940cf1b4018ce92434b218eb",
    "metadata": {},
    "name": "unlockLockableMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "34e21dfc29143cca408e732be35ca356";

export default node;
