/**
 * @generated SignedSource<<b84788bbeeb8121ed45341a046899d46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClassicProjectItem$data = {
  readonly column: {
    readonly " $fragmentSpreads": FragmentRefs<"SingleSelectColumn">;
  } | null | undefined;
  readonly project: {
    readonly name: string;
    readonly url: string;
    readonly " $fragmentSpreads": FragmentRefs<"SingleSelectColumnProject">;
  };
  readonly " $fragmentType": "ClassicProjectItem";
};
export type ClassicProjectItem$key = {
  readonly " $data"?: ClassicProjectItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClassicProjectItem">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClassicProjectItem",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Project",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "SingleSelectColumnProject"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectColumn",
      "kind": "LinkedField",
      "name": "column",
      "plural": false,
      "selections": [
        {
          "kind": "InlineDataFragmentSpread",
          "name": "SingleSelectColumn",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            },
            (v0/*: any*/)
          ],
          "args": null,
          "argumentDefinitions": []
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ProjectCard",
  "abstractKey": null
};
})();

(node as any).hash = "a72eb96fbf194a95ddea57d754c2c30d";

export default node;
