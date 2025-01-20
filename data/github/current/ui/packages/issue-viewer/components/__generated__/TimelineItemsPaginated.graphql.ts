/**
 * @generated SignedSource<<aa9e6373a65f0847ac2ec4fb50268d9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TimelineItemsPaginated$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly __typename: string;
      readonly __id: string;
      readonly actor?: {
        readonly login: string;
      } | null | undefined;
      readonly assignee?: {
        readonly __typename?: "Bot";
        readonly id: string;
      } | {
        readonly __typename?: "Mannequin";
        readonly id: string;
      } | {
        readonly __typename?: "Organization";
        readonly id: string;
      } | {
        readonly __typename?: "User";
        readonly id: string;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      } | null | undefined;
      readonly createdAt?: string;
      readonly databaseId?: number | null | undefined;
      readonly issue?: {
        readonly author: {
          readonly login: string;
        } | null | undefined;
      };
      readonly label?: {
        readonly id: string;
      };
      readonly source?: {
        readonly __typename: string;
      };
      readonly viewerDidAuthor?: boolean;
      readonly willCloseTarget?: boolean;
      readonly " $fragmentSpreads": FragmentRefs<"AddedToProjectEvent" | "AddedToProjectV2Event" | "AssignedEvent" | "ClosedEvent" | "CommentDeletedEvent" | "ConnectedEvent" | "ConvertedFromDraftEvent" | "ConvertedNoteToIssueEvent" | "ConvertedToDiscussionEvent" | "CrossReferencedEvent" | "DemilestonedEvent" | "DisconnectedEvent" | "IssueComment_issueComment" | "LabeledEvent" | "LockedEvent" | "MarkedAsDuplicateEvent" | "MentionedEvent" | "MilestonedEvent" | "MovedColumnsInProjectEvent" | "PinnedEvent" | "ProjectV2ItemStatusChangedEvent" | "ReferencedEvent" | "RemovedFromProjectEvent" | "RemovedFromProjectV2Event" | "RenamedTitleEvent" | "ReopenedEvent" | "SubscribedEvent" | "TransferredEvent" | "UnassignedEvent" | "UnlabeledEvent" | "UnlockedEvent" | "UnmarkedAsDuplicateEvent" | "UnpinnedEvent" | "UnsubscribedEvent" | "UserBlockedEvent">;
    } | null | undefined;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "TimelineItemsPaginated";
};
export type TimelineItemsPaginated$key = {
  readonly " $data"?: TimelineItemsPaginated$data;
  readonly " $fragmentSpreads": FragmentRefs<"TimelineItemsPaginated">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": (v0/*: any*/),
  "storageKey": null
},
v3 = [
  (v1/*: any*/),
  (v2/*: any*/)
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
],
v6 = [
  (v1/*: any*/),
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Label",
    "kind": "LinkedField",
    "name": "label",
    "plural": false,
    "selections": (v5/*: any*/),
    "storageKey": null
  }
],
v7 = {
  "kind": "InlineFragment",
  "selections": (v5/*: any*/),
  "type": "User",
  "abstractKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": (v5/*: any*/),
  "type": "Bot",
  "abstractKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": (v5/*: any*/),
  "type": "Mannequin",
  "abstractKey": null
},
v10 = {
  "kind": "InlineFragment",
  "selections": (v5/*: any*/),
  "type": "Organization",
  "abstractKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TimelineItemsPaginated",
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
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "databaseId",
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
                  "concreteType": "Issue",
                  "kind": "LinkedField",
                  "name": "issue",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "author",
                      "plural": false,
                      "selections": (v0/*: any*/),
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "type": "IssueComment",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v3/*: any*/),
              "type": "ReferencedEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "source",
                  "plural": false,
                  "selections": [
                    (v4/*: any*/)
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "willCloseTarget",
                  "storageKey": null
                }
              ],
              "type": "CrossReferencedEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v2/*: any*/)
              ],
              "type": "MentionedEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v6/*: any*/),
              "type": "LabeledEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v6/*: any*/),
              "type": "UnlabeledEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "assignee",
                  "plural": false,
                  "selections": [
                    (v7/*: any*/),
                    (v8/*: any*/),
                    (v9/*: any*/),
                    (v10/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "type": "AssignedEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "assignee",
                  "plural": false,
                  "selections": [
                    (v4/*: any*/),
                    (v7/*: any*/),
                    (v8/*: any*/),
                    (v9/*: any*/),
                    (v10/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "type": "UnassignedEvent",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v3/*: any*/),
              "type": "AddedToProjectV2Event",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v3/*: any*/),
              "type": "RemovedFromProjectV2Event",
              "abstractKey": null
            },
            (v4/*: any*/),
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "IssueComment_issueComment"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "AddedToProjectEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "MovedColumnsInProjectEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RemovedFromProjectEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "SubscribedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnsubscribedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "MentionedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ClosedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ReopenedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "LockedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnlockedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "PinnedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnpinnedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "LabeledEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RenamedTitleEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnlabeledEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnassignedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "AssignedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "CommentDeletedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserBlockedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "MilestonedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DemilestonedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "CrossReferencedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ReferencedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ConnectedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "TransferredEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ConvertedNoteToIssueEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "DisconnectedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "MarkedAsDuplicateEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UnmarkedAsDuplicateEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ConvertedToDiscussionEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "AddedToProjectV2Event"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RemovedFromProjectV2Event"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ProjectV2ItemStatusChangedEvent"
            },
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ConvertedFromDraftEvent"
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
  "type": "IssueTimelineItemsConnection",
  "abstractKey": null
};
})();

(node as any).hash = "cd22935c0c9b3c5d977437c5522ca961";

export default node;
