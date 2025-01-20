# `CODEOWNERS` files

Knowing who owns a project or piece of code is often tribal knowledge, which makes it difficult to know who to ask for help, feedback, or review. `CODEOWNERS` files specify who is responsible for maintaining a project or specific files in a project, and may be used to notify maintainers of modifications or to enforce approval in reviews.

For example:

```
$ cat CODEOWNERS
# Specify global owners by email, GitHub username, or team.
*           user@example.com @username @org/team

# Specific files by gitignore compliant pattern
*.js        @org/js
LICENSE*    @org/legal

# Last matching pattern takes precedence.
# @org/js will not come up as a owner of this specific JS file
special.js  @specialowner
```

## Who should be in an `CODEOWNERS` file?

Only the people who are actively investing energy in the improvement of a directory should be listed as `CODEOWNERS`. `CODEOWNERS` are responsible for ensuring the quality of code in their directory remains high and improves over time.

## Attribution

This specification is inspired by [Chrome's OWNERS files](https://www.chromium.org/developers/owners-files).

## Maintainership

The CODEOWNERS functionality is currently maintained by [the Pull Requests team](https://github.com/github/pull-requests). Please see Pull Request's [Technical documentation and additional context](https://github.com/github/pull-requests/blob/11aabfab0d9220c7135fc805e6313c259c23150f/docs/features/codeowners.md).

## Testing

- Docs for [minitest](https://github.com/minitest/minitest) suite for more information.
- Run the below commands to run the test suite:

```
$ bundle install
$ bundle exec rake test
```

- To test changes from a CODEOWNERS branch, you can update the `codeowners` gem in github's [Gemfile](https://github.com/github/github/blob/master/Gemfile) with the command below:

```
rbenv install 3.0.4

script/vendor-gem https://github.com/github/CODEOWNERS -r <your-codeowners-branch-name>
```