/**
 * @generated SignedSource<<04b456aa28e50e89ca65bf395ee7379d>>
 * @relayHash 13289f2be3dcbcccc3cca472a24041b5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 13289f2be3dcbcccc3cca472a24041b5

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type IssueClosedStateReason = "COMPLETED" | "NOT_PLANNED" | "%future added value";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type UpdateIssuesBulkByQueryInput = {
  addToProjectV2Ids?: ReadonlyArray<string> | null | undefined;
  applyAssigneeIds?: ReadonlyArray<string> | null | undefined;
  applyLabelIds?: ReadonlyArray<string> | null | undefined;
  clearMilestone?: boolean | null | undefined;
  clientMutationId?: string | null | undefined;
  issueTypeId?: string | null | undefined;
  milestoneId?: string | null | undefined;
  query: string;
  removeAssigneeIds?: ReadonlyArray<string> | null | undefined;
  removeFromProjectV2Ids?: ReadonlyArray<string> | null | undefined;
  removeLabelIds?: ReadonlyArray<string> | null | undefined;
  repositoryId: string;
  state?: IssueState | null | undefined;
  stateReason?: IssueClosedStateReason | null | undefined;
  unsetIssueType?: boolean | null | undefined;
};
export type updateIssuesBulkByQueryMutation$variables = {
  input: UpdateIssuesBulkByQueryInput;
};
export type updateIssuesBulkByQueryMutation$data = {
  readonly updateIssuesBulkByQuery: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssuesBulkByQueryMutation$rawResponse = {
  readonly updateIssuesBulkByQuery: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssuesBulkByQueryMutation = {
  rawResponse: updateIssuesBulkByQueryMutation$rawResponse;
  response: updateIssuesBulkByQueryMutation$data;
  variables: updateIssuesBulkByQueryMutation$variables;
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
    "concreteType": "UpdateIssuesBulkByQueryPayload",
    "kind": "LinkedField",
    "name": "updateIssuesBulkByQuery",
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
    "name": "updateIssuesBulkByQueryMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssuesBulkByQueryMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "13289f2be3dcbcccc3cca472a24041b5",
    "metadata": {},
    "name": "updateIssuesBulkByQueryMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b5b362169b219d07273b6580fea417a0";

export default node;
