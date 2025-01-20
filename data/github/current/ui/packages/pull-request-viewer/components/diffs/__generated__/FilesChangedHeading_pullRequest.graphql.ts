/**
 * @generated SignedSource<<163392c160db0185df439cdfc08be873>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FilesChangedHeading_pullRequest$data = {
  readonly comparison: {
    readonly linesAdded: number;
    readonly linesDeleted: number;
    readonly newCommit: {
      readonly oid: any;
    };
    readonly oldCommit: {
      readonly oid: any;
    };
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"DiffViewSettingsButton_pullRequest" | "OpenAnnotationsPanelButton_pullRequest" | "OpenCommentsPanelButton_pullRequest" | "ViewedFileProgress_pullRequest">;
  readonly " $fragmentType": "FilesChangedHeading_pullRequest";
};
export type FilesChangedHeading_pullRequest$key = {
  readonly " $data"?: FilesChangedHeading_pullRequest$data;
  readonly " $fragmentSpreads": FragmentRefs<"FilesChangedHeading_pullRequest">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "oid",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "endOid"
    },
    {
      "kind": "RootArgument",
      "name": "singleCommitOid"
    },
    {
      "kind": "RootArgument",
      "name": "startOid"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FilesChangedHeading_pullRequest",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffViewSettingsButton_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ViewedFileProgress_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "OpenCommentsPanelButton_pullRequest"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "OpenAnnotationsPanelButton_pullRequest"
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "endOid",
          "variableName": "endOid"
        },
        {
          "kind": "Variable",
          "name": "singleCommitOid",
          "variableName": "singleCommitOid"
        },
        {
          "kind": "Variable",
          "name": "startOid",
          "variableName": "startOid"
        }
      ],
      "concreteType": "PullRequestComparison",
      "kind": "LinkedField",
      "name": "comparison",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Commit",
          "kind": "LinkedField",
          "name": "oldCommit",
          "plural": false,
          "selections": (v0/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Commit",
          "kind": "LinkedField",
          "name": "newCommit",
          "plural": false,
          "selections": (v0/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "linesAdded",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "linesDeleted",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PullRequest",
  "abstractKey": null
};
})();

(node as any).hash = "df5632ae63f2a164ad2a73d63975f62a";

export default node;
