/**
 * @generated SignedSource<<f404136a3c600e847fef61c447ca436a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderContentCurrentViewFragment$data = {
  readonly description: string;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "HeaderContentCurrentViewFragment";
};
export type HeaderContentCurrentViewFragment$key = {
  readonly " $data"?: HeaderContentCurrentViewFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"HeaderContentCurrentViewFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HeaderContentCurrentViewFragment",
  "selections": [
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
      "name": "description",
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
  "type": "Shortcutable",
  "abstractKey": "__isShortcutable"
};

(node as any).hash = "9dddf9f1137f1cfcdc13b09e581d7385";

export default node;
