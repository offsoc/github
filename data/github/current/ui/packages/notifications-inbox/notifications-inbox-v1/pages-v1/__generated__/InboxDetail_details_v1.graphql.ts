/**
 * @generated SignedSource<<2cd89adf7e306e715273a04735096391>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxDetail_details_v1$data = {
  readonly id: string;
  readonly subject: {
    readonly __typename: "Issue";
    readonly id: string;
    readonly number: number;
    readonly repository: {
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  };
  readonly " $fragmentSpreads": FragmentRefs<"InboxHeader_notification_v1">;
  readonly " $fragmentType": "InboxDetail_details_v1";
};
export type InboxDetail_details_v1$key = {
  readonly " $data"?: InboxDetail_details_v1$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxDetail_details_v1">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InboxDetail_details_v1",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "InboxHeader_notification_v1"
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "subject",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "number",
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
          "type": "Issue",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "NotificationThread",
  "abstractKey": null
};
})();

(node as any).hash = "feaee7d1b4ec3a4d81c4fb1c338d9f17";

export default node;
