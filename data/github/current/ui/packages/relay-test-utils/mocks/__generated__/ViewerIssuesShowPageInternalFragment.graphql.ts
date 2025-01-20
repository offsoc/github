/**
 * @generated SignedSource<<b0f600b6f2d048b6e02f533fa87b399f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ViewerIssuesShowPageInternalFragment$data = {
  readonly issue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssuesShowFragment">;
  } | null | undefined;
  readonly nameWithOwner: string;
  readonly " $fragmentType": "ViewerIssuesShowPageInternalFragment";
};
export type ViewerIssuesShowPageInternalFragment$key = {
  readonly " $data"?: ViewerIssuesShowPageInternalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ViewerIssuesShowPageInternalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "number"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ViewerIssuesShowPageInternalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameWithOwner",
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "number",
          "variableName": "number"
        }
      ],
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "issue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssuesShowFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Repository",
  "abstractKey": null
};

(node as any).hash = "05b4634a02e8141e1a0f158a4c1b2d20";

export default node;
