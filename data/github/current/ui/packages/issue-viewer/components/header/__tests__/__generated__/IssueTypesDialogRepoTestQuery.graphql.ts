/**
 * @generated SignedSource<<71f596834d2e4eee9bb0eda9dabb3295>>
 * @relayHash e556bd4fa534cbbaed2cb5c5734b8a95
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID e556bd4fa534cbbaed2cb5c5734b8a95

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueTypesDialogRepoTestQuery$variables = Record<PropertyKey, never>;
export type IssueTypesDialogRepoTestQuery$data = {
  readonly repository: {
    readonly issueTypes: {
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypesDialogIssueTypes">;
    } | null | undefined;
  } | null | undefined;
};
export type IssueTypesDialogRepoTestQuery = {
  response: IssueTypesDialogRepoTestQuery$data;
  variables: IssueTypesDialogRepoTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "github"
  },
  {
    "kind": "Literal",
    "name": "owner",
    "value": "cool-repo"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
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
    "name": "IssueTypesDialogRepoTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "IssueTypeConnection",
            "kind": "LinkedField",
            "name": "issueTypes",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueTypesDialogIssueTypes"
              }
            ],
            "storageKey": "issueTypes(first:10)"
          }
        ],
        "storageKey": "repository(name:\"github\",owner:\"cool-repo\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueTypesDialogRepoTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "IssueTypeConnection",
            "kind": "LinkedField",
            "name": "issueTypes",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "IssueType",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "color",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isEnabled",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "issueTypes(first:10)"
          },
          (v2/*: any*/)
        ],
        "storageKey": "repository(name:\"github\",owner:\"cool-repo\")"
      }
    ]
  },
  "params": {
    "id": "e556bd4fa534cbbaed2cb5c5734b8a95",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.id": (v3/*: any*/),
        "repository.issueTypes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueTypeConnection"
        },
        "repository.issueTypes.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueType"
        },
        "repository.issueTypes.nodes.color": {
          "enumValues": [
            "BLUE",
            "GRAY",
            "GREEN",
            "ORANGE",
            "PINK",
            "PURPLE",
            "RED",
            "YELLOW"
          ],
          "nullable": false,
          "plural": false,
          "type": "IssueTypeColor"
        },
        "repository.issueTypes.nodes.description": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "repository.issueTypes.nodes.id": (v3/*: any*/),
        "repository.issueTypes.nodes.isEnabled": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "repository.issueTypes.nodes.name": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "IssueTypesDialogRepoTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "748c7de3dbcef419cfae6d3c86672551";

export default node;
