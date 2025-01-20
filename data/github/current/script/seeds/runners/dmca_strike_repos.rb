# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class DmcaStrikeRepos < Seeds::Runner
      def self.help
        <<~EOF
        Seed repos that have dmca strikes against a user

        Seeding
        - Ensures copywrong user exists
        - Ensures copywrong/strike1 exists
        - Ensures copywrong/strike2 exists
        - Ensures copywrong/prequel-strike exists
        - Issues DMCA takedowns against strike1 and prequel-strike
        EOF
      end

      def self.run(options = {})
        takedown_url = "https://github.com/github/dmca/blob/master/2011/2011-01-27-sony.markdown"

        monalisa = Seeds::Objects::User.monalisa
        Seeds::Objects::User.add_stafftools(monalisa)

        bad_username = Seeds::DataHelper.random_username
        bad_user = Seeds::Objects::User.create(login: bad_username)
        unless bad_user.persisted? && bad_user.valid?
          raise Seeds::Objects::CreateFailed, "Bad user failed to created #{bad_user.errors.full_messages.join(", ")}"
        end

        prequel_strike = Seeds::Objects::Repository.create(owner_name: bad_username, repo_name: "prequel-strike", setup_master: true)
        strike1 = Seeds::Objects::Repository.create(owner_name: bad_username, repo_name: "strike1", setup_master: true)
        strike2 = Seeds::Objects::Repository.create(owner_name: bad_username, repo_name: "strike2", setup_master: true)

        puts "Created '#{bad_username}' user and repos"

        strike1.access.disable("dmca", monalisa, dmca_takedown: takedown_url)
        puts "Issued strike against #{bad_username}/strike1"

        prequel_strike.access.disable("dmca", monalisa, dmca_takedown: takedown_url)
        puts "Issued strike against #{bad_username}/prequel_strike"

        puts "Strikes issued against #{bad_username}. If they don't show up in the audit log or DMCA takedown page, run through the Audit Log troubleshooting steps on GitHubber or ask/search in #audit-log."
      end
    end
  end
end
