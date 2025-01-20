/**
 * @generated SignedSource<<6a1bf9d69578b54f1a1acb7b35fa91a6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserPickerUserFragment$data = {
  readonly avatarUrl: string;
  readonly id: string;
  readonly login: string;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "UserPickerUserFragment";
};
export type UserPickerUserFragment$key = {
  readonly " $data"?: UserPickerUserFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserPickerUserFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "UserPickerUserFragment"
};

(node as any).hash = "9a68663559e516b597f9d6fff1332fdf";

export default node;
