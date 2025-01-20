/**
 * @generated SignedSource<<e1c885fe26467a5838fe7f5bc04bc0c9>>
 * @relayHash 78c5df54b80541d4bd39f53a5332f28c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 78c5df54b80541d4bd39f53a5332f28c

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClassicProjectItemTestQuery$variables = Record<PropertyKey, never>;
export type ClassicProjectItemTestQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"ClassicProjectItem">;
  } | null | undefined;
};
export type ClassicProjectItemTestQuery = {
  response: ClassicProjectItemTestQuery$data;
  variables: ClassicProjectItemTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "classic_project_item1"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v2/*: any*/),
  (v1/*: any*/)
],
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
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
    "name": "ClassicProjectItemTestQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "ClassicProjectItem"
          }
        ],
        "storageKey": "node(id:\"classic_project_item1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ClassicProjectItemTestQuery",
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
                "concreteType": "Project",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "url",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 10
                      }
                    ],
                    "concreteType": "ProjectColumnConnection",
                    "kind": "LinkedField",
                    "name": "columns",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectColumn",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v3/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": "columns(first:10)"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectColumn",
                "kind": "LinkedField",
                "name": "column",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              }
            ],
            "type": "ProjectCard",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"classic_project_item1\")"
      }
    ]
  },
  "params": {
    "id": "78c5df54b80541d4bd39f53a5332f28c",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v4/*: any*/),
        "node.column": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectColumn"
        },
        "node.column.id": (v5/*: any*/),
        "node.column.name": (v4/*: any*/),
        "node.id": (v5/*: any*/),
        "node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Project"
        },
        "node.project.columns": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectColumnConnection"
        },
        "node.project.columns.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ProjectColumn"
        },
        "node.project.columns.nodes.id": (v5/*: any*/),
        "node.project.columns.nodes.name": (v4/*: any*/),
        "node.project.id": (v5/*: any*/),
        "node.project.name": (v4/*: any*/),
        "node.project.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        }
      }
    },
    "name": "ClassicProjectItemTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "eaa5283bc61f26378b9071e323150d54";

export default node;
