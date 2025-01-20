/**
 * @generated SignedSource<<0f342d2b48dc21fc1c15a9f6b92dc7a6>>
 * @relayHash 0603fe0f6dabc68adea31e484c57deb7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 0603fe0f6dabc68adea31e484c57deb7

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type AbuseReportReason = "ABUSE" | "OFF_TOPIC" | "SPAM" | "UNSPECIFIED" | "%future added value";
export type SubmitAbuseReportInput = {
  clientMutationId?: string | null | undefined;
  reason: AbuseReportReason;
  reportedContent: string;
};
export type submitAbuseReportMutation$variables = {
  input: SubmitAbuseReportInput;
};
export type submitAbuseReportMutation$data = {
  readonly submitAbuseReport: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type submitAbuseReportMutation$rawResponse = {
  readonly submitAbuseReport: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type submitAbuseReportMutation = {
  rawResponse: submitAbuseReportMutation$rawResponse;
  response: submitAbuseReportMutation$data;
  variables: submitAbuseReportMutation$variables;
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
    "concreteType": "SubmitAbuseReportPayload",
    "kind": "LinkedField",
    "name": "submitAbuseReport",
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
    "name": "submitAbuseReportMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "submitAbuseReportMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "0603fe0f6dabc68adea31e484c57deb7",
    "metadata": {},
    "name": "submitAbuseReportMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "8b252221b8eab001809aa2a2d583cb84";

export default node;
