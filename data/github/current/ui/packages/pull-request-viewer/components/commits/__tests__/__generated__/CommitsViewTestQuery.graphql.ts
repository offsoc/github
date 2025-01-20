/**
 * @generated SignedSource<<0662a890a727c3eab4581f7be4b28d31>>
 * @relayHash 1a12e3ff6089cc933d1b486e6655f9e3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1a12e3ff6089cc933d1b486e6655f9e3

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitsViewTestQuery$variables = {
  number: number;
  repositoryId: string;
};
export type CommitsViewTestQuery$data = {
  readonly repository: {
    readonly " $fragmentSpreads": FragmentRefs<"CommitsView_repository">;
  } | null | undefined;
};
export type CommitsViewTestQuery = {
  response: CommitsViewTestQuery$data;
  variables: CommitsViewTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repositoryId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "repositoryId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avatarUrl",
        "storageKey": null
      },
      (v5/*: any*/),
      (v4/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "resourcePath",
        "storageKey": null
      },
      (v6/*: any*/)
    ],
    "storageKey": null
  }
],
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
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
  "type": "Boolean"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "GitActor"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "User"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v15 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "HTML"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "CommitsViewTestQuery",
    "selections": [
      {
        "alias": "repository",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CommitsView_repository"
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
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "CommitsViewTestQuery",
    "selections": [
      {
        "alias": "repository",
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "owner",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "number",
                    "variableName": "number"
                  }
                ],
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "number",
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
                                "kind": "ScalarField",
                                "name": "messageHeadlineHTMLLink",
                                "storageKey": null
                              },
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
                                    "name": "committedViaWeb",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "authoredByCommitter",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "authoredDate",
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
                                    "name": "messageBodyHTML",
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
                                    "args": [
                                      {
                                        "kind": "Literal",
                                        "name": "first",
                                        "value": 3
                                      }
                                    ],
                                    "concreteType": "GitActorConnection",
                                    "kind": "LinkedField",
                                    "name": "authors",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "GitActorEdge",
                                        "kind": "LinkedField",
                                        "name": "edges",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "GitActor",
                                            "kind": "LinkedField",
                                            "name": "node",
                                            "plural": false,
                                            "selections": (v7/*: any*/),
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": "authors(first:3)"
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "GitActor",
                                    "kind": "LinkedField",
                                    "name": "committer",
                                    "plural": false,
                                    "selections": (v7/*: any*/),
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
                    "storageKey": "commits(first:50)"
                  },
                  (v6/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Repository",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1a12e3ff6089cc933d1b486e6655f9e3",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "repository.__typename": (v8/*: any*/),
        "repository.id": (v9/*: any*/),
        "repository.name": (v8/*: any*/),
        "repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "repository.owner.__typename": (v8/*: any*/),
        "repository.owner.id": (v9/*: any*/),
        "repository.owner.login": (v8/*: any*/),
        "repository.pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequest"
        },
        "repository.pullRequest.commits": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestCommitConnection"
        },
        "repository.pullRequest.commits.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestCommitEdge"
        },
        "repository.pullRequest.commits.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestCommit"
        },
        "repository.pullRequest.commits.edges.node.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "repository.pullRequest.commits.edges.node.commit.authoredByCommitter": (v10/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authoredDate": (v11/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitActorConnection"
        },
        "repository.pullRequest.commits.edges.node.commit.authors.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "GitActorEdge"
        },
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node": (v12/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user": (v13/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user.avatarUrl": (v14/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user.id": (v9/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user.login": (v8/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user.name": (v15/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.authors.edges.node.user.resourcePath": (v14/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committedDate": (v11/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committedViaWeb": (v10/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer": (v12/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user": (v13/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user.avatarUrl": (v14/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user.id": (v9/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user.login": (v8/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user.name": (v15/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.committer.user.resourcePath": (v14/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.id": (v9/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.messageBodyHTML": (v16/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.messageHeadline": (v8/*: any*/),
        "repository.pullRequest.commits.edges.node.commit.oid": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitObjectID"
        },
        "repository.pullRequest.commits.edges.node.id": (v9/*: any*/),
        "repository.pullRequest.commits.edges.node.messageHeadlineHTMLLink": (v16/*: any*/),
        "repository.pullRequest.id": (v9/*: any*/),
        "repository.pullRequest.number": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        }
      }
    },
    "name": "CommitsViewTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "abb3a5f52c70747f49435c3a467ec8b0";

export default node;
