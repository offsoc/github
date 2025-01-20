This directory can be managed by `script/avatars` script or manually. Type `script/avatars help` to see usage instructions.
All the images contained in this directory are tied to `config/site/approved_handles.json`, `config/site/approved_handles_diversity.json` and `approved_handles_misc.json` approved handles lists, so if you choose to manually manage this directory, please don't forget to update those.

**Note:** There is a chance that you will have to optimize images manually, since avatars fetched with the script are `PNG`s and some can be over 500KB.
To batch optimize images you can use [this script](https://gist.github.com/stamat/cf11790f1b0c657f46de851b4ad35c4e).

This directory can be used to store other avatars, unrelated to approve lists, only in subdirecories, since `script/avatars update` will remove all of `PNG` or `JPEG` avatar image files within this directory which not found listed in the approved lists.
