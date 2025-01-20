/**
 * @generated SignedSource<<10371cdeef1f4f668bc8b553c094a2a5>>
 * @relayHash 239aa7db2a7f7a6ac7943d5445bac01a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 239aa7db2a7f7a6ac7943d5445bac01a

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsNames_Query$variables = {
  names?: string | null | undefined;
  owner: string;
  query?: string | null | undefined;
  repo: string;
  withDate: boolean;
  withPath: boolean;
};
export type ItemPickerLabelsNames_Query$data = {
  readonly repository: {
    readonly selectedLabels: {
      readonly nodes: ReadonlyArray<{
        readonly description: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesItem_Fragment">;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesList_Fragment">;
  } | null | undefined;
};
export type ItemPickerLabelsNames_Query = {
  response: ItemPickerLabelsNames_Query$data;
  variables: ItemPickerLabelsNames_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "names"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "query"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withDate"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "withPath"
},
v6 = [
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
v7 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  },
  {
    "kind": "Variable",
    "name": "names",
    "variableName": "names"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nameHTML",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "color",
  "storageKey": null
},
v13 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "url",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "resourcePath",
    "storageKey": null
  }
],
v14 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "createdAt",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "updatedAt",
    "storageKey": null
  }
],
v15 = {
  "kind": "Variable",
  "name": "withDate",
  "variableName": "withDate"
},
v16 = {
  "kind": "Variable",
  "name": "withPath",
  "variableName": "withPath"
},
v17 = {
  "kind": "Variable",
  "name": "query",
  "variableName": "query"
},
v18 = {
  "condition": "withPath",
  "kind": "Condition",
  "passingValue": true,
  "selections": (v13/*: any*/)
},
v19 = {
  "condition": "withDate",
  "kind": "Condition",
  "passingValue": true,
  "selections": (v14/*: any*/)
},
v20 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  },
  (v17/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemPickerLabelsNames_Query",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": "selectedLabels",
            "args": (v7/*: any*/),
            "concreteType": "LabelConnection",
            "kind": "LinkedField",
            "name": "labels",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Label",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "kind": "InlineDataFragmentSpread",
                    "name": "ItemPickerLabelsNamesItem_Fragment",
                    "selections": [
                      (v9/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v8/*: any*/),
                      (v10/*: any*/),
                      {
                        "condition": "withPath",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "ItemPickerLabelsNamesItem_PathFragment",
                            "selections": (v13/*: any*/),
                            "args": null,
                            "argumentDefinitions": []
                          }
                        ]
                      },
                      {
                        "condition": "withDate",
                        "kind": "Condition",
                        "passingValue": true,
                        "selections": [
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "ItemPickerLabelsNamesItem_DateFragment",
                            "selections": (v14/*: any*/),
                            "args": null,
                            "argumentDefinitions": []
                          }
                        ]
                      }
                    ],
                    "args": [
                      (v15/*: any*/),
                      (v16/*: any*/)
                    ],
                    "argumentDefinitions": [
                      {
                        "defaultValue": false,
                        "kind": "LocalArgument",
                        "name": "withDate"
                      },
                      {
                        "defaultValue": false,
                        "kind": "LocalArgument",
                        "name": "withPath"
                      }
                    ]
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "args": [
              (v17/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/)
            ],
            "kind": "FragmentSpread",
            "name": "ItemPickerLabelsNamesList_Fragment"
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
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "ItemPickerLabelsNames_Query",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": "selectedLabels",
            "args": (v7/*: any*/),
            "concreteType": "LabelConnection",
            "kind": "LinkedField",
            "name": "labels",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Label",
                "kind": "LinkedField",
                "name": "nodes",
                "plural": true,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v20/*: any*/),
            "concreteType": "LabelConnection",
            "kind": "LinkedField",
            "name": "labels",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "LabelEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Label",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v9/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v8/*: any*/),
                      (v10/*: any*/),
                      (v18/*: any*/),
                      (v19/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__typename",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v20/*: any*/),
            "filters": [
              "orderBy",
              "query"
            ],
            "handle": "connection",
            "key": "Repository_labels",
            "kind": "LinkedHandle",
            "name": "labels"
          },
          {
            "alias": "labelCount",
            "args": null,
            "concreteType": "LabelConnection",
            "kind": "LinkedField",
            "name": "labels",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totalCount",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "239aa7db2a7f7a6ac7943d5445bac01a",
    "metadata": {},
    "name": "ItemPickerLabelsNames_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "7aa8f000150ad1ddb1131842a6618d7a";

export default node;
