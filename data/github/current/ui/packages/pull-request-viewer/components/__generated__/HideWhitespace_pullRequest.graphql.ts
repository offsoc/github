/**
 * @generated SignedSource<<e35a615b2f717bd1588ab4e8444c32cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HideWhitespace_pullRequest$data = {
  readonly id: string;
  readonly viewerPreferences: {
    readonly ignoreWhitespace: boolean | null | undefined;
  };
  readonly " $fragmentType": "HideWhitespace_pullRequest";
};
export type HideWhitespace_pullRequest$key = {
  readonly " $data"?: HideWhitespace_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"HideWhitespace_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HideWhitespace_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestUserPreferences",
      "kind": "LinkedField",
      "name": "viewerPreferences",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ignoreWhitespace",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "6cbe40901af92e1a28fd0332c361877e";

export default node;
