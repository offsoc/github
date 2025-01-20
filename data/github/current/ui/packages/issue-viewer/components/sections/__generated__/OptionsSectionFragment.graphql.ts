/**
 * @generated SignedSource<<36bcc28c4ce49cc8fbd78db714b043c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OptionsSectionFragment$data = {
  readonly id: string;
  readonly isPinned: boolean | null | undefined;
  readonly issueType: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueTypesDialogIssueType">;
  } | null | undefined;
  readonly locked: boolean;
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly issueTypes: {
      readonly totalCount: number;
      readonly " $fragmentSpreads": FragmentRefs<"IssueTypesDialogIssueTypes">;
    } | null | undefined;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
    readonly pinnedIssues: {
      readonly totalCount: number;
    } | null | undefined;
    readonly viewerCanPinIssues: boolean;
  };
  readonly viewerCanConvertToDiscussion: boolean | null | undefined;
  readonly viewerCanDelete: boolean;
  readonly viewerCanTransfer: boolean;
  readonly viewerCanType: boolean | null | undefined;
  readonly viewerCanUpdateNext: boolean | null | undefined;
  readonly " $fragmentType": "OptionsSectionFragment";
};
export type OptionsSectionFragment$key = {
  readonly " $data"?: OptionsSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"OptionsSectionFragment">;
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
  "name": "totalCount",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OptionsSectionFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPinned",
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
      "kind": "ScalarField",
      "name": "viewerCanUpdateNext",
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
      "name": "viewerCanTransfer",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanConvertToDiscussion",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanType",
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
        (v0/*: any*/),
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
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 10
            }
          ],
          "concreteType": "IssueTypeConnection",
          "kind": "LinkedField",
          "name": "issueTypes",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "IssueTypesDialogIssueTypes"
            },
            (v1/*: any*/)
          ],
          "storageKey": "issueTypes(first:10)"
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 3
            }
          ],
          "concreteType": "PinnedIssueConnection",
          "kind": "LinkedField",
          "name": "pinnedIssues",
          "plural": false,
          "selections": [
            (v1/*: any*/)
          ],
          "storageKey": "pinnedIssues(first:3)"
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerCanPinIssues",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "issueType",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueTypesDialogIssueType"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "6bba66fee474675a7aa556eb95ef4730";

export default node;
