/**
 * @generated SignedSource<<40f04f184b5eefc2d87f279abb3f911c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectPickerClassicProject$data = {
  readonly __typename: "Project";
  readonly closed: boolean;
  readonly columns: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
    } | null | undefined> | null | undefined;
  };
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly url: string;
  readonly viewerCanUpdate: boolean;
  readonly " $fragmentType": "ProjectPickerClassicProject";
};
export type ProjectPickerClassicProject$key = {
  readonly " $data"?: ProjectPickerClassicProject$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectPickerClassicProject">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "ProjectPickerClassicProject"
};

(node as any).hash = "91fa4d4e6f174199e6e10b3a6cf1fe69";

export default node;
