/**
 * @generated SignedSource<<23442c1e6a2884a4c363a318c5a3f88b>>
 * @relayHash cdc2c4b69492faa142269c6a6a60df92
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cdc2c4b69492faa142269c6a6a60df92

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteProjectV2ItemInput = {
  clientMutationId?: string | null | undefined;
  itemId: string;
  projectId: string;
};
export type deleteIssueProjectsMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteProjectV2ItemInput;
};
export type deleteIssueProjectsMutation$data = {
  readonly deleteProjectV2Item: {
    readonly deletedItemId: string | null | undefined;
  } | null | undefined;
};
export type deleteIssueProjectsMutation = {
  response: deleteIssueProjectsMutation$data;
  variables: deleteIssueProjectsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
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
  "name": "deletedItemId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteIssueProjectsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteProjectV2ItemPayload",
        "kind": "LinkedField",
        "name": "deleteProjectV2Item",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "deleteIssueProjectsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteProjectV2ItemPayload",
        "kind": "LinkedField",
        "name": "deleteProjectV2Item",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedItemId",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "cdc2c4b69492faa142269c6a6a60df92",
    "metadata": {},
    "name": "deleteIssueProjectsMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b546b455603fb197fd8347b4cec2351a";

export default node;
