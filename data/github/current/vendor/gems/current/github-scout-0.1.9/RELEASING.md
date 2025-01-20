# Releasing

This is the procedure for making a new release of _Scout_. The entire process needs to be performed by a member of GitHub staff.

1. Create a branch for the release: `git checkout -b release-vxx.xx.xx`
2. Make sure your local dependencies are up to date: `rm Gemfile.lock && script/bootstrap`
3. Ensure all unit tests are green: `bundle exec rake test`
4. Ensure all functional tests are passing: `bundle exec rake functional_test`
5. Bump gem version in `lib/scout/VERSION`,
6. Make a PR to `github/scout`, once things look good, merge the `github/scout` PR
7. After merging PR, pull the latest changes from main branch.
8. Tag and push: `git tag vx.xx.xx; git push --tags` on `main` branch
9. Create a GitHub release with the pushed tag and populate it with a list of the commits from `git log --pretty=format:"- %s" --reverse refs/tags/[OLD TAG]...refs/tags/[NEW TAG]

## Consume in github/github
1. From `github/github` codespace run this command `script/vendor-gem https://github.com/github/scout -r <tag>`
2. Update scout version in Gemfile of github/github.
