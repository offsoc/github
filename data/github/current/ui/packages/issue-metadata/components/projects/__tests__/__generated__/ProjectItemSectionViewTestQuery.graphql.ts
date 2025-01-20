/**
 * @generated SignedSource<<aaeba3cd9ded50e63441de8584ade622>>
 * @relayHash ae867079d5e28b86561867090a013723
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ae867079d5e28b86561867090a013723

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSectionViewTestQuery$variables = Record<PropertyKey, never>;
export type ProjectItemSectionViewTestQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionView">;
  } | null | undefined;
};
export type ProjectItemSectionViewTestQuery = {
  response: ProjectItemSectionViewTestQuery$data;
  variables: ProjectItemSectionViewTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "project_item1"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
  {
    "kind": "Literal",
    "name": "name",
    "value": "Status"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "optionId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    (v2/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v10 = {
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
  "type": "ProjectV2SingleSelectFieldOptionColor"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectItemSectionViewTestQuery",
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
            "name": "ProjectItemSectionView"
          }
        ],
        "storageKey": "node(id:\"project_item1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProjectItemSectionViewTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isArchived",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2",
                "kind": "LinkedField",
                "name": "project",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "template",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanUpdate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "url",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "field",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v2/*: any*/),
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ProjectV2SingleSelectFieldOption",
                            "kind": "LinkedField",
                            "name": "options",
                            "plural": true,
                            "selections": [
                              (v2/*: any*/),
                              (v5/*: any*/),
                              (v4/*: any*/),
                              (v6/*: any*/),
                              (v7/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "descriptionHTML",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "description",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "ProjectV2SingleSelectField",
                        "abstractKey": null
                      },
                      (v8/*: any*/)
                    ],
                    "storageKey": "field(name:\"Status\")"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "fieldValueByName",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v4/*: any*/),
                      (v6/*: any*/),
                      (v7/*: any*/)
                    ],
                    "type": "ProjectV2ItemFieldSingleSelectValue",
                    "abstractKey": null
                  },
                  (v8/*: any*/)
                ],
                "storageKey": "fieldValueByName(name:\"Status\")"
              }
            ],
            "type": "ProjectV2Item",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"project_item1\")"
      }
    ]
  },
  "params": {
    "id": "ae867079d5e28b86561867090a013723",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v9/*: any*/),
        "node.fieldValueByName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2ItemFieldValue"
        },
        "node.fieldValueByName.__isNode": (v9/*: any*/),
        "node.fieldValueByName.__typename": (v9/*: any*/),
        "node.fieldValueByName.color": (v10/*: any*/),
        "node.fieldValueByName.id": (v11/*: any*/),
        "node.fieldValueByName.name": (v12/*: any*/),
        "node.fieldValueByName.nameHTML": (v12/*: any*/),
        "node.fieldValueByName.optionId": (v12/*: any*/),
        "node.id": (v11/*: any*/),
        "node.isArchived": (v13/*: any*/),
        "node.project": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ProjectV2"
        },
        "node.project.field": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ProjectV2FieldConfiguration"
        },
        "node.project.field.__isNode": (v9/*: any*/),
        "node.project.field.__typename": (v9/*: any*/),
        "node.project.field.id": (v11/*: any*/),
        "node.project.field.name": (v9/*: any*/),
        "node.project.field.options": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ProjectV2SingleSelectFieldOption"
        },
        "node.project.field.options.color": (v10/*: any*/),
        "node.project.field.options.description": (v9/*: any*/),
        "node.project.field.options.descriptionHTML": (v9/*: any*/),
        "node.project.field.options.id": (v9/*: any*/),
        "node.project.field.options.name": (v9/*: any*/),
        "node.project.field.options.nameHTML": (v9/*: any*/),
        "node.project.field.options.optionId": (v9/*: any*/),
        "node.project.id": (v11/*: any*/),
        "node.project.template": (v13/*: any*/),
        "node.project.title": (v9/*: any*/),
        "node.project.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "node.project.viewerCanUpdate": (v13/*: any*/)
      }
    },
    "name": "ProjectItemSectionViewTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "6a91ee1ab69285b7c19937f9c90c2b3b";

export default node;
