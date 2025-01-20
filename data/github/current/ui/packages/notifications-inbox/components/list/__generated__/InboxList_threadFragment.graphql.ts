/**
 * @generated SignedSource<<5a97ffbfaad43f2ec261065f9e0f52e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxList_threadFragment$data = {
  readonly id: string;
  readonly notificationThreads: {
    readonly edges: ReadonlyArray<{
      readonly cursor: string;
      readonly node: {
        readonly id: string;
        readonly isDone: boolean;
        readonly isUnread: boolean;
        readonly list: {
          readonly __typename: "Enterprise";
          readonly slug: string;
        } | {
          readonly __typename: "Organization";
          readonly login: string;
        } | {
          readonly __typename: "Repository";
          readonly name: string;
          readonly owner: {
            readonly login: string;
          };
        } | {
          readonly __typename: "Team";
          readonly name: string;
          readonly organization: {
            readonly login: string;
          };
          readonly slug: string;
        } | {
          readonly __typename: "User";
          readonly login: string;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        };
        readonly subject: {
          readonly __typename: "Commit";
          readonly id: string;
        } | {
          readonly __typename: "Discussion";
          readonly id: string;
          readonly number: number;
        } | {
          readonly __typename: "Issue";
          readonly id: string;
          readonly number: number;
        } | {
          readonly __typename: "PullRequest";
          readonly id: string;
          readonly number: number;
        } | {
          readonly __typename: "TeamDiscussion";
          readonly id: string;
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        };
        readonly url: string;
        readonly " $fragmentSpreads": FragmentRefs<"InboxListRow_fragment">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly totalCount: number;
  };
  readonly " $fragmentType": "InboxList_threadFragment";
};
export type InboxList_threadFragment$key = {
  readonly " $data"?: InboxList_threadFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxList_threadFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "notificationThreads"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  }
],
v4 = [
  (v1/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "query"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./InboxThreadListQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "InboxList_threadFragment",
  "selections": [
    {
      "alias": "notificationThreads",
      "args": [
        {
          "kind": "Variable",
          "name": "query",
          "variableName": "query"
        }
      ],
      "concreteType": "NotificationThreadConnection",
      "kind": "LinkedField",
      "name": "__InboxSearch_notificationThreads_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "NotificationThreadEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "NotificationThread",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "isDone",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "InboxListRow_fragment"
                },
                (v1/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "isUnread",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "url",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "subject",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": (v3/*: any*/),
                      "type": "Issue",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v3/*: any*/),
                      "type": "Discussion",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v3/*: any*/),
                      "type": "PullRequest",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v4/*: any*/),
                      "type": "Commit",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v4/*: any*/),
                      "type": "TeamDiscussion",
                      "abstractKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "list",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/),
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v5/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": null,
                          "kind": "LinkedField",
                          "name": "owner",
                          "plural": false,
                          "selections": (v6/*: any*/),
                          "storageKey": null
                        }
                      ],
                      "type": "Repository",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v5/*: any*/),
                        (v7/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Organization",
                          "kind": "LinkedField",
                          "name": "organization",
                          "plural": false,
                          "selections": (v6/*: any*/),
                          "storageKey": null
                        }
                      ],
                      "type": "Team",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v6/*: any*/),
                      "type": "User",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": (v6/*: any*/),
                      "type": "Organization",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v7/*: any*/)
                      ],
                      "type": "Enterprise",
                      "abstractKey": null
                    }
                  ],
                  "storageKey": null
                },
                (v2/*: any*/)
              ],
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
      "storageKey": null
    },
    (v1/*: any*/)
  ],
  "type": "User",
  "abstractKey": null
};
})();

(node as any).hash = "10744331955c2beecb7c40e2c5337139";

export default node;
