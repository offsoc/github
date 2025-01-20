/**
 * @generated SignedSource<<9ed1696dd40d4d5eb3a3253d5495059a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxSidebar_notifications$data = {
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"InboxList_fragment" | "InboxList_threadFragment">;
  };
  readonly " $fragmentType": "InboxSidebar_notifications";
};
export type InboxSidebar_notifications$key = {
  readonly " $data"?: InboxSidebar_notifications$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxSidebar_notifications">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "query",
    "variableName": "query"
  }
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "first"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "query"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "useNewQueryField"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": require('./InboxSidebarQuery.graphql')
    }
  },
  "name": "InboxSidebar_notifications",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "viewer",
      "plural": false,
      "selections": [
        {
          "condition": "useNewQueryField",
          "kind": "Condition",
          "passingValue": true,
          "selections": [
            {
              "args": (v0/*: any*/),
              "kind": "FragmentSpread",
              "name": "InboxList_fragment"
            }
          ]
        },
        {
          "condition": "useNewQueryField",
          "kind": "Condition",
          "passingValue": false,
          "selections": [
            {
              "args": (v0/*: any*/),
              "kind": "FragmentSpread",
              "name": "InboxList_threadFragment"
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "830cc40c66836b10e737aea46296f7f1";

export default node;
