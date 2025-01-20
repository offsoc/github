/**
 * @generated SignedSource<<a45c7016430d47239178f2649e9c2453>>
 * @relayHash 75024588fd4e947efce37d5062467722
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 75024588fd4e947efce37d5062467722

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteProjectCardInput = {
  cardId: string;
  clientMutationId?: string | null | undefined;
};
export type deleteIssueFromClassicProjectMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeleteProjectCardInput;
};
export type deleteIssueFromClassicProjectMutation$data = {
  readonly deleteProjectCard: {
    readonly deletedCardId: string | null | undefined;
  } | null | undefined;
};
export type deleteIssueFromClassicProjectMutation$rawResponse = {
  readonly deleteProjectCard: {
    readonly deletedCardId: string | null | undefined;
  } | null | undefined;
};
export type deleteIssueFromClassicProjectMutation = {
  rawResponse: deleteIssueFromClassicProjectMutation$rawResponse;
  response: deleteIssueFromClassicProjectMutation$data;
  variables: deleteIssueFromClassicProjectMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedCardId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "deleteIssueFromClassicProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteProjectCardPayload",
        "kind": "LinkedField",
        "name": "deleteProjectCard",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "deleteIssueFromClassicProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeleteProjectCardPayload",
        "kind": "LinkedField",
        "name": "deleteProjectCard",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedCardId",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "75024588fd4e947efce37d5062467722",
    "metadata": {},
    "name": "deleteIssueFromClassicProjectMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "3f5c530081d239bc64fe63b1098b886a";

export default node;
