/**
 * @generated SignedSource<<e3a256bf8dbed097ba8758cdcf9ea311>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
export type PatchStatus = "ADDED" | "CHANGED" | "COPIED" | "DELETED" | "MODIFIED" | "RENAMED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type Diff_diffEntry$data = {
  readonly diffEntryId: string;
  readonly diffLines: ReadonlyArray<{
    readonly blobLineNumber: number;
  } | null | undefined> | null | undefined;
  readonly diffLinesManuallyExpandedListDiffView: boolean | null | undefined;
  readonly diffLinesManuallyUnhidden: boolean | null | undefined;
  readonly hasInjectedContextLinesListDiffView: boolean | null | undefined;
  readonly injectedContextLinesListDiffView: ReadonlyArray<{
    readonly end: number;
    readonly start: number;
  }> | null | undefined;
  readonly isBinary: boolean;
  readonly isCollapsed: boolean | null | undefined;
  readonly isTooBig: boolean;
  readonly linesChanged: number;
  readonly newTreeEntry: {
    readonly isGenerated: boolean;
    readonly lineCount: number | null | undefined;
    readonly mode: number;
  } | null | undefined;
  readonly oldTreeEntry: {
    readonly lineCount: number | null | undefined;
    readonly mode: number;
  } | null | undefined;
  readonly path: string;
  readonly pathDigest: string;
  readonly status: PatchStatus;
  readonly truncatedReason: string | null | undefined;
  readonly viewerViewedState: FileViewedState | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"DiffFileHeaderListView_diffEntry" | "DiffLines_diffEntry">;
  readonly " $fragmentType": "Diff_diffEntry";
};
export type Diff_diffEntry$key = {
  readonly " $data"?: Diff_diffEntry$data;
  readonly " $fragmentSpreads": FragmentRefs<"Diff_diffEntry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mode",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lineCount",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "injectedContextLines"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "Diff_diffEntry",
  "selections": [
    {
      "alias": "diffEntryId",
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isBinary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isTooBig",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "linesChanged",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pathDigest",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerViewedState",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "truncatedReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TreeEntry",
      "kind": "LinkedField",
      "name": "oldTreeEntry",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TreeEntry",
      "kind": "LinkedField",
      "name": "newTreeEntry",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isGenerated",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "injectedContextLines",
          "variableName": "injectedContextLines"
        }
      ],
      "concreteType": "DiffLine",
      "kind": "LinkedField",
      "name": "diffLines",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "blobLineNumber",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffFileHeaderListView_diffEntry"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DiffLines_diffEntry"
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isCollapsed",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "diffLinesManuallyExpandedListDiffView",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "diffLinesManuallyUnhidden",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hasInjectedContextLinesListDiffView",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Range",
          "kind": "LinkedField",
          "name": "injectedContextLinesListDiffView",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "start",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "end",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "PullRequestDiffEntry",
  "abstractKey": null
};
})();

(node as any).hash = "8be5d08f642fce4941c61d6d9ab35b37";

export default node;
