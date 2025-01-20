/**
 * @generated SignedSource<<9172b647cbc5730aa0af8401ff90e2ad>>
 * @relayHash 01605ebfa9a57f7c60a96f03bb4ad2c3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 01605ebfa9a57f7c60a96f03bb4ad2c3

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ApplySuggestedChangesInput = {
  changes: ReadonlyArray<SuggestedChange>;
  clientMutationId?: string | null | undefined;
  currentOID: any;
  message?: string | null | undefined;
  pullRequestId: string;
  sign?: boolean | null | undefined;
};
export type SuggestedChange = {
  commentId: string;
  path: string;
  suggestion?: ReadonlyArray<string> | null | undefined;
};
export type applySuggestedChangesMutation$variables = {
  input: ApplySuggestedChangesInput;
};
export type applySuggestedChangesMutation$data = {
  readonly applySuggestedChanges: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type applySuggestedChangesMutation$rawResponse = {
  readonly applySuggestedChanges: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type applySuggestedChangesMutation = {
  rawResponse: applySuggestedChangesMutation$rawResponse;
  response: applySuggestedChangesMutation$data;
  variables: applySuggestedChangesMutation$variables;
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
    "concreteType": "ApplySuggestedChangesPayload",
    "kind": "LinkedField",
    "name": "applySuggestedChanges",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
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
    "name": "applySuggestedChangesMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "applySuggestedChangesMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "01605ebfa9a57f7c60a96f03bb4ad2c3",
    "metadata": {},
    "name": "applySuggestedChangesMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "6cd2571b8583a65516bf21361a3a8d01";

export default node;
