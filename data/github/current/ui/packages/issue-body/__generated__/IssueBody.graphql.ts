/**
 * @generated SignedSource<<dea45c36019410aa8d813803c3cef7aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueBody$data = {
  readonly author: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueBodyHeaderActions">;
  } | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly locked: boolean;
  readonly pendingBlock: boolean | null | undefined;
  readonly pendingUnblock: boolean | null | undefined;
  readonly repository: {
    readonly databaseId: number | null | undefined;
    readonly id: string;
    readonly nameWithOwner: string;
    readonly owner: {
      readonly id: string;
      readonly login: string;
      readonly url: string;
    };
    readonly slashCommandsEnabled: boolean;
  };
  readonly url: string;
  readonly viewerCanUpdateNext: boolean | null | undefined;
  readonly viewerDidAuthor: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBodyContent" | "IssueBodyHeader" | "IssueBodyViewer" | "IssueBodyViewerReactable" | "IssueBodyViewerSubIssues">;
  readonly " $fragmentType": "IssueBody";
};
export type IssueBody$key = {
  readonly " $data"?: IssueBody$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueBody">;
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
  "name": "databaseId",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueBody",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueBodyHeaderActions"
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
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nameWithOwner",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slashCommandsEnabled",
          "storageKey": null
        },
        (v0/*: any*/),
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
            },
            (v0/*: any*/),
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUpdateNext",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyViewer"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyContent"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyHeader"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyViewerReactable"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueBodyViewerSubIssues"
    },
    {
      "kind": "ClientExtension",
      "selections": [
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
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "e339b41e34fbe97a65cbb2ea436d2daa";

export default node;
