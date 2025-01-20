/**
 * @generated SignedSource<<655267a073dfab6baaf36470f2ef7434>>
 * @relayHash 543338351ad820d1076f0627214327be
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 543338351ad820d1076f0627214327be

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiscussionCategoryPickerTestQuery$variables = {
  first: number;
  owner: string;
  repo: string;
};
export type DiscussionCategoryPickerTestQuery$data = {
  readonly repository: {
    readonly " $fragmentSpreads": FragmentRefs<"DiscussionCategoryPickerDiscussionCategories">;
  } | null | undefined;
};
export type DiscussionCategoryPickerTestQuery = {
  response: DiscussionCategoryPickerTestQuery$data;
  variables: DiscussionCategoryPickerTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DiscussionCategoryPickerTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DiscussionCategoryPickerDiscussionCategories"
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "DiscussionCategoryPickerTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "filterByAssignable",
                "value": true
              },
              {
                "kind": "Variable",
                "name": "first",
                "variableName": "first"
              }
            ],
            "concreteType": "DiscussionCategoryConnection",
            "kind": "LinkedField",
            "name": "discussionCategories",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DiscussionCategoryEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "DiscussionCategory",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "543338351ad820d1076f0627214327be",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.discussionCategories": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DiscussionCategoryConnection"
        },
        "repository.discussionCategories.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "DiscussionCategoryEdge"
        },
        "repository.discussionCategories.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DiscussionCategory"
        },
        "repository.discussionCategories.edges.node.id": (v5/*: any*/),
        "repository.discussionCategories.edges.node.name": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "repository.id": (v5/*: any*/)
      }
    },
    "name": "DiscussionCategoryPickerTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "28cb3137b2718177889a33828bb2e88e";

export default node;
