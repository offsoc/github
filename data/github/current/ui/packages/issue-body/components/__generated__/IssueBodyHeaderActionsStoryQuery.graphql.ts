/**
 * @generated SignedSource<<a00f4cc54528c8a7053f234552f70db0>>
 * @relayHash f1b4217297a900367f4c850ddf490112
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f1b4217297a900367f4c850ddf490112

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBodyHeaderActionsStoryQuery$variables = Record<PropertyKey, never>;
export type IssueBodyHeaderActionsStoryQuery$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderActions">;
  } | null | undefined;
};
export type IssueBodyHeaderActionsStoryQuery = {
  response: IssueBodyHeaderActionsStoryQuery$data;
  variables: IssueBodyHeaderActionsStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "abc"
  }
],
v1 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueBodyHeaderActionsStoryQuery",
    "selections": [
      {
        "alias": "author",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueBodyHeaderActions"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"abc\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueBodyHeaderActionsStoryQuery",
    "selections": [
      {
        "alias": "author",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "login",
                    "storageKey": null
                  }
                ],
                "type": "Actor",
                "abstractKey": "__isActor"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"abc\")"
      }
    ]
  },
  "params": {
    "id": "f1b4217297a900367f4c850ddf490112",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "author.__isActor": (v1/*: any*/),
        "author.__typename": (v1/*: any*/),
        "author.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "author.login": (v1/*: any*/)
      }
    },
    "name": "IssueBodyHeaderActionsStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "c91ff3aa0e8e61c14da485487e8f1748";

export default node;
