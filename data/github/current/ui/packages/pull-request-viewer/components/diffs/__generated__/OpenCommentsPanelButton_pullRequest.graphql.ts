/**
 * @generated SignedSource<<7f39837bfbe89376fb5e287966e6c518>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OpenCommentsPanelButton_pullRequest$data = {
  readonly allThreads: {
    readonly totalCommentsCount: number;
  };
  readonly number: number;
  readonly repository: {
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly " $fragmentType": "OpenCommentsPanelButton_pullRequest";
};
export type OpenCommentsPanelButton_pullRequest$key = {
  readonly " $data"?: OpenCommentsPanelButton_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"OpenCommentsPanelButton_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OpenCommentsPanelButton_pullRequest",
  "selections": [
    {
      "alias": "allThreads",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 50
        },
        {
          "kind": "Literal",
          "name": "isPositioned",
          "value": false
        }
      ],
      "concreteType": "PullRequestThreadConnection",
      "kind": "LinkedField",
      "name": "threads",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCommentsCount",
          "storageKey": null
        }
      ],
      "storageKey": "threads(first:50,isPositioned:false)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "number",
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
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "a05ce03c7146570fde283cfe70eaa5c0";

export default node;
