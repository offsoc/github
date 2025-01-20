/**
 * @generated SignedSource<<70b12d5eb93b0073756dbb703c0315dd>>
 * @relayHash 28e696bd498695f5c682e1e455659283
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 28e696bd498695f5c682e1e455659283

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentHeaderTestQuery$variables = Record<PropertyKey, never>;
export type IssueCommentHeaderTestQuery$data = {
  readonly repository: {
    readonly issue: {
      readonly timelineItems: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly __typename: "IssueComment";
            readonly " $fragmentSpreads": FragmentRefs<"IssueCommentHeader">;
          } | {
            // This will never be '%other', but we need some
            // value in case none of the concrete values match.
            readonly __typename: "%other";
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
    } | null | undefined;
  } | null | undefined;
};
export type IssueCommentHeaderTestQuery = {
  response: IssueCommentHeaderTestQuery$data;
  variables: IssueCommentHeaderTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "repo"
  },
  {
    "kind": "Literal",
    "name": "owner",
    "value": "owner"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "number",
    "value": 33
  }
],
v2 = [
  {
    "kind": "Literal",
    "name": "last",
    "value": 10
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
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v14 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v15 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueCommentHeaderTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTimelineItemsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "IssueCommentHeader"
                              }
                            ],
                            "type": "IssueComment",
                            "abstractKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "timelineItems(last:10)"
              }
            ],
            "storageKey": "issue(number:33)"
          }
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "IssueCommentHeaderTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "Issue",
            "kind": "LinkedField",
            "name": "issue",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": (v2/*: any*/),
                "concreteType": "IssueTimelineItemsConnection",
                "kind": "LinkedField",
                "name": "timelineItems",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "IssueTimelineItemsEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
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
                                "kind": "ScalarField",
                                "name": "databaseId",
                                "storageKey": null
                              },
                              (v5/*: any*/),
                              (v6/*: any*/),
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
                                "kind": "ScalarField",
                                "name": "authorAssociation",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanUpdate",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanDelete",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanMinimize",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanReport",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanReportToMaintainer",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanBlockFromOrg",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanUnblockFromOrg",
                                "storageKey": null
                              },
                              {
                                "alias": "isHidden",
                                "args": null,
                                "kind": "ScalarField",
                                "name": "isMinimized",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "minimizedReason",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "createdViaEmail",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerDidAuthor",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Sponsorship",
                                "kind": "LinkedField",
                                "name": "authorToRepoOwnerSponsorship",
                                "plural": false,
                                "selections": [
                                  (v6/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isActive",
                                    "storageKey": null
                                  },
                                  (v4/*: any*/)
                                ],
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
                                  (v3/*: any*/),
                                  (v4/*: any*/),
                                  (v7/*: any*/)
                                ],
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
                                  (v4/*: any*/),
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
                                      (v3/*: any*/),
                                      (v4/*: any*/),
                                      (v7/*: any*/),
                                      (v5/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "isPrivate",
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Issue",
                                "kind": "LinkedField",
                                "name": "issue",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "number",
                                    "storageKey": null
                                  },
                                  (v4/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "viewerCanReadUserContentEdits",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "lastEditedAt",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "UserContentEdit",
                                    "kind": "LinkedField",
                                    "name": "lastUserContentEdit",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": null,
                                        "kind": "LinkedField",
                                        "name": "editor",
                                        "plural": false,
                                        "selections": [
                                          (v3/*: any*/),
                                          (v5/*: any*/),
                                          (v7/*: any*/),
                                          (v4/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v4/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "type": "Comment",
                                "abstractKey": "__isComment"
                              },
                              {
                                "kind": "ClientExtension",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingMinimizeReason",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingBlock",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "pendingUnblock",
                                    "storageKey": null
                                  }
                                ]
                              }
                            ],
                            "type": "IssueComment",
                            "abstractKey": null
                          },
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v4/*: any*/)
                            ],
                            "type": "Node",
                            "abstractKey": "__isNode"
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "timelineItems(last:10)"
              },
              (v4/*: any*/)
            ],
            "storageKey": "issue(number:33)"
          },
          (v4/*: any*/)
        ],
        "storageKey": "repository(name:\"repo\",owner:\"owner\")"
      }
    ]
  },
  "params": {
    "id": "28e696bd498695f5c682e1e455659283",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "repository": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Repository"
        },
        "repository.id": (v8/*: any*/),
        "repository.issue": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.id": (v8/*: any*/),
        "repository.issue.timelineItems": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "IssueTimelineItemsConnection"
        },
        "repository.issue.timelineItems.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "IssueTimelineItemsEdge"
        },
        "repository.issue.timelineItems.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "IssueTimelineItems"
        },
        "repository.issue.timelineItems.edges.node.__isComment": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.__isNode": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.__typename": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.author": (v10/*: any*/),
        "repository.issue.timelineItems.edges.node.author.__typename": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.author.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.author.login": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.authorAssociation": {
          "enumValues": [
            "COLLABORATOR",
            "CONTRIBUTOR",
            "FIRST_TIMER",
            "FIRST_TIME_CONTRIBUTOR",
            "MANNEQUIN",
            "MEMBER",
            "NONE",
            "OWNER"
          ],
          "nullable": false,
          "plural": false,
          "type": "CommentAuthorAssociation"
        },
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.createdAt": (v11/*: any*/),
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.authorToRepoOwnerSponsorship.isActive": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.body": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.createdAt": (v11/*: any*/),
        "repository.issue.timelineItems.edges.node.createdViaEmail": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "repository.issue.timelineItems.edges.node.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.isHidden": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "repository.issue.timelineItems.edges.node.issue.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.issue.number": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "repository.issue.timelineItems.edges.node.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "repository.issue.timelineItems.edges.node.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor": (v10/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.__typename": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.login": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.editor.url": (v13/*: any*/),
        "repository.issue.timelineItems.edges.node.lastUserContentEdit.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.minimizedReason": (v14/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingBlock": (v15/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingMinimizeReason": (v14/*: any*/),
        "repository.issue.timelineItems.edges.node.pendingUnblock": (v15/*: any*/),
        "repository.issue.timelineItems.edges.node.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "repository.issue.timelineItems.edges.node.repository.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.isPrivate": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.name": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "repository.issue.timelineItems.edges.node.repository.owner.__typename": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.id": (v8/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.login": (v9/*: any*/),
        "repository.issue.timelineItems.edges.node.repository.owner.url": (v13/*: any*/),
        "repository.issue.timelineItems.edges.node.url": (v13/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanBlockFromOrg": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanDelete": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanMinimize": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReadUserContentEdits": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReport": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanReportToMaintainer": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanUnblockFromOrg": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerCanUpdate": (v12/*: any*/),
        "repository.issue.timelineItems.edges.node.viewerDidAuthor": (v12/*: any*/)
      }
    },
    "name": "IssueCommentHeaderTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ea726820fc69f249e9f1b2c5d6ecc8ca";

export default node;
