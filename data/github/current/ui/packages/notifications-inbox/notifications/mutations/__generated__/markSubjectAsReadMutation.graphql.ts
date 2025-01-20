/**
 * @generated SignedSource<<dc3d55f064f426946d272c50ba9f0d2f>>
 * @relayHash 8140aea3996554ab8723b43e25ab40dc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8140aea3996554ab8723b43e25ab40dc

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkNotificationSubjectAsReadInput = {
  clientMutationId?: string | null | undefined;
  subjectId: string;
};
export type markSubjectAsReadMutation$variables = {
  input: MarkNotificationSubjectAsReadInput;
};
export type markSubjectAsReadMutation$data = {
  readonly markNotificationSubjectAsRead: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markSubjectAsReadMutation$rawResponse = {
  readonly markNotificationSubjectAsRead: {
    readonly success: boolean | null | undefined;
  } | null | undefined;
};
export type markSubjectAsReadMutation = {
  rawResponse: markSubjectAsReadMutation$rawResponse;
  response: markSubjectAsReadMutation$data;
  variables: markSubjectAsReadMutation$variables;
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
    "concreteType": "MarkNotificationSubjectAsReadPayload",
    "kind": "LinkedField",
    "name": "markNotificationSubjectAsRead",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "markSubjectAsReadMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "markSubjectAsReadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "8140aea3996554ab8723b43e25ab40dc",
    "metadata": {},
    "name": "markSubjectAsReadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "3d3e15b0cb9414175afea4d766afa4a8";

export default node;
