/**
 * @generated SignedSource<<e34d8612fa6daa91e0261013332569ba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentEditorBodyFragment$data = {
  readonly author: {
    readonly avatarUrl: string;
    readonly login: string;
  } | null | undefined;
  readonly body: string;
  readonly bodyVersion: string;
  readonly id: string;
  readonly issue: {
    readonly author: {
      readonly login: string;
    } | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentHeader">;
  readonly " $fragmentType": "IssueCommentEditorBodyFragment";
};
export type IssueCommentEditorBodyFragment$key = {
  readonly " $data"?: IssueCommentEditorBodyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueCommentEditorBodyFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueCommentEditorBodyFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "body",
      "storageKey": null
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "author",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentHeader"
    }
  ],
  "type": "IssueComment",
  "abstractKey": null
};
})();

(node as any).hash = "614aeb1c4aaf9e9ddb306400e618dfac";

export default node;
