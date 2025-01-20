/**
 * @generated SignedSource<<975a812764458f9f5a70be9901beea27>>
 * @relayHash 2450a4a64f1dc63de57eacac2fcd3f9f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 2450a4a64f1dc63de57eacac2fcd3f9f

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type deleteProjectV2WorkflowByNumberMutation$variables = {
  projectId: string;
  workflowNumber: number;
};
export type deleteProjectV2WorkflowByNumberMutation$data = {
  readonly deleteProjectV2WorkflowByNumber: {
    readonly deletedWorkflowId: string | null | undefined;
  } | null | undefined;
};
export type deleteProjectV2WorkflowByNumberMutation$rawResponse = {
  readonly deleteProjectV2WorkflowByNumber: {
    readonly deletedWorkflowId: string | null | undefined;
  } | null | undefined;
};
export type deleteProjectV2WorkflowByNumberMutation = {
  rawResponse: deleteProjectV2WorkflowByNumberMutation$rawResponse;
  response: deleteProjectV2WorkflowByNumberMutation$data;
  variables: deleteProjectV2WorkflowByNumberMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "workflowNumber"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "number",
            "variableName": "workflowNumber"
          },
          {
            "kind": "Variable",
            "name": "projectId",
            "variableName": "projectId"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "DeleteProjectV2WorkflowByNumberPayload",
    "kind": "LinkedField",
    "name": "deleteProjectV2WorkflowByNumber",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedWorkflowId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteProjectV2WorkflowByNumberMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "deleteProjectV2WorkflowByNumberMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "id": "2450a4a64f1dc63de57eacac2fcd3f9f",
    "metadata": {},
    "name": "deleteProjectV2WorkflowByNumberMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "5ccdf246729b2e483d88018a9460db8b";

export default node;
