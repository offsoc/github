/**
 * @generated SignedSource<<dd390ea7300c26c02388cf65e0e42266>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesCreateDialog$data = {
  readonly id: string;
  readonly repository: {
    readonly id: string;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly " $fragmentType": "SubIssuesCreateDialog";
};
export type SubIssuesCreateDialog$key = {
  readonly " $data"?: SubIssuesCreateDialog$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubIssuesCreateDialog">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SubIssuesCreateDialog",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
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
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "8afd4d0d354e2724ab109f4169d2bde2";

export default node;
