# Scout

[![Run Tests](https://github.com/github/projectionist/actions/workflows/ci.yml/badge.svg)](https://github.com/github/projectionist/actions/workflows/ci.yml)
[![Nightly CI to test integration with latest Linguist](https://github.com/github/projectionist/actions/workflows/linguist-nightly-ci.yml/badge.svg)](https://github.com/github/projectionist/actions/workflows/linguist-nightly-ci.yml)

_Scout_ is used to detect projects present in a GitHub repo as well as various tech stacks used in each project. A project is essentially a sub-tree in a git repository and is represented by a relative path from root of the repository. Tech stack could be a language or a framework or a build system or a package manager and so on.

Scout is built on top of [_Linguist_](https://github.com/github/linguist) which detects languages from a repo.

## Schema

```
[
  {
    "tech_stack": [
      {
        "name": "<name>",
        "size": "<size in bytes, only applicable for `language` type>"
        "settings": {
            "<key>": "<value>"
        }
      },
      ...
    ],
    "path": "<working directory of the project>",
    "size": "<size of subtree in bytes>"
  },
 ...
]
```

For example

```
[
  {
    "tech_stack": [
      {
        "name": "python",
        "size": 2096
      },
      {
        "name": "pip",
        "settings": {
            "requirementsFilePath": "contoso/back-end-processor/requirements.txt"
        }
      }
    ],
    "path": "contoso/back-end-processor",
    "size": 3275
  },
  {
    "tech_stack": [
      {
        "name": "python",
        "size": 2497
      },
      {
        "name": "pip",
        "settings": {
            "requirementsFilePath": "contoso/back-end-job/requirements.txt"
        }
      },
      {
        "name": "django",
        "settings": {
            "manageFilePath": "contoso/back-end-job/manage.py"
        }
      }
    ],
    "path": "contoso/back-end-job",
    "size": 4162
  }
]
```

## Installation

gem install scout

## Usage

In a git repository, perform the following command -

```
scout /path/to/repository [OPTIONS] stacks-list
 
OPTIONS: -f (--force): To force a rescan
         -c (--commit=COMMIT_OID): "Commit to perform analysis on" (default to current HEAD of the repo)

When not provided, /path/to/repository defaults to current directory.
```

## How it works

_Scout_ takes the list of known tech stacks from [`tech_stacks.yml`](/lib/scout/tech_stacks.yml) and uses various strategies to determine the stacks used in each file. The working principal of _Scout_ is similar to that of [_Linguist_](https://github.com/github/linguist), and it uses the same detection strategies.


Each stack defined in `tech_stacks.yml` can take dependency on the language breakdown provided by _Linguist_. This improves performance by ignoring stacks which don't meet language criteria.

Unlike _Linguist_, a single blob may have affiliation with more than one tech stacks (an example would be, a single package.json can be contain multiple javascript/node frameworks).

## Contributing

Setup development environment by running `script/bootstrap`. This script will:
- Pull all the required gems into `vendor/gems` folder
- Generate a binstub at `binstub` folder
- Clone sample repositories to `samples/repositories`

### Adding a new tech stack
Process of adding a new stack is much similar to _Linguist_.

To add support for a new stack:
1. Add an entry for the new stack to `tech_stacks.yml`. Specify `type` of the stack. Currently supported types are - `framework`, `buildtool`, `packagemanager`, and `runner`.
2. Much like linguist, criteria for detection strategies filename, extension, shebang and modeline to be added to `tech_stacks.yml`
3. If the stack depends on any language, it needs to go under `dependsOn`. The name of language needs to be same as that defined in Linguist_
4. For heustrics detection strategy, regex pattern rules are to be added for the relevant extension to [`heuristics.yml`](/lib/scout/heuristics.yml)
5. The stack_id will be added after merge, so you don't need to add it. Alternatively, you can run `script/update-ids` to generate stack_id for the new stack you added.

After these steps, here's how your `tech_stacks.yml` entry would look like

```
React:
  type: framework
  filenames:
    - "package.json"
  dependsOn:
    - JavaScript
    - TypeScript
  stack_id: <generated>
```

And here's the `heuristics.yml` entry to detect React

```
- extensions: ['.json']
  rules:
  - stack: React
    named_pattern: react
...

named_patterns:
  react: '\"react\":\s*\".*\"'
```
### Testing your changes

Once your changes are ready, perform `script/bootstrap` again to build the project and regenerate the binstub. This binstub can be used on whichever repository you want for testing.

The tests are kept under `test/` folder. Test files starting with `test_` are unit tests, file starting with `functional_` are functional tests.

**Unit tests**

To add unit test, add it to the test file of the respective class you want to add more tests to. If you added a new functionality with a new file, add a test file, following the `test_file_name_in_lib` convention.

To run unit tests, run the command `bundle exec rake test`.

**Functional tests**

Functional tests run scout binstub as a command line tool and execute `stacks-list` command against the sample respositories. Sample repositories are defined in [sample_repositories.yml](samples/sample_repositories.yml). Each repository has its url and sha to be cloned. These repositories are cloned to `samples/repositories` folder.

To add a sample repository, add an entry to the sample_repositories.yml,
- Mention your git repository url, take reference of existing entries,
- Name will be the name of folder to clone the repository to,
- Mention the revision/branch/tag/commit of the repository you want to be cloned, this is important as this makes sure that any changes in the sample repositories won't change expected the results. If left blank, default branch will be cloned (main/master),
- Mention the `tech_stacks` present in the repository at that commit,

After adding your sample repository to sample_repositories.yml, you can either run `script/bootstrap` or `script/load-sample-repositories` to have your repo cloned .

To run functional tests, run the command `bundle exec rake functional_test`.
