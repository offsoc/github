/**
 * @generated SignedSource<<8ea217b6529beb5b820df1463285e345>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MarkdownEditHistoryViewer_comment$data = {
  readonly id: string;
  readonly lastEditedAt: string | null | undefined;
  readonly lastUserContentEdit: {
    readonly editor: {
      readonly login: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
  readonly viewerCanReadUserContentEdits: boolean;
  readonly " $fragmentType": "MarkdownEditHistoryViewer_comment";
};
export type MarkdownEditHistoryViewer_comment$key = {
  readonly " $data"?: MarkdownEditHistoryViewer_comment$data;
  readonly " $fragmentSpreads": FragmentRefs<"MarkdownEditHistoryViewer_comment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MarkdownEditHistoryViewer_comment",
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
      "kind": "ScalarField",
      "name": "viewerCanReadUserContentEdits",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastEditedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserContentEdit",
      "kind": "LinkedField",
      "name": "lastUserContentEdit",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "editor",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
              "storageKey": null
            },
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
  "type": "Comment",
  "abstractKey": "__isComment"
};

(node as any).hash = "973ba3703044303cb07c5e93e3f5b2db";

export default node;
