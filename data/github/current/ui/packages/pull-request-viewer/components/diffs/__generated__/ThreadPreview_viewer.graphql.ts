/**
 * @generated SignedSource<<f2c41de458e72deba4b9252f7aa98a2a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ThreadPreview_viewer$data = {
  readonly pullRequestUserPreferences: {
    readonly tabSize: number;
  };
  readonly " $fragmentType": "ThreadPreview_viewer";
};
export type ThreadPreview_viewer$key = {
  readonly " $data"?: ThreadPreview_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"ThreadPreview_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ThreadPreview_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestUserPreferences",
      "kind": "LinkedField",
      "name": "pullRequestUserPreferences",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tabSize",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "e68d0c4cd3818274e48caeb672ce3053";

export default node;
