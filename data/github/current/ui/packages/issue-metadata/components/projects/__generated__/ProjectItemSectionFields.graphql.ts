/**
 * @generated SignedSource<<a1a42cfd1ade0a9a9115c6a44f8d8811>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type ProjectV2FieldType = "ASSIGNEES" | "DATE" | "ISSUE_TYPE" | "ITERATION" | "LABELS" | "LINKED_PULL_REQUESTS" | "MILESTONE" | "NUMBER" | "PARENT_ISSUE" | "REPOSITORY" | "REVIEWERS" | "SINGLE_SELECT" | "SUB_ISSUES_PROGRESS" | "TEXT" | "TITLE" | "TRACKED_BY" | "TRACKS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ProjectItemSectionFields$data = {
  readonly id: string;
  readonly isArchived: boolean;
  readonly project: {
    readonly fields: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly dataType?: ProjectV2FieldType;
          readonly id?: string;
          readonly name?: string;
          readonly " $fragmentSpreads": FragmentRefs<"DateFieldConfigFragment" | "IterationFieldConfigFragment" | "NumberFieldConfigFragment" | "SingleSelectFieldConfigFragment" | "TextFieldConfigFragment">;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    };
    readonly id: string;
    readonly title: string;
    readonly url: string;
    readonly viewerCanUpdate: boolean;
  };
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFieldsValues">;
  readonly " $fragmentType": "ProjectItemSectionFields";
};
export type ProjectItemSectionFields$key = {
  readonly " $data"?: ProjectItemSectionFields$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectItemSectionFields">;
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
  "name": "dataType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectItemSectionFields",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isArchived",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerCanUpdate",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 50
            },
            {
              "kind": "Literal",
              "name": "orderBy",
              "value": {
                "direction": "ASC",
                "field": "POSITION"
              }
            }
          ],
          "concreteType": "ProjectV2FieldConfigurationConnection",
          "kind": "LinkedField",
          "name": "fields",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectV2FieldConfigurationEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v0/*: any*/),
                        (v1/*: any*/),
                        (v2/*: any*/),
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "TextFieldConfigFragment"
                        },
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "DateFieldConfigFragment"
                        },
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "NumberFieldConfigFragment"
                        }
                      ],
                      "type": "ProjectV2Field",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v0/*: any*/),
                        (v1/*: any*/),
                        (v2/*: any*/),
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "IterationFieldConfigFragment"
                        }
                      ],
                      "type": "ProjectV2IterationField",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        (v0/*: any*/),
                        (v1/*: any*/),
                        (v2/*: any*/),
                        {
                          "args": null,
                          "kind": "FragmentSpread",
                          "name": "SingleSelectFieldConfigFragment"
                        }
                      ],
                      "type": "ProjectV2SingleSelectField",
                      "abstractKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": "fields(first:50,orderBy:{\"direction\":\"ASC\",\"field\":\"POSITION\"})"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ProjectItemSectionFieldsValues"
    }
  ],
  "type": "ProjectV2Item",
  "abstractKey": null
};
})();

(node as any).hash = "d325b72ce28f95b88d72cb0fb9d8c682";

export default node;
