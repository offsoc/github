/**
 * @generated SignedSource<<812af7eb8dd5800aeaa197dfae9813a1>>
 * @relayHash cc2dfdd4807633d71341d55e85bdcec5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID cc2dfdd4807633d71341d55e85bdcec5

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type BlockFromOrganizationDuration = "INDEFINITE" | "ONE_DAY" | "SEVEN_DAYS" | "THIRTY_DAYS" | "THREE_DAYS" | "%future added value";
export type ReportedContentClassifiers = "ABUSE" | "DUPLICATE" | "OFF_TOPIC" | "OUTDATED" | "RESOLVED" | "SPAM" | "%future added value";
export type BlockUserFromOrganizationInput = {
  blockedUserId: string;
  clientMutationId?: string | null | undefined;
  contentId?: string | null | undefined;
  duration: BlockFromOrganizationDuration;
  hiddenReason?: ReportedContentClassifiers | null | undefined;
  notifyBlockedUser?: boolean | null | undefined;
  organizationId: string;
};
export type blockUserFromOrganizationMutation$variables = {
  input: BlockUserFromOrganizationInput;
};
export type blockUserFromOrganizationMutation$data = {
  readonly blockUserFromOrganization: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type blockUserFromOrganizationMutation$rawResponse = {
  readonly blockUserFromOrganization: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type blockUserFromOrganizationMutation = {
  rawResponse: blockUserFromOrganizationMutation$rawResponse;
  response: blockUserFromOrganizationMutation$data;
  variables: blockUserFromOrganizationMutation$variables;
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
    "concreteType": "BlockUserFromOrganizationPayload",
    "kind": "LinkedField",
    "name": "blockUserFromOrganization",
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
    "name": "blockUserFromOrganizationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "blockUserFromOrganizationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "cc2dfdd4807633d71341d55e85bdcec5",
    "metadata": {},
    "name": "blockUserFromOrganizationMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "1cc6b979024f82ac249a77676892c1f0";

export default node;
