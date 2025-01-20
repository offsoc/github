## Localization

Localization is primarily maintained by [`@github/global-expansion-eng`](https://github.com/orgs/github/teams/global-expansion-eng). Drop us a message in [`#global-expansion-eng`](https://github.slack.com/archives/C01JFSTAC15) if you have any questions.

## Test helpers

Wanna check whether translations are missing on your integration files? Run your tests like this:

```
I18N_RAISE_ON_MISSING_TRANSLATIONS=1 ./bin/rails test the/file_test.rb
```

You can also enable those checks for development environment, like so:

```
I18N_RAISE_ON_MISSING_TRANSLATIONS=1 ./scripts/server
```

## Running fast tests

If you would like to work primarily on the localization package, you could do this:

```bash
cd packages/localization

# Enable fast tests
export LOCALIZATION_FAST_TESTS=1

# run your tets
./../../bin/rails test test/localization/money_formatter_test.rb
```

Or, if you like, you can use [this gem](https://github.com/mjacobus/test_runner) to run your tests this way:

```bash
run_test test/localization/money_formatter_test.rb [--line=42]
```

The above will use the configuration file placed at `packages/localization/.test_runner.yml`

If you want to disable fast tests, you just need to unset LOCALIZATION_FAST_TESTS or change it to zero:

```bash
# Disable fast tests
export LOCALIZATION_FAST_TESTS=0

# or
unset LOCALIZATION_FAST_TESTS
```

You can also run fast tests from the root folder of your github/github checkout. Same thing, except you provide paths relative to the root folder:

```bash
# Enable fast tests
export LOCALIZATION_FAST_TESTS=1

# run your tets
./bin/rails test packages/localization/test/localization/money_formatter_test.rb
```
