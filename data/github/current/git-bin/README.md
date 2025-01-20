git-bin
=======

GitHub extension commands for git.

This directory has commands meant to be executed in the context of a GitHub
server managed git repository. They include commands used by the application's
web interface and background workers (eg. `git-condense-diff`) as well as
commands useful for performing maintenance commands in a shell
(`git-last-fsck`).

The commands are typically accessed via two main interfaces:

`Repository#git_command`
------------------------

Within the GitHub app itself, commands are executed using the
`Repository#git_command` method. This takes the name of a command along with a
options hash:

    repo = Repository.with_name_with_owner('github/haystack')
    repo.git_command('condense-diff', {:quiet => true}, 'arg1', 'arg2')

When a command exits with a non-zero status, an exception is raised with
`exitstatus` and `err` attributes for accessing the exit code and stderr output,
respectively.

Shell interface
---------------

All commands are available as normal git commands (on `PATH`) when accessing a
repository in a production environment. Change into the git repository directory
and run commands using normal git invocation syntax.

For example, to run the `git-bin/git-condense-diff` command:

    $ git condense-diff --quiet arg1 arg2

You can also get these commands in development environments by placing `bin` or
`git-bin` on your `PATH` of by sourcing the GitHub shell environment:

    [github]$ . config/shrc
    [github]$ shard -l github/haystack
    [1234.git]$ git condense-diff --quiet arg1 arg2
