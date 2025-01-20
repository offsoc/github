/**
 * @generated SignedSource<<fe4fa8837d24a375e3bd49bbdfeb0a36>>
 * @relayHash 81d7ed8a6e6b63c1b5a5f777e63cf5d2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 81d7ed8a6e6b63c1b5a5f777e63cf5d2

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
export type updateIssueAssigneesBulkMutation$variables = {
  input: UpdateIssuesBulkInput;
};
export type updateIssueAssigneesBulkMutation$data = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueAssigneesBulkMutation$rawResponse = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueAssigneesBulkMutation = {
  rawResponse: updateIssueAssigneesBulkMutation$rawResponse;
  response: updateIssueAssigneesBulkMutation$data;
  variables: updateIssueAssigneesBulkMutation$variables;
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
    "name": "updateIssueAssigneesBulkMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueAssigneesBulkMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "81d7ed8a6e6b63c1b5a5f777e63cf5d2",
    "metadata": {},
    "name": "updateIssueAssigneesBulkMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0ba96eec20babdc2170405884532fc45";

export default node;
