/**
 * @generated SignedSource<<5d8ac4f5dbdcbaab5c8a7460133ee4b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SubIssuesListItem_NestedSubIssues$data = {
  readonly id: string;
  readonly subIssues?: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem">;
    } | null | undefined> | null | undefined;
  };
  readonly subIssuesConnection: {
    readonly totalCount: number;
  };
  readonly " $fragmentSpreads": FragmentRefs<"SubIssueTitle">;
  readonly " $fragmentType": "SubIssuesListItem_NestedSubIssues";
};
export type SubIssuesListItem_NestedSubIssues$key = {
  readonly " $data"?: SubIssuesListItem_NestedSubIssues$data;
  readonly " $fragmentSpreads": FragmentRefs<"SubIssuesListItem_NestedSubIssues">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "fetchSubIssues"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./SubIssuesListItem_NestedSubIssuesQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "SubIssuesListItem_NestedSubIssues",
  "selections": [
    {
      "args": [
        {
          "kind": "Variable",
          "name": "fetchSubIssues",
          "variableName": "fetchSubIssues"
        }
      ],
      "kind": "FragmentSpread",
      "name": "SubIssueTitle"
    },
    {
      "alias": "subIssuesConnection",
      "args": null,
      "concreteType": "IssueConnection",
      "kind": "LinkedField",
      "name": "subIssues",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totalCount",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "condition": "fetchSubIssues",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 50
            }
          ],
          "concreteType": "IssueConnection",
          "kind": "LinkedField",
          "name": "subIssues",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Issue",
              "kind": "LinkedField",
              "name": "nodes",
              "plural": true,
              "selections": [
                (v0/*: any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "SubIssuesListItem"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": "subIssues(first:50)"
        }
      ]
    },
    (v0/*: any*/)
  ],
  "type": "Issue",
  "abstractKey": null
};
})();

(node as any).hash = "f01b42721a046db8850d7a89461f286f";

export default node;
