/**
 * @generated SignedSource<<ca71cd01b948e4441e509777663f0af3>>
 * @relayHash 3bbe80b4f238645fe480d58d1009ea00
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 3bbe80b4f238645fe480d58d1009ea00

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type NavigationTestQuery$variables = {
  endOid?: string | null | undefined;
  pullRequestId: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type NavigationTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"Navigation_pullRequest">;
  } | null | undefined;
};
export type NavigationTestQuery = {
  response: NavigationTestQuery$data;
  variables: NavigationTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pullRequestId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestId"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "NavigationTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "Navigation_pullRequest"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "NavigationTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
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
                    "args": null,
                    "concreteType": "PullRequestSummaryDelta",
                    "kind": "LinkedField",
                    "name": "summary",
                    "plural": true,
                    "selections": [
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "path",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pathDigest",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "changeType",
                        "storageKey": null
                      },
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
                        "kind": "ScalarField",
                        "name": "totalAnnotationsCount",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "baseRefOid",
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 100
                  }
                ],
                "concreteType": "PullRequestCommitConnection",
                "kind": "LinkedField",
                "name": "commits",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestCommitEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestCommit",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Commit",
                            "kind": "LinkedField",
                            "name": "commit",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "abbreviatedOid",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "committedDate",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "messageHeadline",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "oid",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "GitActor",
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "actor",
                                    "plural": false,
                                    "selections": [
                                      (v5/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "login",
                                        "storageKey": null
                                      },
                                      (v6/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v6/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "commits(first:100)"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "3bbe80b4f238645fe480d58d1009ea00",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v7/*: any*/),
        "pullRequest.baseRefOid": (v8/*: any*/),
        "pullRequest.commits": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestCommitConnection"
        },
        "pullRequest.commits.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestCommitEdge"
        },
        "pullRequest.commits.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestCommit"
        },
        "pullRequest.commits.edges.node.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "pullRequest.commits.edges.node.commit.abbreviatedOid": (v7/*: any*/),
        "pullRequest.commits.edges.node.commit.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitActor"
        },
        "pullRequest.commits.edges.node.commit.author.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.commits.edges.node.commit.author.actor.__typename": (v7/*: any*/),
        "pullRequest.commits.edges.node.commit.author.actor.id": (v9/*: any*/),
        "pullRequest.commits.edges.node.commit.author.actor.login": (v7/*: any*/),
        "pullRequest.commits.edges.node.commit.committedDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequest.commits.edges.node.commit.id": (v9/*: any*/),
        "pullRequest.commits.edges.node.commit.messageHeadline": (v7/*: any*/),
        "pullRequest.commits.edges.node.commit.oid": (v8/*: any*/),
        "pullRequest.commits.edges.node.id": (v9/*: any*/),
        "pullRequest.comparison": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestComparison"
        },
        "pullRequest.comparison.summary": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestSummaryDelta"
        },
        "pullRequest.comparison.summary.__typename": (v7/*: any*/),
        "pullRequest.comparison.summary.changeType": {
          "enumValues": [
            "ADDED",
            "CHANGED",
            "COPIED",
            "DELETED",
            "MODIFIED",
            "RENAMED"
          ],
          "nullable": false,
          "plural": false,
          "type": "PatchStatus"
        },
        "pullRequest.comparison.summary.path": (v7/*: any*/),
        "pullRequest.comparison.summary.pathDigest": (v7/*: any*/),
        "pullRequest.comparison.summary.totalAnnotationsCount": (v10/*: any*/),
        "pullRequest.comparison.summary.totalCommentsCount": (v10/*: any*/),
        "pullRequest.id": (v9/*: any*/)
      }
    },
    "name": "NavigationTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ff64fb41206b6d6d20b0bc2f25cffb39";

export default node;
