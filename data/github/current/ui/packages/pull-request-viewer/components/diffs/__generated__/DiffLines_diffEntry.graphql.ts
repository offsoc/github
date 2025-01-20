/**
 * @generated SignedSource<<44267fddb985fc76880bde6070889379>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
export type DiffLineType = "ADDITION" | "CONTEXT" | "DELETION" | "HUNK" | "INJECTED_CONTEXT" | "%future added value";
export type DiffSide = "LEFT" | "RIGHT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DiffLines_diffEntry$data = {
  readonly diffLines: ReadonlyArray<{
    readonly __id: string;
    readonly blobLineNumber: number;
    readonly html: string;
    readonly left: number | null | undefined;
    readonly right: number | null | undefined;
    readonly text: string;
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
          readonly diffSide: DiffSide;
          readonly id: string;
          readonly isOutdated: boolean;
          readonly line: number | null | undefined;
          readonly startDiffSide: DiffSide | null | undefined;
          readonly startLine: number | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly totalCommentsCount: number;
      readonly totalCount: number;
    } | null | undefined;
    readonly type: DiffLineType;
  } | null | undefined> | null | undefined;
  readonly id: string;
  readonly objectId: string;
  readonly " $fragmentType": "DiffLines_diffEntry";
};
export type DiffLines_diffEntry$key = {
  readonly " $data"?: DiffLines_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"DiffLines_diffEntry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v2 = {
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
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "injectedContextLines"
    },
    {
      "kind": "RootArgument",
      "name": "inlineThreadCount"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./DiffEntryWithContextLinesQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "DiffLines_diffEntry",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "injectedContextLines",
          "variableName": "injectedContextLines"
        }
      ],
      "concreteType": "DiffLine",
      "kind": "LinkedField",
      "name": "diffLines",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "left",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "right",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "blobLineNumber",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "html",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "first",
              "variableName": "inlineThreadCount"
            }
          ],
          "concreteType": "PullRequestThreadConnection",
          "kind": "LinkedField",
          "name": "threads",
          "plural": false,
          "selections": [
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalCommentsCount",
              "storageKey": null
            },
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
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "diffSide",
                      "storageKey": null
                    },
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "isOutdated",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "line",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "startDiffSide",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "startLine",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": [
                        {
                          "kind": "Literal",
                          "name": "first",
                          "value": 50
                        }
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
                        (v2/*: any*/)
                      ],
                      "storageKey": "comments(first:50)"
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        },
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": "objectId",
          "args": null,
          "kind": "ScalarField",
          "name": "__id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};
})();

(node as any).hash = "447f8a6c3a139d1356e0f694d3c82e7d";

export default node;
