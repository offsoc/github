/**
 * @generated SignedSource<<a6a704d31bfafea48b1f27a915552535>>
 * @relayHash 9ef106ee92414640a838c24d1eb80da7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9ef106ee92414640a838c24d1eb80da7

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueClosedStateReason = "COMPLETED" | "NOT_PLANNED" | "%future added value";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type UpdateIssuesBulkInput = {
  addToProjectV2Ids?: ReadonlyArray<string> | null | undefined;
  applyAssigneeIds?: ReadonlyArray<string> | null | undefined;
  applyLabelIds?: ReadonlyArray<string> | null | undefined;
  clearMilestone?: boolean | null | undefined;
  clientMutationId?: string | null | undefined;
  ids: ReadonlyArray<string>;
  issueTypeId?: string | null | undefined;
  milestoneId?: string | null | undefined;
  removeAssigneeIds?: ReadonlyArray<string> | null | undefined;
  removeFromProjectV2Ids?: ReadonlyArray<string> | null | undefined;
  removeLabelIds?: ReadonlyArray<string> | null | undefined;
  state?: IssueState | null | undefined;
  stateReason?: IssueClosedStateReason | null | undefined;
  unsetIssueType?: boolean | null | undefined;
};
export type updateIssueLabelsBulkMutation$variables = {
  input: UpdateIssuesBulkInput;
};
export type updateIssueLabelsBulkMutation$data = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueLabelsBulkMutation$rawResponse = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueLabelsBulkMutation = {
  rawResponse: updateIssueLabelsBulkMutation$rawResponse;
  response: updateIssueLabelsBulkMutation$data;
  variables: updateIssueLabelsBulkMutation$variables;
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
    "concreteType": "UpdateIssuesBulkPayload",
    "kind": "LinkedField",
    "name": "updateIssuesBulk",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "jobId",
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
    "name": "updateIssueLabelsBulkMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueLabelsBulkMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "9ef106ee92414640a838c24d1eb80da7",
    "metadata": {},
    "name": "updateIssueLabelsBulkMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "f8114faeed7756ecaffd9baca9e555e5";

export default node;
