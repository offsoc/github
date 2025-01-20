/**
 * @generated SignedSource<<08ac1478ce32a6804587643f4f549aa0>>
 * @relayHash 41e55d2e790f170bad27b854a1da0756
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 41e55d2e790f170bad27b854a1da0756

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueTypesDialogIssueTestQuery$variables = Record<PropertyKey, never>;
export type IssueTypesDialogIssueTestQuery$data = {
  readonly node: {
    readonly issueType?: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypesDialogIssueType">;
    } | null | undefined;
  } | null | undefined;
};
export type IssueTypesDialogIssueTestQuery = {
  response: IssueTypesDialogIssueTestQuery$data;
  variables: IssueTypesDialogIssueTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "I_1234"
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
    "name": "IssueTypesDialogIssueTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueType",
                "kind": "LinkedField",
                "name": "issueType",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "IssueTypesDialogIssueType"
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Issue",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"I_1234\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueTypesDialogIssueTestQuery",
    "selections": [
      {
        "alias": null,
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
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueType",
                "kind": "LinkedField",
                "name": "issueType",
                "plural": false,
                "selections": [
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Issue",
            "abstractKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"I_1234\")"
      }
    ]
  },
  "params": {
    "id": "41e55d2e790f170bad27b854a1da0756",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "node.id": (v2/*: any*/),
        "node.issueType": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueType"
        },
        "node.issueType.id": (v2/*: any*/)
      }
    },
    "name": "IssueTypesDialogIssueTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "94c504ee1c89ac970a93a84426550f1c";

export default node;
