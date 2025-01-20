# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Release
      def self.create(repo:, tag_name: "v1.0.0", target_commitish: repo.default_branch, draft: false, name: nil, body: nil, release_author: nil)
        # auto generate the name and body
        if tag_name && [name, body].none?
          name, body = Releases::Public.generate_release_notes(
            repo,
            tag_name,
            target_commitish: target_commitish
          )
        end

        T.unsafe(Releases::Public).create_release({
          repository_id: repo.id,
          author_id: release_author&.id || repo.owner.id,
          tag_name: tag_name,
          name: name || "New Release",
          body: body,
          draft: draft,
          prerelease: false,
          target_commitish: target_commitish
          })
      end

      def self.create_asset(release, name: "New artifact")
        blob = Storage::Blob.create({
          oid: SecureRandom.hex(32),
          size: 100
        })
        ::ReleaseAsset.create({
          storage_blob: blob,
          repository_id: release.repository_id,
          release_id: release.id,
          size: 100,
          uploader_id: release.author_id,
          uploaded: true,
          name: name,
        })
      end

      def self.add_package(repo, release, name, version)
        pkg = repo.packages.build(name: name, package_type: Registry::Package.symbolize_package_type(:rubygems))
        pkg_version = pkg.package_versions.build(version: version, release: release, author: repo.owner)
        pkg_file = pkg_version.files.build(size: 1, state: 1)
        pkg.save
      end

      # Merges some new PRs into main
      # Creates a new release and bumps the version
      # If no previous semver, starts at v1.0.0
      def self.add_prs_and_release_new_version(num, repo:, with_package: false, **release_options)
        repo.reload
        # get Semantic::Version object for current version,
        # if absent or not semver, use "0.0.0" as the version
        current_tag = repo.refs.to_a.reverse.find do |ref|
          ref.name[1..].match(Semantic::Version::SemVerRegexp)
        end
        current_tag_name = current_tag ? current_tag.name : "v0.0.0"
        current_version = Semantic::Version.new(current_tag_name[1..])

        new_version_tag = "v" + current_version.increment!(:major).to_s

        # merge new prs, each one from a random repo member
        num.times do
          puts "Merging new pull request"
          create_merged_pr(repo, user: repo.members.sample)
        end

        # create a release for the new version
        release = T.unsafe(self).create(repo: repo, tag_name: new_version_tag, **release_options)
        if with_package
          add_package(repo, release, "package-#{new_version_tag}", new_version_tag)
        end
        puts "Created release #{new_version_tag} in #{repo.name} authored by #{release_options[:release_author] || repo.owner}"
      end

      # Makes monalisa star and follow another repo & its owner
      # releases in this other repo will show up in monalisa's feed
      def self.enable_repo_for_releases_in_feed(repo)
        mona = ::User.find_by_login("monalisa")
        mona.star(repo.owner)
        mona.star(repo)
        mona.follow(repo.owner)

        repo
      end

      # Creates a PR and merges into main
      def self.create_merged_pr(repo, user: repo.owner)
        repo.add_member(user)
        pr = Seeds::Objects::PullRequest.create(
          repo: repo,
          committer: user,
          base_ref: repo.refs.find(repo.default_branch)
        )
        pr.merge
      end

      # Creates a batch of new users, adds them to a repo
      def self.add_repo_members(num, repo:)
        new_users = (1..num).map { |n| Seeds::Objects::User.create(login: "#{Faker::Name.unique.first_name}#{n}") }
        repo.add_members(new_users)
      end
    end
  end
end
