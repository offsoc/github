/**
 * @generated SignedSource<<f3af7602fce37ac863901038f5b18f8a>>
 * @relayHash 1a9b64da5b2e0647df87635409c321a8
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1a9b64da5b2e0647df87635409c321a8

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SetLabelsForLabelableInput = {
  clientMutationId?: string | null | undefined;
  labelIds: ReadonlyArray<string>;
  labelableId: string;
};
export type setLabelsForLabelableMutation$variables = {
  input: SetLabelsForLabelableInput;
};
export type setLabelsForLabelableMutation$data = {
  readonly setLabelsForLabelable: {
    readonly labelableRecord: {
      readonly " $fragmentSpreads": FragmentRefs<"LabelPickerAssignedLabels" | "LabelsSectionAssignedLabels">;
    } | null | undefined;
  } | null | undefined;
};
export type setLabelsForLabelableMutation$rawResponse = {
  readonly setLabelsForLabelable: {
    readonly labelableRecord: {
      readonly __typename: string;
      readonly __isLabelable: string;
      readonly __isNode: string;
      readonly id: string;
      readonly labels: {
        readonly edges: ReadonlyArray<{
          readonly cursor: string;
          readonly node: {
            readonly __typename: "Label";
            readonly color: string;
            readonly description: string | null | undefined;
            readonly id: string;
            readonly name: string;
            readonly nameHTML: string;
            readonly url: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
        readonly pageInfo: {
          readonly endCursor: string | null | undefined;
          readonly hasNextPage: boolean;
        };
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type setLabelsForLabelableMutation = {
  rawResponse: setLabelsForLabelableMutation$rawResponse;
  response: setLabelsForLabelableMutation$data;
  variables: setLabelsForLabelableMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": {
      "direction": "ASC",
      "field": "NAME"
    }
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  "orderBy"
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "setLabelsForLabelableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SetLabelsForLabelablePayload",
        "kind": "LinkedField",
        "name": "setLabelsForLabelable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "labelableRecord",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LabelPickerAssignedLabels"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LabelsSectionAssignedLabels"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "setLabelsForLabelableMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SetLabelsForLabelablePayload",
        "kind": "LinkedField",
        "name": "setLabelsForLabelable",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "labelableRecord",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "kind": "TypeDiscriminator",
                "abstractKey": "__isLabelable"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
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
                          (v4/*: any*/),
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
                            "name": "name",
                            "storageKey": null
                          },
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
                            "name": "description",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "url",
                            "storageKey": null
                          },
                          (v2/*: any*/)
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
                "storageKey": "labels(first:100,orderBy:{\"direction\":\"ASC\",\"field\":\"NAME\"})"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": (v5/*: any*/),
                "handle": "connection",
                "key": "LabelPicker_labels",
                "kind": "LinkedHandle",
                "name": "labels"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": (v5/*: any*/),
                "handle": "connection",
                "key": "MetadataSectionAssignedLabels_labels",
                "kind": "LinkedHandle",
                "name": "labels"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/)
                ],
                "type": "Node",
                "abstractKey": "__isNode"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1a9b64da5b2e0647df87635409c321a8",
    "metadata": {},
    "name": "setLabelsForLabelableMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "33a830ba5b9ce06282b14d356c1e10d1";

export default node;
