/**
 * @generated SignedSource<<f22d6da1154b81145346076a65a68c61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SingleSelectColumnProject$data = {
  readonly columns: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"SingleSelectColumn">;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "SingleSelectColumnProject";
};
export type SingleSelectColumnProject$key = {
  readonly " $data"?: SingleSelectColumnProject$data;
  readonly " $fragmentSpreads": FragmentRefs<"SingleSelectColumnProject">;
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SingleSelectColumnProject",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 10
        }
      ],
      "concreteType": "ProjectColumnConnection",
      "kind": "LinkedField",
      "name": "columns",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectColumn",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            {
              "kind": "InlineDataFragmentSpread",
              "name": "SingleSelectColumn",
              "selections": [
                (v0/*: any*/),
                (v1/*: any*/)
              ],
              "args": null,
              "argumentDefinitions": []
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "columns(first:10)"
    }
  ],
  "type": "Project",
  "abstractKey": null
};
})();

(node as any).hash = "2ce7e7f4c7eea21b02e237526f977eb4";

export default node;
