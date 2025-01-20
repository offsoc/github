/**
 * @generated SignedSource<<42a41d5ef759afc4395c16ab285ee132>>
 * @relayHash 91480cee581058e8a5fd0c71cab52af9
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 91480cee581058e8a5fd0c71cab52af9

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DiscussionCategoryPickerStoryQuery$variables = {
  first: number;
  owner: string;
  repo: string;
};
export type DiscussionCategoryPickerStoryQuery$data = {
  readonly repository: {
    readonly " $fragmentSpreads": FragmentRefs<"DiscussionCategoryPickerDiscussionCategories">;
  } | null | undefined;
};
export type DiscussionCategoryPickerStoryQuery = {
  response: DiscussionCategoryPickerStoryQuery$data;
  variables: DiscussionCategoryPickerStoryQuery$variables;
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
    "name": "DiscussionCategoryPickerStoryQuery",
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
    "name": "DiscussionCategoryPickerStoryQuery",
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
    "id": "91480cee581058e8a5fd0c71cab52af9",
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
    "name": "DiscussionCategoryPickerStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "52a3796e4f15130e7cd318341c9690d2";

export default node;
