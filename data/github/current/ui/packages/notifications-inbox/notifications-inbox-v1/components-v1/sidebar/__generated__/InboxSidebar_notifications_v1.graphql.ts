/**
 * @generated SignedSource<<2387578166dc0432ecbedcfdb87b9a21>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InboxSidebar_notifications_v1$data = {
  readonly viewer: {
    readonly " $fragmentSpreads": FragmentRefs<"InboxList_v1_fragment" | "InboxList_v1_threadFragment">;
  };
  readonly " $fragmentType": "InboxSidebar_notifications_v1";
};
export type InboxSidebar_notifications_v1$key = {
  readonly " $data"?: InboxSidebar_notifications_v1$data;
  readonly " $fragmentSpreads": FragmentRefs<"InboxSidebar_notifications_v1">;
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
      "operation": require('./InboxSidebarV1Query.graphql')
    }
  },
  "name": "InboxSidebar_notifications_v1",
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
              "name": "InboxList_v1_fragment"
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
              "name": "InboxList_v1_threadFragment"
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

(node as any).hash = "436cd67e1ffebc00fe12d132712d573d";

export default node;
