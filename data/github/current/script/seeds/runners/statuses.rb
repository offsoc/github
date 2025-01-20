# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Statuses < Seeds::Runner
      def self.help
        <<~HELP
        Seed a status for every commit in a specific repo and branch.
        If a branch is not specified, the default branch is used.
        If a context is not specified, the 'default' context is used.
        HELP
      end

      def self.run(options = {})
        repo = Repository.nwo(options[:nwo])
        if repo.nil?
          raise Runner::RunnerError, "Could not find repo '#{options[:nwo]}'"
        end

        branch = options[:branch] || repo.default_branch

        if repo.heads.find(branch)&.nil?
          raise Runner::RunnerError, "Could not find branch '#{branch}' for repo '#{options[:nwo]}'"
        end

        head = repo.rpc.read_refs["refs/heads/#{branch}"]
        oids = repo.rpc.list_revision_history(head)

        puts "Seeding statuses for #{oids.count} commits in #{repo.full_name} on #{branch}"
        puts "Using context '#{options[:context] || 'default'}'"

        oids.each do |oid|
          status = Seeds::Objects::Status.create(
            repo: repo,
            sha: oid,
            state: options[:state],
            context: options[:context],
          )
          puts "- Commit <#{oid}>: Added Status [state: '#{status.state}']"
        end
      end
    end
  end
end
