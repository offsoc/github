# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CodeScanning < Seeds::Runner
      def self.help
        <<~HELP
        Create a repo with seeded alerts for code scanning development

        - by default creates new repo (or creates/updates named one)
        - opens PR from branch into main

        Requires turboscan (turbomock is not sufficient). See docs:
        https://github.com/github/code-scanning/blob/main/docs/running-your-own-instance.md#codespaces-all-the-things-recommended-if-modifying-turboscan

        HELP
      end

      def self.run(options = {})
        puts "\n"

        @mona = Seeds::Objects::User.monalisa
        @owner = find_owner(options)

        if @owner.organization?
          print "Marking advanced security as purchased..."
          if @owner.business.present?
            @owner.business.mark_advanced_security_as_purchased_for_entity(actor: @owner.admins.first)
          else
            @owner.mark_advanced_security_as_purchased_for_entity(actor: @owner.admins.first)
          end
          puts " ✅\n\n"
        end

        print "Creating/updating example repo for code scanning..."
        @repo = Seeds::Objects::Repository.restore_premade_repo(
          location_premade_git: options[:repo_path],
          owner_name: @owner.login,
          repo_name: options[:name] || "codescan-repo-with-alerts-#{Time.now.to_i}",
          is_public: options[:is_public] || !@owner.organization?,
        )
        puts " ✅\n\n"

        # Restoring a premade repo will in some cases not have the default branch loaded in the call to `@repo.refs`.
        # This causes 2 issues in this script:
        # - Enabling advanced security for an org-owned repository will publish a
        #   `github.security_center.v1.SecurityFeatureRepoUpdate` message where the default branch is blank and this
        #   will in turn result in the alerts not being shown at the org-level.
        # - `self.process_refs` will fail because we depend on looking up the default branch (main).
        @repo.reload

        if @owner.organization?
          print "Enabling advanced security..."
          @repo.enable_advanced_security(actor: @owner.admins.first)
          puts " ✅\n\n"
        end

        self.process_refs

        puts "\n"
        puts "Your new repository is ready:\n"
        puts "    http://#{GitHub.host_name}/#{@repo.nwo}"
        puts "\n"
      end

      def self.process_refs
        @repo.refs.repository.rpc.with_timeout(1.minute) do
          @repo.refs.each do |ref|

            if ref.name == "main"

              # for main we process the sarif from all commits, going from oldest to newest
              # this allows us to populate turboscan with an appropriate history for the repo,
              # giving (eg) resolved alerts and timeline events in the example repo
              commits = self.commits_to_process(ref)

              self.process_commits(ref, commits)

            elsif ref.name.start_with? "pr_"
              # we want commits and analyses to show up interleaved for pushes to PRs
              # so we mirror the changes from each commit onto a new branch submit analyses
              # for each commit in turn

              # we process all commits since the branch diverged from main
              commits = self.commits_to_process(ref, excluded_oids = [@repo.refs["main"].commit.oid])

              new_ref = @repo.refs.create("refs/heads/branch_#{ref.name}", commits.first.oid, @mona)

              pull_request = PullRequest.create_for!(@repo,
                user: @mona,
                title: "Change the makeup of alerts (#{new_ref.name})",
                body: "This PR changes the alerts present.",
                head: new_ref.name,
                base: "main",
              )

              pull_request.create_merge_commit

              merge_commit = @repo.commit_for_ref(pull_request.merge_commit_sha)
              self.process_sarif(merge_commit, pull_request.merge_ref)

              self.create_annotations(pull_request: pull_request)

              commits[1...].each do |commit|

                new_ref.update(commit, @mona)

                # there is a background job that updates the PR when the ref is updated
                # and we might need to wait for that to happen
                count = 0
                print "\nWaiting for PR to update"
                while pull_request.head_sha != commit.oid && count < 20
                  print "."
                  pull_request = PullRequest.find(pull_request.id)
                  sleep(0.2)
                  count += 1
                end
                print "\n"

                puts "\n🚨 PR update failed 🚨" if pull_request.head_sha != commit.oid

                merge_commit_sha = pull_request.create_merge_commit

                self.process_sarif(@repo.commit_for_ref(merge_commit_sha), pull_request.merge_ref)

                self.create_annotations(pull_request: pull_request)

              end

            else

              if ref.name.start_with? "protected_"
                @repo.protect_branch(ref.name, creator: @mona, entry_point: :script_seed_repo_for_code_scanning_development)
              end

              # we process all commits since the branch diverged from main
              commits = self.commits_to_process(ref, excluded_oids = [@repo.refs["main"].commit.oid])

              self.process_commits(ref, commits)

            end

          end
        end
      end

      def self.commits_to_process(ref, excluded_oids = [])
        # all the parent commits from the target ref are processed in order from oldest to newest,
        # except for those that are also present in the history of the excluded oids
        @repo.commits.except(heads = [ref.commit.oid], exclude = excluded_oids).reverse
      end

      def self.process_commits(ref, commits)
        commits.each do |commit|
          self.process_sarif(commit, ref.qualified_name)
        end

      end

      def self.process_sarif(commit, ref_name)

        print "Processing sarif files for #{commit.oid} in #{ref_name}..."

        require "tempfile"

        # ensure we have a new empty array as the default value
        all_runs = Hash.new { |hsh, key| hsh[key] = [] }

        sarif = T.let({}, Hash)
        # get content of all SARIF files repo (blob_by_id works even for huge files)
        commit.repository.tree_entries(commit.tree_oid, "", recursive: true)[1].each do |entry|
          if File.extname(entry.name).casecmp?(".sarif")
            sarif = GitHub::JSON.decode(commit.repository.blob_by_oid(entry.oid).data)
            sarif["runs"].each do |run|

              # hacky but functional, we pull the language name out of the ruleId for use as the category
              category = run.fetch("results", nil)&.first&.fetch("ruleId", nil)&.split("/")&.first

              # if we don't have any valid results then we skip this (empty) run
              next unless category

              run["automationDetails"] = { "id": "codeql/#{category}/" }

              all_runs[category] << run
            end
          end
        end

        unless all_runs.present?
          puts " ✅\n\n"
          return
        end

        all_runs.each do |_category, runs|
          # use the general format from the last sarif file
          # and smoosh all the runs into it
          sarif["runs"] = runs.flatten

          content = GitHub::JSON.encode(sarif)

          response = HTTParty.post(
            "http://api.github.localhost/repos/#{@repo.nwo}/code-scanning/sarifs",
            body: {
              "commit_sha" => commit.oid,
              "ref" => ref_name,
              "sarif" => Base64.strict_encode64(Coders::Gzip.new.dump(content)),
              "tool_name" => "CodeQL",
            }.to_json,
            headers: { "Authorization" => "token ghp_MonalisaTheOctoPatMonalisaTheOctoPat" }
          )

          if response.code != 202
            puts "\n\n🚨 API submission of SARIF data failed with #{response.code} 🚨"
            puts response.body
            if response.body.include? "Connection reset by peer"
              puts "\nℹ️ If you're using codespace-compose, this usually means that turboscan isn't running."
              puts "You might want to consider restarting `gh codespace-compose up` and running `script/server` in the turboscan codespace."
            elsif response.body.include? "end of file reached"
              puts "\nℹ️ If you're using codespace-compose, this usually means that some turboscan services " +
                "aren't up and running (e.g. minio) either because script/server wasn't run or because a service " +
                "the seed script is trying to communicate with has crashed."
              puts "You might want to consider re-running `script/server` in the turboscan codespace."
            elsif response.body.include? "Failed to open TCP connection to localhost"
              puts "\nℹ️ If you're using codespace-compose, this usually means that codespace-compose up isn't running."
              puts "You might want to consider restarting `gh codespace-compose up`."
            end
            abort
          end

        end

        puts " ✅\n\n"
      end

      def self.create_annotations(pull_request:)
        print "Creating PR annotations..."
        Seeds::Objects::Integration.create_code_scanning_integration

        check_run = self.get_check_run(pull_request)

        check_run.check_suite.update(head_branch: pull_request.head_ref)

        count = 0
        print "\nWaiting for check run to complete"
        # turboscan takes time to process all analyses, we re-run job run until checkrun is marked as completed
        until check_run.conclusion == "success" || count > 10
          print "."
          sleep(0.1)
          CreateCodeScanningAnnotationsJob.perform_now(check_run_id: check_run.id)
          check_run = self.get_check_run(pull_request)
          count += 1
        end
        puts " ✅\n\n"
      end

      def self.get_check_run(pull_request)
        ::CheckRun.create_for_code_scanning_analysis(
          repository: pull_request.repository,
          annotated_commit_oid: pull_request.head_sha,
          analyzed_commit_oid: pull_request.merge_commit_sha,
          tool_names: [::CodeScanning::Tool.default_tool_name],
          ref: pull_request.merge_ref,
          base_ref: "refs/heads/#{pull_request.base_ref}",
          base_sha: pull_request.base_sha,
        ).first
      end

      def self.find_owner(options = {})
        return ::Organization.find_by!(login: options[:organization_name]) if options[:organization_name]
        return Seeds::Objects::Organization.github if options[:organization]

        @mona
      end
    end
  end
end
