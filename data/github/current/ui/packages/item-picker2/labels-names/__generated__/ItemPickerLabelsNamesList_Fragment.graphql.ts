/**
 * @generated SignedSource<<cc24ad3da1f5a43dde40de3ff926c6bd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemPickerLabelsNamesList_Fragment$data = {
  readonly id: string;
  readonly labelCount: {
    readonly totalCount: number;
  } | null | undefined;
  readonly labels: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly description: string | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesItem_Fragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ItemPickerLabelsNamesList_Fragment";
};
export type ItemPickerLabelsNamesList_Fragment$key = {
  readonly " $data"?: ItemPickerLabelsNamesList_Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemPickerLabelsNamesList_Fragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withDate"
},
v1 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "withPath"
},
v2 = [
  "labels"
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": 50,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "query"
    },
    (v0/*: any*/),
    (v1/*: any*/)
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v2/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v2/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./ItemPickerLabelsNamesList_PaginationQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "ItemPickerLabelsNamesList_Fragment",
  "selections": [
    {
      "alias": "labels",
      "args": [
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": {
            "direction": "ASC",
            "field": "NAME"
          }
        },
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "query"
        }
      ],
      "concreteType": "LabelConnection",
      "kind": "LinkedField",
      "name": "__Repository_labels_connection",
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
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "ItemPickerLabelsNamesItem_Fragment",
                  "selections": [
                    (v3/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "nameHTML",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "color",
                      "storageKey": null
                    },
                    (v4/*: any*/),
                    (v5/*: any*/),
                    {
                      "condition": "withPath",
                      "kind": "Condition",
                      "passingValue": true,
                      "selections": [
                        {
                          "kind": "InlineDataFragmentSpread",
                          "name": "ItemPickerLabelsNamesItem_PathFragment",
                          "selections": [
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
                          "selections": [
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
                          "args": null,
                          "argumentDefinitions": []
                        }
                      ]
                    }
                  ],
                  "args": [
                    {
                      "kind": "Variable",
                      "name": "withDate",
                      "variableName": "withDate"
                    },
                    {
                      "kind": "Variable",
                      "name": "withPath",
                      "variableName": "withPath"
                    }
                  ],
                  "argumentDefinitions": [
                    (v0/*: any*/),
                    (v1/*: any*/)
                  ]
                },
                (v3/*: any*/),
                (v5/*: any*/),
                (v4/*: any*/),
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
    (v4/*: any*/)
  ],
  "type": "Repository",
  "abstractKey": null
};
})();

(node as any).hash = "0988098bd863a07bf6f28e153d51f786";

export default node;
