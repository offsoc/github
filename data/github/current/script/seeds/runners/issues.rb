# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Issues < Seeds::Runner
      def self.help
        <<~HELP
        Create sample issues to demonstrate mentions between issues in different repositories.
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        hub_repo = Seeds::Objects::Repository.hub_repo
        examples_repo = Seeds::Objects::Repository.create(owner_name: mona, repo_name: "examples", setup_master: true, is_public: true)
        other_repo = Seeds::Objects::Repository.create(owner_name: mona, repo_name: "other", setup_master: true, is_public: true)

        hub_issue = Seeds::Objects::Issue.create(
          repo: hub_repo,
          actor: mona,
          title: "First issue",
        )

        examples_issue = Seeds::Objects::Issue.create(
          repo: examples_repo,
          actor: mona,
          title: "Sample issue",
        )

        other_issue = Seeds::Objects::Issue.create(
          repo: other_repo,
          actor: mona,
          title: "Other issue",
        )

        issue = Seeds::Objects::Issue.create(
          repo: examples_repo,
          actor: mona,
          title: "Examples for auto-linked references and URLs",
          body:
            <<~EOF
            ## Issues and pull requests

            According to [Autolinked references and URLs - GitHub Help](https://docs.github.com/github/writing-on-github/autolinked-references-and-urls), these are the supported references to issues and pull requests:

            | Reference type | Raw reference | Rendered link |
            | --- | --- | --- |
            | Issue or pull request URL | `http://github.localhost/#{examples_repo.nwo}/issues/#{examples_issue.number}` | http://github.localhost/#{examples_repo.nwo}/issues/#{examples_issue.number} |
            | **#** and issue or pull request number | `##{examples_issue.number}` | ##{examples_issue.number} |
            | **GH-** and issue or pull request number | `GH-#{examples_issue.number}` | GH-#{examples_issue.number} |
            | **Username/Repository#** and issue or pull request number | `#{other_repo.nwo}##{other_issue.number}` | #{other_repo.nwo}##{other_issue.number} |
            | **Organization_name/Repository#** and issue or pull request number | `#{hub_repo.nwo}##{hub_issue.number}` | #{hub_repo.nwo}##{hub_issue.number} |

            ### References are checked for existence and access

            Issues and pull requests are only auto-linked and shortened if they exist and you have access. This is checked during Markdown rendering. The following links don't get rendered nicely because their destination doesn't exists. (The full URL only becomes a hyperlink but doesn't get shortened.)

            - #{examples_repo.nwo}#1000
            - #{hub_repo.nwo}#200
            - http://github.localhost/#{hub_repo.nwo}/issues/200
            EOF
        )
      end
    end
  end
end
