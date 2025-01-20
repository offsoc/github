/**
 * @generated SignedSource<<f069bbffa4050c17baec3be1ab4308bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IterationFieldConfigFragment$data = {
  readonly configuration: {
    readonly completedIterations: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"IterationFieldIterationFragment">;
    }>;
    readonly iterations: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"IterationFieldIterationFragment">;
    }>;
  };
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "IterationFieldConfigFragment";
};
export type IterationFieldConfigFragment$key = {
  readonly " $data"?: IterationFieldConfigFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IterationFieldConfigFragment">;
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
  {
    "kind": "InlineDataFragmentSpread",
    "name": "IterationFieldIterationFragment",
    "selections": [
      (v0/*: any*/),
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
        "name": "titleHTML",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "startDate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "duration",
        "storageKey": null
      }
    ],
    "args": null,
    "argumentDefinitions": ([]/*: any*/)
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IterationFieldConfigFragment",
  "selections": [
    (v0/*: any*/),
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
      "concreteType": "ProjectV2IterationFieldConfiguration",
      "kind": "LinkedField",
      "name": "configuration",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2IterationFieldIteration",
          "kind": "LinkedField",
          "name": "iterations",
          "plural": true,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2IterationFieldIteration",
          "kind": "LinkedField",
          "name": "completedIterations",
          "plural": true,
          "selections": (v1/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectV2IterationField",
  "abstractKey": null
};
})();

(node as any).hash = "1820eb43fb63bb62abf4c8f24979732c";

export default node;
