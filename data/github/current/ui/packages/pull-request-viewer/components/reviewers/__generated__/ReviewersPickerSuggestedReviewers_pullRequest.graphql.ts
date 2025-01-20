/**
 * @generated SignedSource<<7e5e5dc42a05463a65c5e1daa87300a2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewersPickerSuggestedReviewers_pullRequest$data = {
  readonly suggestedReviewers: ReadonlyArray<{
    readonly isAuthor: boolean;
    readonly isCommenter: boolean;
    readonly reviewer: {
      readonly avatarUrl: string;
      readonly id: string;
      readonly login: string;
      readonly name: string | null | undefined;
    };
  } | null | undefined>;
  readonly " $fragmentType": "ReviewersPickerSuggestedReviewers_pullRequest";
};
export type ReviewersPickerSuggestedReviewers_pullRequest$key = {
  readonly " $data"?: ReviewersPickerSuggestedReviewers_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReviewersPickerSuggestedReviewers_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReviewersPickerSuggestedReviewers_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SuggestedReviewer",
      "kind": "LinkedField",
      "name": "suggestedReviewers",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isAuthor",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isCommenter",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "reviewer",
          "plural": false,
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
              "name": "login",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "size",
                  "value": 64
                }
              ],
              "kind": "ScalarField",
              "name": "avatarUrl",
              "storageKey": "avatarUrl(size:64)"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "e1aa6a697fd7a8cfb63e4e7855695894";

export default node;
