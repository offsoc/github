/**
 * @generated SignedSource<<0238d3ef744b3ef80c6c1d95809185cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type ProjectV2SingleSelectFieldOptionColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SingleSelectFieldConfigFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly options: ReadonlyArray<{
    readonly color: ProjectV2SingleSelectFieldOptionColor;
    readonly description: string;
    readonly id: string;
    readonly name: string;
    readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldOptionFragment">;
  }>;
  readonly " $fragmentType": "SingleSelectFieldConfigFragment";
};
export type SingleSelectFieldConfigFragment$key = {
  readonly " $data"?: SingleSelectFieldConfigFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SingleSelectFieldConfigFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
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
  "name": "color",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SingleSelectFieldConfigFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2SingleSelectFieldOption",
      "kind": "LinkedField",
      "name": "options",
      "plural": true,
      "selections": [
        {
          "kind": "InlineDataFragmentSpread",
          "name": "SingleSelectFieldOptionFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "optionId",
              "storageKey": null
            },
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nameHTML",
              "storageKey": null
            },
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "descriptionHTML",
              "storageKey": null
            }
          ],
          "args": null,
          "argumentDefinitions": []
        },
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        },
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectV2SingleSelectField",
  "abstractKey": null
};
})();

(node as any).hash = "7609e6b1ac2a8d003401b9f85fcd3e61";

export default node;
