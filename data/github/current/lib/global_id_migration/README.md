### Rolling out a New Batch of IDs

1. Find the objects that you want to roll out.
    - This can be done by first running `bin/global-id-migration objects`
    - Filter the output with the following options: [--unused|--least-used|--most-used] [--top [N]]
    - This script will output _suggested_templates_ and _suggested_prefix_.
    - The _suggested_templates_ are based on the original paths provided by the data partitioning team and should be correct.  That being said, take some time and verify their correctness in relation to the underlying model.  Any questions can be asked in #data-partitioning
    - The _suggested_prefix_ was calculated based on all the other existing objects and is unique. That being said, you can feel free to pick another prefix but beware that it _may_ already be used in which case you will see some errors when trying to run tests.
2. Choose the objects you wish to migration, and then you can run `bin/global-id-migration sample-code [ObjectName] [readyDate]` to generate a suggested sample code block.
3. Add the sample code to the source file for the object.
4. Remove `implements Platform::Interfaces::Node`
5. Remove `global_id_field :id`
6. Implement the logic inside the block, remembering to use async calls where appropriate.
7. Add some tests. You can follow something like [this pattern](https://github.com/github/github/blob/master/test/platform/objects/project_column_test.rb) for tests.
8. Open a PR, get said PR reviewed.
9. You _might_ have to update some existing tests.
10. Ship to review-lab.
11. Ship to prod.
12. Have a :taco: or some :coffee:

---

## Global ID Migration CLI

```
bin/global-id-migration
```

Commands:


### `bin/global-id-migration objects`


This command will output a JSON hash with a bunch of data regarding object.  You can filter the list in a couple of different ways.  By default it will _not_ display objects that already have a ready date, since this is meant to be used to figure out which objects to migrate next.

Examples:

Getting the 5 least used objects:

```
bin/global-id-migration objects --least-used --top 3 | jq

```

You can leverage `jq` to just show certain bits of data. Say the object names:

```
bin/global-id-migration objects --least-used --top 3 |jq '.[][0]'
```

Getting all the unused objects:

```
bin/global-id-migration objects --unused | jq
```

### `bin/global-id-migration ready`

Returns a list of objects that already have a ready_date.  You can pass `--format md` to get a markdown table.

### `bin/global-id-migration sample-code`

Use this to generate some sample code for an object.  You can optionally pass in a ready date to have it included in the output.


```
bin/global-id-migration sample-code Platform::Objects::User 2021-06-22
```

will output:

```
implements_node templates: [[:u, :user_id]], as: "U", ready_date: 2021-06-22 do
  # implementation logic goes here.
end

```


If you want to regenerate the SQL query to run in datadot run

`bin/global-id-migration generate-usage-sql | pbcopy`

After running this query, you would then download the JSON file and replace `lib/global_id_migration/artifacts/global_id_usage.json` with the new usage stats.  This can be done periodically as we are only using these usage stats as an estimation on which objects should get rolled out first.
