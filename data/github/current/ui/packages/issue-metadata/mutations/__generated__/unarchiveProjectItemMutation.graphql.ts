/**
 * @generated SignedSource<<f8f26c07c33e2476dab94c18bac74a4c>>
 * @relayHash 1d1e59700f5c9977430696b2338a0674
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1d1e59700f5c9977430696b2338a0674

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UnarchiveProjectV2ItemInput = {
  clientMutationId?: string | null | undefined;
  itemId: string;
  projectId: string;
};
export type unarchiveProjectItemMutation$variables = {
  input: UnarchiveProjectV2ItemInput;
};
export type unarchiveProjectItemMutation$data = {
  readonly unarchiveProjectV2Item: {
    readonly item: {
      readonly isArchived: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type unarchiveProjectItemMutation$rawResponse = {
  readonly unarchiveProjectV2Item: {
    readonly item: {
      readonly id: string;
      readonly isArchived: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type unarchiveProjectItemMutation = {
  rawResponse: unarchiveProjectItemMutation$rawResponse;
  response: unarchiveProjectItemMutation$data;
  variables: unarchiveProjectItemMutation$variables;
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isArchived",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unarchiveProjectItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnarchiveProjectV2ItemPayload",
        "kind": "LinkedField",
        "name": "unarchiveProjectV2Item",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2Item",
            "kind": "LinkedField",
            "name": "item",
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
    "name": "unarchiveProjectItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnarchiveProjectV2ItemPayload",
        "kind": "LinkedField",
        "name": "unarchiveProjectV2Item",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2Item",
            "kind": "LinkedField",
            "name": "item",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
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
    "id": "1d1e59700f5c9977430696b2338a0674",
    "metadata": {},
    "name": "unarchiveProjectItemMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "774df17c4810f952c016355065fbcd6c";

export default node;
