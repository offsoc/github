# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Releases < Seeds::Runner
      MEMBERS_PER_REPO = 5
      PRS_PER_RELEASE = 3

      def self.help
        <<~HELP
        Creates 2 repos: releases-repo and releases-feed-repo for release testing.
        releases-repo will by default have 5 members, 1 published release, 2 draft releases, and PRS_PER_RELEASE PRs per published release.
        releases-feed-repo will have 1 release that's shown in monalisa's feed.
        Each repository will have MEMBERS_PER_REPO new users created and added as members.
        The number of releases created in releases-repo can be configured by passing in the --release_count option.
        Each release will have a package if the --with_package option is set.
        HELP
      end

      def self.run(options = {})
        # create a base repo with some PRs and release data
        monalisa = Objects::User.monalisa
        repo = Seeds::Objects::Repository.create(
          repo_name: "releases-repo",
          owner_name: monalisa.login,
          setup_master: true,
          is_public: true
        )
        puts "Created releases-repo"

        Seeds::Objects::Commit.create(
          repo: repo,
          message: "Adding yml config",
          committer: repo.owner,
          files: { "#{Release::ReleaseNotes::RELEASE_NOTES_CONFIG_PATHS[0]}" => { "changelog" => { "categories" => [] } }.to_yaml }
        )
        puts "Added default yaml config file"

        Seeds::Objects::Release.add_repo_members(MEMBERS_PER_REPO, repo: repo)
        puts "Added new repo members"

        releases_to_create = options[:release_count] || 1
        with_package = options[:with_package] || false
        releases_to_create.times { Seeds::Objects::Release.add_prs_and_release_new_version(PRS_PER_RELEASE, repo: repo, with_package: with_package) }

        # add a draft release with a blank tag
        Seeds::Objects::Release.create(repo: repo, tag_name: nil, draft: true, name: "Draft Release")

        # add a draft release with an existing tag
        repo.reload
        tag_name = "vExample"
        tag = repo.refs.find(tag_name) || repo.tags.create(tag_name, repo.ref_to_sha(repo.default_branch), repo.owner)
        draft = Seeds::Objects::Release.create(repo: repo, tag_name: tag_name , draft: true, name: "Release With Artifacts")
        Seeds::Objects::Release.create_asset(draft, name: "Binary")
        Seeds::Objects::Release.create_asset(draft, name: "Checksum")
        Seeds::Objects::Release.create_asset(draft, name: "Documentation")

        puts "Created draft releases"

        # set up another repo with releases so there are some releases shown in the feed
        feed_user = Seeds::Objects::User.create(login: "monalisa-feed")
        feeds_repo = Seeds::Objects::Repository.create(
          repo_name: "releases-feed-repo",
          owner_name: "monalisa-feed",
          setup_master: true,
          is_public: true
        )
        Seeds::Objects::Release.enable_repo_for_releases_in_feed(feeds_repo)
        puts "Created releases-feed repo"

        Seeds::Objects::Release.add_repo_members(MEMBERS_PER_REPO, repo: feeds_repo)
        puts "Added new repo members"

        Seeds::Objects::Release.add_prs_and_release_new_version(PRS_PER_RELEASE, repo: feeds_repo)

        puts "Repairing Releases search index..."
        # These calls are breaking our CI, so we stub them out in the test environment.
        # Please make sure that any changes here are covered by the test in
        # `test/script/seeds/runners/releases_test.rb`.
        elastomer_app = Elastomer::App.new
        releases_index = elastomer_app.primary_index(Elastomer::Indexes::Releases)
        elastomer_app.load_data(releases_index)
      end
    end
  end
end
