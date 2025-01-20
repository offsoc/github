/**
 * @generated SignedSource<<68a626f59fda2d917a39fa0b988271ee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentsSidesheet_pullRequest$data = {
  readonly allThreads: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"ThreadPreview_pullRequestThread">;
      } | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"CommentsFilter_pullRequestThreadEdge">;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "CommentsSidesheet_pullRequest";
};
export type CommentsSidesheet_pullRequest$key = {
  readonly " $data"?: CommentsSidesheet_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommentsSidesheet_pullRequest">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "allThreads"
        ]
      }
    ]
  },
  "name": "CommentsSidesheet_pullRequest",
  "selections": [
    {
      "alias": "allThreads",
      "args": [
        {
          "kind": "Literal",
          "name": "isPositioned",
          "value": false
        },
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": "DIFF_POSITION"
        }
      ],
      "concreteType": "PullRequestThreadConnection",
      "kind": "LinkedField",
      "name": "__CommentsSidesheet_allThreads_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestThreadEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "CommentsFilter_pullRequestThreadEdge"
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestThread",
              "kind": "LinkedField",
              "name": "node",
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ThreadPreview_pullRequestThread"
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "__CommentsSidesheet_allThreads_connection(isPositioned:false,orderBy:\"DIFF_POSITION\")"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};

(node as any).hash = "86c48c7ba0ce45f4167e60b40c7f6b8f";

export default node;
