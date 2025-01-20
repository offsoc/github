/**
 * @generated SignedSource<<913d2ba1691771456b94fb1852a38d05>>
 * @relayHash f658f3af4f803726c6f2003d32c2b890
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f658f3af4f803726c6f2003d32c2b890

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentTestComponentQuery$variables = {
  commentId: string;
};
export type IssueCommentTestComponentQuery$data = {
  readonly comment: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueComment_issueComment">;
  } | null | undefined;
};
export type IssueCommentTestComponentQuery = {
  response: IssueCommentTestComponentQuery$data;
  variables: IssueCommentTestComponentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "commentId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "commentId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
  "name": "databaseId",
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
v8 = [
  (v7/*: any*/)
],
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
  "type": "URI"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "DateTime"
},
v14 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v15 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v16 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v17 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v18 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueCommentTestComponentQuery",
    "selections": [
      {
        "alias": "comment",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueComment_issueComment"
              }
            ],
            "type": "Comment",
            "abstractKey": "__isComment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "IssueCommentTestComponentQuery",
    "selections": [
      {
        "alias": "comment",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "body",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "unfurlReferences",
                        "value": true
                      }
                    ],
                    "kind": "ScalarField",
                    "name": "bodyHTML",
                    "storageKey": "bodyHTML(unfurlReferences:true)"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bodyVersion",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanUpdate",
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  (v6/*: any*/),
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
                      (v3/*: any*/)
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
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "avatarUrl",
                        "storageKey": null
                      }
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
                      (v3/*: any*/),
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
                          (v2/*: any*/),
                          (v3/*: any*/),
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "slashCommandsEnabled",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "nameWithOwner",
                        "storageKey": null
                      },
                      (v4/*: any*/)
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
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "locked",
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
                          (v2/*: any*/),
                          (v7/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
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
                              (v2/*: any*/),
                              (v5/*: any*/),
                              (v7/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v3/*: any*/)
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
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ReactionGroup",
                        "kind": "LinkedField",
                        "name": "reactionGroups",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "content",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "first",
                                "value": 5
                              }
                            ],
                            "concreteType": "ReactorConnection",
                            "kind": "LinkedField",
                            "name": "reactors",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "nodes",
                                "plural": true,
                                "selections": [
                                  (v2/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v8/*: any*/),
                                    "type": "User",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v8/*: any*/),
                                    "type": "Bot",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v8/*: any*/),
                                    "type": "Organization",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": (v8/*: any*/),
                                    "type": "Mannequin",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v3/*: any*/)
                                    ],
                                    "type": "Node",
                                    "abstractKey": "__isNode"
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "totalCount",
                                "storageKey": null
                              }
                            ],
                            "storageKey": "reactors(first:5)"
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "viewerHasReacted",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "Reactable",
                    "abstractKey": "__isReactable"
                  }
                ],
                "type": "IssueComment",
                "abstractKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": "__isComment"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f658f3af4f803726c6f2003d32c2b890",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "comment": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "comment.__isComment": (v9/*: any*/),
        "comment.__isReactable": (v9/*: any*/),
        "comment.__typename": (v9/*: any*/),
        "comment.author": (v10/*: any*/),
        "comment.author.__typename": (v9/*: any*/),
        "comment.author.avatarUrl": (v11/*: any*/),
        "comment.author.id": (v12/*: any*/),
        "comment.author.login": (v9/*: any*/),
        "comment.authorAssociation": {
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
        "comment.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "comment.authorToRepoOwnerSponsorship.createdAt": (v13/*: any*/),
        "comment.authorToRepoOwnerSponsorship.id": (v12/*: any*/),
        "comment.authorToRepoOwnerSponsorship.isActive": (v14/*: any*/),
        "comment.body": (v9/*: any*/),
        "comment.bodyHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "comment.bodyVersion": (v9/*: any*/),
        "comment.createdAt": (v13/*: any*/),
        "comment.createdViaEmail": (v14/*: any*/),
        "comment.databaseId": (v15/*: any*/),
        "comment.id": (v12/*: any*/),
        "comment.isHidden": (v14/*: any*/),
        "comment.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "comment.issue.author": (v10/*: any*/),
        "comment.issue.author.__typename": (v9/*: any*/),
        "comment.issue.author.id": (v12/*: any*/),
        "comment.issue.author.login": (v9/*: any*/),
        "comment.issue.id": (v12/*: any*/),
        "comment.issue.locked": (v14/*: any*/),
        "comment.issue.number": (v16/*: any*/),
        "comment.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "comment.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "comment.lastUserContentEdit.editor": (v10/*: any*/),
        "comment.lastUserContentEdit.editor.__typename": (v9/*: any*/),
        "comment.lastUserContentEdit.editor.id": (v12/*: any*/),
        "comment.lastUserContentEdit.editor.login": (v9/*: any*/),
        "comment.lastUserContentEdit.editor.url": (v11/*: any*/),
        "comment.lastUserContentEdit.id": (v12/*: any*/),
        "comment.minimizedReason": (v17/*: any*/),
        "comment.pendingBlock": (v18/*: any*/),
        "comment.pendingMinimizeReason": (v17/*: any*/),
        "comment.pendingUnblock": (v18/*: any*/),
        "comment.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "comment.reactionGroups.content": {
          "enumValues": [
            "CONFUSED",
            "EYES",
            "HEART",
            "HOORAY",
            "LAUGH",
            "ROCKET",
            "THUMBS_DOWN",
            "THUMBS_UP"
          ],
          "nullable": false,
          "plural": false,
          "type": "ReactionContent"
        },
        "comment.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "comment.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "comment.reactionGroups.reactors.nodes.__isNode": (v9/*: any*/),
        "comment.reactionGroups.reactors.nodes.__typename": (v9/*: any*/),
        "comment.reactionGroups.reactors.nodes.id": (v12/*: any*/),
        "comment.reactionGroups.reactors.nodes.login": (v9/*: any*/),
        "comment.reactionGroups.reactors.totalCount": (v16/*: any*/),
        "comment.reactionGroups.viewerHasReacted": (v14/*: any*/),
        "comment.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "comment.repository.databaseId": (v15/*: any*/),
        "comment.repository.id": (v12/*: any*/),
        "comment.repository.isPrivate": (v14/*: any*/),
        "comment.repository.name": (v9/*: any*/),
        "comment.repository.nameWithOwner": (v9/*: any*/),
        "comment.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "comment.repository.owner.__typename": (v9/*: any*/),
        "comment.repository.owner.id": (v12/*: any*/),
        "comment.repository.owner.login": (v9/*: any*/),
        "comment.repository.owner.url": (v11/*: any*/),
        "comment.repository.slashCommandsEnabled": (v14/*: any*/),
        "comment.url": (v11/*: any*/),
        "comment.viewerCanBlockFromOrg": (v14/*: any*/),
        "comment.viewerCanDelete": (v14/*: any*/),
        "comment.viewerCanMinimize": (v14/*: any*/),
        "comment.viewerCanReadUserContentEdits": (v14/*: any*/),
        "comment.viewerCanReport": (v14/*: any*/),
        "comment.viewerCanReportToMaintainer": (v14/*: any*/),
        "comment.viewerCanUnblockFromOrg": (v14/*: any*/),
        "comment.viewerCanUpdate": (v14/*: any*/),
        "comment.viewerDidAuthor": (v14/*: any*/)
      }
    },
    "name": "IssueCommentTestComponentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "353340b53a7e35122673504a7ff08f10";

export default node;
