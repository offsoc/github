/**
 * @generated SignedSource<<a73a5dde4b791fa43deb65449a483b3a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentComposerSecondary$data = {
  readonly repository: {
    readonly slashCommandsEnabled: boolean;
  };
  readonly viewerCanClose: boolean;
  readonly viewerCanReopen: boolean;
  readonly " $fragmentType": "IssueCommentComposerSecondary";
};
export type IssueCommentComposerSecondary$key = {
  readonly " $data"?: IssueCommentComposerSecondary$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentComposerSecondary">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueCommentComposerSecondary",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanReopen",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanClose",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slashCommandsEnabled",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "ffb792f3ef08b519a6fbff63200c443b";

export default node;
