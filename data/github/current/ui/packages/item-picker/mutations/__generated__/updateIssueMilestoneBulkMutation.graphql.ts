/**
 * @generated SignedSource<<5decefeaef03331da8585f274bc93cb9>>
 * @relayHash b4a8d70a2993b3985ea6c33da5dff412
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b4a8d70a2993b3985ea6c33da5dff412

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
export type updateIssueMilestoneBulkMutation$variables = {
  input: UpdateIssuesBulkInput;
};
export type updateIssueMilestoneBulkMutation$data = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueMilestoneBulkMutation$rawResponse = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueMilestoneBulkMutation = {
  rawResponse: updateIssueMilestoneBulkMutation$rawResponse;
  response: updateIssueMilestoneBulkMutation$data;
  variables: updateIssueMilestoneBulkMutation$variables;
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
    "name": "updateIssueMilestoneBulkMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueMilestoneBulkMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "b4a8d70a2993b3985ea6c33da5dff412",
    "metadata": {},
    "name": "updateIssueMilestoneBulkMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "8f0efbb3c0daeec3d566120b9ab8b7f3";

export default node;
