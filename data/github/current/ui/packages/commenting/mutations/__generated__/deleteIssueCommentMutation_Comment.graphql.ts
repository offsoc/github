/**
 * @generated SignedSource<<a649d178917c79ba29ce693bf4ce967b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type deleteIssueCommentMutation_Comment$data = {
  readonly id: string;
  readonly viewerCanDelete: boolean;
  readonly " $fragmentType": "deleteIssueCommentMutation_Comment";
};
export type deleteIssueCommentMutation_Comment$key = {
  readonly " $data"?: deleteIssueCommentMutation_Comment$data;
  readonly " $fragmentSpreads": FragmentRefs<"deleteIssueCommentMutation_Comment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "deleteIssueCommentMutation_Comment",
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
      "name": "viewerCanDelete",
      "storageKey": null
    }
  ],
  "type": "IssueComment",
  "abstractKey": null
};

(node as any).hash = "218f47b0341742a13cad66334ce40c87";

export default node;
