/**
 * @generated SignedSource<<cedac2d6a088ac63328d568bb3fd0c2f>>
 * @relayHash 426a619c52646608c381f8ebf2927e90
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 426a619c52646608c381f8ebf2927e90

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
export type updateIssueIssueTypeBulkByQueryMutation$variables = {
  input: UpdateIssuesBulkByQueryInput;
};
export type updateIssueIssueTypeBulkByQueryMutation$data = {
  readonly updateIssuesBulkByQuery: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueIssueTypeBulkByQueryMutation$rawResponse = {
  readonly updateIssuesBulkByQuery: {
    readonly jobId: string | null | undefined;
  } | null | undefined;
};
export type updateIssueIssueTypeBulkByQueryMutation = {
  rawResponse: updateIssueIssueTypeBulkByQueryMutation$rawResponse;
  response: updateIssueIssueTypeBulkByQueryMutation$data;
  variables: updateIssueIssueTypeBulkByQueryMutation$variables;
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
    "name": "updateIssueIssueTypeBulkByQueryMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "updateIssueIssueTypeBulkByQueryMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "426a619c52646608c381f8ebf2927e90",
    "metadata": {},
    "name": "updateIssueIssueTypeBulkByQueryMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "73076489d1e36668033ad5ed8e6224de";

export default node;
