/**
 * @generated SignedSource<<624581b196ea82be3723436434c026c1>>
 * @relayHash d0bdbcdbd489ff642338257e3a1f3321
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d0bdbcdbd489ff642338257e3a1f3321

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type RemoveDashboardSearchShortcutInput = {
  clientMutationId?: string | null | undefined;
  shortcutId: string;
};
export type removeUserViewMutation$variables = {
  input: RemoveDashboardSearchShortcutInput;
};
export type removeUserViewMutation$data = {
  readonly removeDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type removeUserViewMutation$rawResponse = {
  readonly removeDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type removeUserViewMutation = {
  rawResponse: removeUserViewMutation$rawResponse;
  response: removeUserViewMutation$data;
  variables: removeUserViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "removeUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "removeDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "removeUserViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "removeDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "deleteRecord",
                "key": "",
                "kind": "ScalarHandle",
                "name": "id"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "d0bdbcdbd489ff642338257e3a1f3321",
    "metadata": {},
    "name": "removeUserViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "09f328443e2d026771ad4ed3c7a2edde";

export default node;
