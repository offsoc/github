/**
 * @generated SignedSource<<783969c044e6754ea34de1a16fb88151>>
 * @relayHash 7455571275edb130f247e290e27105e3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 7455571275edb130f247e290e27105e3

import { ConcreteRequest, Query } from 'relay-runtime';
export type AddSubIssueButtonGroupQuery$variables = {
  issueId: string;
};
export type AddSubIssueButtonGroupQuery$data = {
  readonly node: {
    readonly id?: string;
    readonly parent?: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type AddSubIssueButtonGroupQuery = {
  response: AddSubIssueButtonGroupQuery$data;
  variables: AddSubIssueButtonGroupQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "issueId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "issueId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Issue",
  "kind": "LinkedField",
  "name": "parent",
  "plural": false,
  "selections": [
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AddSubIssueButtonGroupQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AddSubIssueButtonGroupQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "7455571275edb130f247e290e27105e3",
    "metadata": {},
    "name": "AddSubIssueButtonGroupQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "247e55e89e2404975cba5c608bd28df0";

export default node;
