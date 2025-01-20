/**
 * @generated SignedSource<<1d0e5d14643e852fa5c323420cbe8891>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClosedByPullRequestsReferencesList$data = {
  readonly closedByPullRequestsReferences: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"PullRequest">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ClosedByPullRequestsReferencesList";
};
export type ClosedByPullRequestsReferencesList$key = {
  readonly " $data"?: ClosedByPullRequestsReferencesList$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClosedByPullRequestsReferencesList">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": 10,
      "kind": "LocalArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": null,
        "direction": "forward",
        "path": [
          "closedByPullRequestsReferences"
        ]
      }
    ]
  },
  "name": "ClosedByPullRequestsReferencesList",
  "selections": [
    {
      "alias": "closedByPullRequestsReferences",
      "args": [
        {
          "kind": "Literal",
          "name": "includeClosedPrs",
          "value": true
        }
      ],
      "concreteType": "PullRequestConnection",
      "kind": "LinkedField",
      "name": "__ClosedByPullRequestsReferences__closedByPullRequestsReferences_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequest",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "PullRequest"
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
      "storageKey": "__ClosedByPullRequestsReferences__closedByPullRequestsReferences_connection(includeClosedPrs:true)"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "6677b0485535910a7fd3d9173953cc99";

export default node;
