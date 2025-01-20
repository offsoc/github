/**
 * @generated SignedSource<<1f915b3282e77fce37bcdb672ba92607>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueViewerViewer$data = {
  readonly enterpriseManagedEnterpriseId: string | null | undefined;
  readonly login: string;
  readonly " $fragmentSpreads": FragmentRefs<"AssigneePickerAssignee" | "IssueCommentComposerViewer" | "SubIssuesListViewViewer">;
  readonly " $fragmentType": "IssueViewerViewer";
};
export type IssueViewerViewer$key = {
  readonly " $data"?: IssueViewerViewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueViewerViewer">;
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
  "name": "IssueViewerViewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "enterpriseManagedEnterpriseId",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "IssueCommentComposerViewer"
    },
    {
      "kind": "InlineDataFragmentSpread",
      "name": "AssigneePickerAssignee",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
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
      "argumentDefinitions": []
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SubIssuesListViewViewer"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

(node as any).hash = "2401e127e378cdd24345584283804523";

export default node;
