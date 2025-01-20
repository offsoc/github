/**
 * @generated SignedSource<<a71db63711556c14b1bb213298590f06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AssigneesSection_pullrequest$data = {
  readonly assignees: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
    } | null | undefined> | null | undefined;
  };
  readonly baseRepository: {
    readonly name: string;
  } | null | undefined;
  readonly baseRepositoryOwner: {
    readonly login: string;
  } | null | undefined;
  readonly id: string;
  readonly number: number;
  readonly suggestedAssignees: {
    readonly nodes: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee">;
    } | null | undefined> | null | undefined;
  };
  readonly viewerCanAssign: boolean;
  readonly " $fragmentType": "AssigneesSection_pullrequest";
};
export type AssigneesSection_pullrequest$key = {
  readonly " $data"?: AssigneesSection_pullrequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"AssigneesSection_pullrequest">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "nodes",
    "plural": true,
    "selections": [
      {
        "kind": "InlineDataFragmentSpread",
        "name": "AssigneePickerAssignee",
        "selections": [
          (v0/*: any*/),
          (v2/*: any*/),
          (v1/*: any*/),
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "size",
                "value": 64
              }
            ],
            "kind": "ScalarField",
            "name": "avatarUrl",
            "storageKey": "avatarUrl(size:64)"
          }
        ],
        "args": null,
        "argumentDefinitions": ([]/*: any*/)
      }
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AssigneesSection_pullrequest",
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
      "kind": "ScalarField",
      "name": "viewerCanAssign",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "baseRepository",
      "plural": false,
      "selections": [
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "baseRepositoryOwner",
      "plural": false,
      "selections": [
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": (v3/*: any*/),
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "assignees",
      "plural": false,
      "selections": (v4/*: any*/),
      "storageKey": "assignees(first:20)"
    },
    {
      "alias": null,
      "args": (v3/*: any*/),
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "suggestedAssignees",
      "plural": false,
      "selections": (v4/*: any*/),
      "storageKey": "suggestedAssignees(first:20)"
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "32000117676176961d2ed4ac36b2f7e5";

export default node;
