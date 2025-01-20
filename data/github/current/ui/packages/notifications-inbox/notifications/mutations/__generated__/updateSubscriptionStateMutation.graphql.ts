/**
 * @generated SignedSource<<63f505dd6bfb153f8e6aea5ecab56a84>>
 * @relayHash 7ad732bd573a11585802c33d00a1b97e
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7ad732bd573a11585802c33d00a1b97e

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CustomSubscriptionType = "DISCUSSION" | "ISSUE" | "PULL_REQUEST" | "RELEASE" | "SECURITY_ALERT" | "%future added value";
export type SubscriptionState = "CUSTOM" | "IGNORED" | "RELEASES_ONLY" | "SUBSCRIBED" | "UNSUBSCRIBED" | "%future added value";
export type UpdateSubscriptionInput = {
  clientMutationId?: string | null | undefined;
  state: SubscriptionState;
  subscribableId: string;
  types?: ReadonlyArray<CustomSubscriptionType> | null | undefined;
};
export type updateSubscriptionStateMutation$variables = {
  input: UpdateSubscriptionInput;
};
export type updateSubscriptionStateMutation$data = {
  readonly updateSubscription: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type updateSubscriptionStateMutation$rawResponse = {
  readonly updateSubscription: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type updateSubscriptionStateMutation = {
  rawResponse: updateSubscriptionStateMutation$rawResponse;
  response: updateSubscriptionStateMutation$data;
  variables: updateSubscriptionStateMutation$variables;
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
    "concreteType": "UpdateSubscriptionPayload",
    "kind": "LinkedField",
    "name": "updateSubscription",
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
    "name": "updateSubscriptionStateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateSubscriptionStateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "7ad732bd573a11585802c33d00a1b97e",
    "metadata": {},
    "name": "updateSubscriptionStateMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "02c3f244c42aaacb4f8ee42dfcbec25d";

export default node;
