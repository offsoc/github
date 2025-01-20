/**
 * @generated SignedSource<<9e285372c6599ae59cbd981966a64be0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileConversationsButton_diffEntry$data = {
  readonly outdatedThreads: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly comments: {
          readonly __id: string;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly author: {
                readonly avatarUrl: string;
                readonly login: string;
              } | null | undefined;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly totalCount: number;
        };
        readonly id: string;
        readonly isOutdated: boolean;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCommentsCount: number;
    readonly totalCount: number;
  };
  readonly path: string;
  readonly threads: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly comments: {
          readonly __id: string;
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly author: {
                readonly avatarUrl: string;
                readonly login: string;
              } | null | undefined;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly totalCount: number;
        };
        readonly id: string;
        readonly isOutdated: boolean;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCommentsCount: number;
    readonly totalCount: number;
  };
  readonly " $fragmentType": "FileConversationsButton_diffEntry";
};
export type FileConversationsButton_diffEntry$key = {
  readonly " $data"?: FileConversationsButton_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"FileConversationsButton_diffEntry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v5 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v6 = {
  "alias": null,
  "args": [
    (v0/*: any*/)
  ],
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v1/*: any*/),
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
              "concreteType": null,
              "kind": "LinkedField",
              "name": "author",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": [
                    {
                      "kind": "Literal",
                      "name": "size",
                      "value": 48
                    }
                  ],
                  "kind": "ScalarField",
                  "name": "avatarUrl",
                  "storageKey": "avatarUrl(size:48)"
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
      "storageKey": null
    },
    (v5/*: any*/)
  ],
  "storageKey": "comments(first:50)"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "forward",
        "path": [
          "threads"
        ]
      }
    ]
  },
  "name": "FileConversationsButton_diffEntry",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": "outdatedThreads",
      "args": [
        (v0/*: any*/),
        {
          "kind": "Literal",
          "name": "outdatedFilter",
          "value": "ONLY_OUTDATED"
        },
        {
          "kind": "Literal",
          "name": "subjectType",
          "value": "LINE"
        }
      ],
      "concreteType": "PullRequestThreadConnection",
      "kind": "LinkedField",
      "name": "threads",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestThreadEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestThread",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v3/*: any*/),
                (v4/*: any*/),
                (v6/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        (v5/*: any*/)
      ],
      "storageKey": "threads(first:50,outdatedFilter:\"ONLY_OUTDATED\",subjectType:\"LINE\")"
    },
    {
      "alias": "threads",
      "args": [
        {
          "kind": "Literal",
          "name": "subjectType",
          "value": "FILE"
        }
      ],
      "concreteType": "PullRequestThreadConnection",
      "kind": "LinkedField",
      "name": "__FileConversationsButton_threads_connection",
      "plural": false,
      "selections": [
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "PullRequestThreadEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "PullRequestThread",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v3/*: any*/),
                (v4/*: any*/),
                (v6/*: any*/),
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
        },
        (v5/*: any*/)
      ],
      "storageKey": "__FileConversationsButton_threads_connection(subjectType:\"FILE\")"
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};
})();

(node as any).hash = "00fb2896124376e1007fc9e281bde399";

export default node;
