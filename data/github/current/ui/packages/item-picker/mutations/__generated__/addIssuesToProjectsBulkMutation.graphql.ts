/**
 * @generated SignedSource<<9e155735b6b36bba175eaa440c212c18>>
 * @relayHash 6908509fc024e1ab74ffec2140dcf167
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 6908509fc024e1ab74ffec2140dcf167

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
export type addIssuesToProjectsBulkMutation$variables = {
  input: UpdateIssuesBulkInput;
};
export type addIssuesToProjectsBulkMutation$data = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type addIssuesToProjectsBulkMutation$rawResponse = {
  readonly updateIssuesBulk: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type addIssuesToProjectsBulkMutation = {
  rawResponse: addIssuesToProjectsBulkMutation$rawResponse;
  response: addIssuesToProjectsBulkMutation$data;
  variables: addIssuesToProjectsBulkMutation$variables;
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
    "name": "addIssuesToProjectsBulkMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "addIssuesToProjectsBulkMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "6908509fc024e1ab74ffec2140dcf167",
    "metadata": {},
    "name": "addIssuesToProjectsBulkMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "63b0539aebe1a9b04411550192d240e1";

export default node;
