# Running SDK tests

Note: this document and associated scripts/tooling have been tested in Codespaces only.

```
 gh codespace create -b main -R github/windbeam-ruby
```

Can be used to create a new Codespace to work on the Ruby SDK. Accepting `gh` proposed defaults is fine.

## Prepare the environment

SSH to the codespace previously created (`gh codespace ssh`) and clone `github/windbeam` first:

```
gh repo clone github/windbeam /workspaces/windbeam
```

From the `windbeam-ruby` directory root, install dependencies with:

```
script/bootstrap
```

Then start Windbeam services running:

```
script/run-windbeam
```

Running Windbeam services will take a while the first time (from 10 to 15 minutes), while docker images are built and/or cached locally.

You'll see a `Windbeam services are ready` message eventually, and you should be able to reach local port `:3000`, Windbeam Portal, our UI. The port isn't forwarded, so you can't access it outside the Codespace.

You can now run the integration tests against Windbeam.

## Running the test suite

Tests need to run from the same host Windbeam services are running. So in this case, run tests from the same Codespace you executed `script/run-windbeam`.

### API tests

These are integration tests that test the Windbeam Privacy API client:

```
script/test-api
```

### SDK tests

A mixed list of unit tests that don't need Windbeam services running:

```
script/test-sdk
```

### Windbeam Exports tests

Integration tests that exercise Windbeam Exports:

```
script/test-exports
```
