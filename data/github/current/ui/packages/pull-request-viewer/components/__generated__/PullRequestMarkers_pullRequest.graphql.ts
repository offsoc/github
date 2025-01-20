/**
 * @generated SignedSource<<7f4d6623e89a1d977c2071811c832f46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestMarkers_pullRequest$data = {
  readonly allThreads: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkers_pullRequestThread">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkersAnnotations_pullRequest">;
  readonly " $fragmentType": "PullRequestMarkers_pullRequest";
};
export type PullRequestMarkers_pullRequest$key = {
  readonly " $data"?: PullRequestMarkers_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkers_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pathDigest",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "line",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
  (v2/*: any*/)
];
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
          "allThreads"
        ]
      }
    ]
  },
  "name": "PullRequestMarkers_pullRequest",
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
      "name": "__PullRequestMarkers_allThreads_connection",
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
              "alias": null,
              "args": null,
              "concreteType": "PullRequestThread",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "PullRequestMarkers_pullRequestThread",
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
                    (v0/*: any*/),
                    (v1/*: any*/),
                    (v2/*: any*/),
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
                                (v3/*: any*/)
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
                  "args": null,
                  "argumentDefinitions": []
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
      "storageKey": "__PullRequestMarkers_allThreads_connection(isPositioned:false,orderBy:\"DIFF_POSITION\")"
    },
    {
      "kind": "InlineDataFragmentSpread",
      "name": "PullRequestMarkersAnnotations_pullRequest",
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "endOid",
              "variableName": "endOid"
            },
            {
              "kind": "Variable",
              "name": "singleCommitOid",
              "variableName": "singleCommitOid"
            },
            {
              "kind": "Variable",
              "name": "startOid",
              "variableName": "startOid"
            }
          ],
          "concreteType": "PullRequestComparison",
          "kind": "LinkedField",
          "name": "comparison",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "last",
                  "value": 100
                }
              ],
              "concreteType": "CheckAnnotationConnection",
              "kind": "LinkedField",
              "name": "annotations",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "CheckAnnotationEdge",
                  "kind": "LinkedField",
                  "name": "edges",
                  "plural": true,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "CheckAnnotation",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "annotationLevel",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "CheckRun",
                          "kind": "LinkedField",
                          "name": "checkRun",
                          "plural": false,
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "CheckSuite",
                              "kind": "LinkedField",
                              "name": "checkSuite",
                              "plural": false,
                              "selections": [
                                {
                                  "alias": null,
                                  "args": null,
                                  "concreteType": "App",
                                  "kind": "LinkedField",
                                  "name": "app",
                                  "plural": false,
                                  "selections": [
                                    {
                                      "alias": null,
                                      "args": null,
                                      "kind": "ScalarField",
                                      "name": "logoUrl",
                                      "storageKey": null
                                    },
                                    (v4/*: any*/)
                                  ],
                                  "storageKey": null
                                },
                                (v4/*: any*/)
                              ],
                              "storageKey": null
                            },
                            {
                              "alias": null,
                              "args": null,
                              "kind": "ScalarField",
                              "name": "detailsUrl",
                              "storageKey": null
                            },
                            (v4/*: any*/)
                          ],
                          "storageKey": null
                        },
                        (v3/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "CheckAnnotationSpan",
                          "kind": "LinkedField",
                          "name": "location",
                          "plural": false,
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "CheckAnnotationPosition",
                              "kind": "LinkedField",
                              "name": "end",
                              "plural": false,
                              "selections": (v5/*: any*/),
                              "storageKey": null
                            },
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "CheckAnnotationPosition",
                              "kind": "LinkedField",
                              "name": "start",
                              "plural": false,
                              "selections": (v5/*: any*/),
                              "storageKey": null
                            }
                          ],
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "message",
                          "storageKey": null
                        },
                        (v1/*: any*/),
                        (v0/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "rawDetails",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "title",
                          "storageKey": null
                        },
                        {
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
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": "annotations(last:100)"
            }
          ],
          "storageKey": null
        }
      ],
      "args": null,
      "argumentDefinitions": [
        {
          "kind": "RootArgument",
          "name": "endOid"
        },
        {
          "kind": "RootArgument",
          "name": "singleCommitOid"
        },
        {
          "kind": "RootArgument",
          "name": "startOid"
        }
      ]
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "d44cf5587e66929069a62053c7cb2314";

export default node;
