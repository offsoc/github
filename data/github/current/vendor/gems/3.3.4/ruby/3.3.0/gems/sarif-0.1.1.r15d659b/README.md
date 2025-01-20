# sarif-gem

### What is this?

A SARIF validation Ruby gem that wraps a library written in Rust.

It is used by gh/gh to validate SARIF documents that are uploaded to the Code Scanning service.

▶️ See https://sarifweb.azurewebsites.net/Validation for a full-featured SARIF validator that is recommended when working with the SARIF spec.

### Why does this exist?

Code scanning has historically done very little validation of the SARIF it ingests. We only use parts of the SARIF document, and this has led to vendors creating tools that send us invalid SARIF (and us accepting it).

See https://github.com/github/code-scanning/issues/3080

We use this gem to verify uploaded SARIF documents in real-time for any upload which has the `validate` option set to true (see https://docs.github.com/en/rest/code-scanning#upload-an-analysis-as-sarif-data).

For more information, see also https://github.com/github/code-scanning/discussions/5032

### Why Rust? :crab:

We want to give users an error at point of upload, rather than have them poll an endpoint to find out if a document was valid.

Previous attempts to validate large SARIF documents were too slow to work in real-time. After benchmarking various JSON Schema libraries across a wide range of languages Rust ended up winning out.

### How to update the Rust dependencies

```cargo update```

### How to update the Ruby dependencies

```bundle update```

### How to update the monolith version of this gem?

From a gh/gh Codespace run `script/vendor-gem https://github.com/github/sarif-gem` and commit the results.
