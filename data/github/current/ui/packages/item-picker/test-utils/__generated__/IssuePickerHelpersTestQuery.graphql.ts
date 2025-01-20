/**
 * @generated SignedSource<<8ad388b3a57e0ff5f3ac176a897f8088>>
 * @relayHash 549032cc463ee1eabb647a8a3f52ea57
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 549032cc463ee1eabb647a8a3f52ea57

import { ConcreteRequest, Query } from 'relay-runtime';
export type IssuePickerHelpersTestQuery$variables = Record<PropertyKey, never>;
export type IssuePickerHelpersTestQuery$data = {
  readonly issue: {
    readonly subIssues?: {
      readonly nodes: ReadonlyArray<{
        readonly id: string;
      } | null | undefined> | null | undefined;
    };
  } | null | undefined;
};
export type IssuePickerHelpersTestQuery = {
  response: IssuePickerHelpersTestQuery$data;
  variables: IssuePickerHelpersTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-issue-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 50
        }
      ],
      "concreteType": "IssueConnection",
      "kind": "LinkedField",
      "name": "subIssues",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Issue",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": "subIssues(first:50)"
    }
  ],
  "type": "Issue",
  "abstractKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssuePickerHelpersTestQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"test-issue-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssuePickerHelpersTestQuery",
    "selections": [
      {
        "alias": "issue",
        "args": (v0/*: any*/),
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
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"test-issue-id\")"
      }
    ]
  },
  "params": {
    "id": "549032cc463ee1eabb647a8a3f52ea57",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "issue.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "issue.id": (v3/*: any*/),
        "issue.subIssues": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueConnection"
        },
        "issue.subIssues.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Issue"
        },
        "issue.subIssues.nodes.id": (v3/*: any*/)
      }
    },
    "name": "IssuePickerHelpersTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1a61c8736f6af468d91f83cdf1bad59d";

export default node;
