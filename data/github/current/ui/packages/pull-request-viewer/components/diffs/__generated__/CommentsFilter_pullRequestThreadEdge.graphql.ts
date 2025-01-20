/**
 * @generated SignedSource<<bc45f85697330e2f30c986c4ebd19a3e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentsFilter_pullRequestThreadEdge$data = ReadonlyArray<{
  readonly node: {
    readonly firstComment: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly author: {
            readonly login: string;
          } | null | undefined;
          readonly body: string;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly id: string;
    readonly isResolved: boolean;
    readonly path: string;
  } | null | undefined;
  readonly " $fragmentType": "CommentsFilter_pullRequestThreadEdge";
}>;
export type CommentsFilter_pullRequestThreadEdge$key = ReadonlyArray<{
  readonly " $data"?: CommentsFilter_pullRequestThreadEdge$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommentsFilter_pullRequestThreadEdge">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "CommentsFilter_pullRequestThreadEdge",
  "selections": [
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isResolved",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "path",
          "storageKey": null
        },
        {
          "alias": "firstComment",
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 1
            }
          ],
          "concreteType": "PullRequestReviewCommentConnection",
          "kind": "LinkedField",
          "name": "comments",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestReviewCommentEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "PullRequestReviewComment",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "body",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "author",
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
              "storageKey": null
            }
          ],
          "storageKey": "comments(first:1)"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequestThreadEdge",
  "abstractKey": null
};

(node as any).hash = "51f5e7a8ab09c1094b831a22f4b10bc0";

export default node;
