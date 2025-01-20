/**
 * @generated SignedSource<<8599356aec7e550a4bd358da73d5f825>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSectionFieldsValues$data = {
  readonly fieldValues: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly field?: {
          readonly id?: string;
        };
        readonly id?: string;
        readonly " $fragmentSpreads": FragmentRefs<"DateFieldFragment" | "IterationFieldFragment" | "NumberFieldFragment" | "SingleSelectFieldFragment" | "TextFieldFragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "ProjectItemSectionFieldsValues";
};
export type ProjectItemSectionFieldsValues$key = {
  readonly " $data"?: ProjectItemSectionFieldsValues$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFieldsValues">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/)
],
v2 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "field",
    "plural": false,
    "selections": [
      {
        "kind": "InlineFragment",
        "selections": (v1/*: any*/),
        "type": "ProjectV2Field",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "fieldValues"
        ]
      }
    ]
  },
  "name": "ProjectItemSectionFieldsValues",
  "selections": [
    {
      "alias": "fieldValues",
      "args": [
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": {
            "direction": "ASC",
            "field": "POSITION"
          }
        }
      ],
      "concreteType": "ProjectV2ItemFieldValueConnection",
      "kind": "LinkedField",
      "name": "__ProjectItemSection_fieldValues_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2ItemFieldValueEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "kind": "InlineFragment",
                  "selections": (v2/*: any*/),
                  "type": "ProjectV2ItemFieldTextValue",
                  "abstractKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "TextFieldFragment"
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v2/*: any*/),
                  "type": "ProjectV2ItemFieldNumberValue",
                  "abstractKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "NumberFieldFragment"
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v2/*: any*/),
                  "type": "ProjectV2ItemFieldDateValue",
                  "abstractKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "DateFieldFragment"
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "field",
                      "plural": false,
                      "selections": [
                        {
                          "kind": "InlineFragment",
                          "selections": (v1/*: any*/),
                          "type": "ProjectV2SingleSelectField",
                          "abstractKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "type": "ProjectV2ItemFieldSingleSelectValue",
                  "abstractKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "SingleSelectFieldFragment"
                },
                {
                  "kind": "InlineFragment",
                  "selections": [
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "field",
                      "plural": false,
                      "selections": [
                        {
                          "kind": "InlineFragment",
                          "selections": (v1/*: any*/),
                          "type": "ProjectV2IterationField",
                          "abstractKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "type": "ProjectV2ItemFieldIterationValue",
                  "abstractKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "IterationFieldFragment"
                },
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
      "storageKey": "__ProjectItemSection_fieldValues_connection(orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
    }
  ],
  "type": "ProjectV2Item",
  "abstractKey": null
};
})();

(node as any).hash = "aa5a4ebccabf1dc68b3a0e508cf14a20";

export default node;
