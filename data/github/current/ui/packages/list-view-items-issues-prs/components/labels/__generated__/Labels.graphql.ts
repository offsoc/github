/**
 * @generated SignedSource<<02811e98fc797afc06e5083634b8bd61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Labels$data = {
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly " $fragmentSpreads": FragmentRefs<"Label">;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "Labels";
};
export type Labels$key = {
  readonly " $data"?: Labels$data;
  readonly " $fragmentSpreads": FragmentRefs<"Labels">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "labelPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "Labels",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "labelPageSize"
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
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "Label"
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
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Labelable",
  "abstractKey": "__isLabelable"
};

(node as any).hash = "00e02fc6a80b80e27a0e02fe85a5067e";

export default node;
