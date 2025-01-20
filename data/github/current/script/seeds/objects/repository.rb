# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Repository
      attr_reader :repo

      class << self
        def hub_repo
          # We want hub to be owned by github the org, so make that first
          org = Seeds::Objects::Organization.github(admin: Objects::User.monalisa)
          # Don't make this a class instance var or tests will become flaky
          # as state is not reset between tests
          # This is ok as we short circuit below and return the object if it already exists
          create(owner_name: org.login, repo_name: "hub", setup_master: true)
        end

        def create_with_nwo(nwo:, setup_master:, is_public: false)
          if (repo = ::Repository.nwo(nwo))
            repo.setup_git_repository # Ensure this is setup
            return repo
          end

          owner, name = nwo.split("/", 2)
          create(owner_name: owner, repo_name: name, setup_master: setup_master, is_public: is_public)
        end

        def create(owner_name:, repo_name: nil, setup_master:, is_public: false, description: nil, template: false)
          owner = ::Organization.find_by_login(owner_name) || ::User.find_by_login(owner_name) ||
            Seeds::Objects::Organization.create(login: owner_name, admin: Objects::User.monalisa)
          repo_name ||= random_repo_name_for(owner)

          repo = ::Repository.nwo("#{owner_name}/#{repo_name}")
          unless repo
            random_boolean = [true, false].sample
            desc = description || (random_boolean ? "#{Faker::Movies::StarWars.quote}" : "")

            repo = ::Repository.handle_creation(
              owner.organization? ? owner.admins.first : owner,
              owner,
              {
                name: repo_name,
                description: desc,
                public: is_public,
                template: template
              },
              synchronous: true
            ).repository
            repo.reset_memoized_attributes

            raise Seeds::Objects::CreateFailed, repo.errors.full_messages.to_sentence unless repo.persisted?
          end

          repo.setup_git_repository

          # make sure we do not proceed until the repo is fully persisted to disk
          i = 0
          wait_time_secs = 5
          unless repo.exists_on_disk? || i > wait_time_secs
            i += 1
            sleep 1
          end

          raise if i > wait_time_secs

          # ensure that any existing repo has the required privacy
          repo.public = is_public
          repo.save!

          # if required, check the default branch has been created
          branch(repo, repo.default_branch) if setup_master && !owner.bot?

          repo
        end

        def setup_branch(committer:, repo:, branch:, from_branch:)
          committer = committer.organization? ? committer.members.first : committer
          Seeds::Objects::Commit.create(committer: committer, repo: repo, branch_name: branch, from_branch: from_branch)
          repo.heads.find(branch)
        end

        def branch(repo, branch, from_branch: repo.default_branch)
          repo.heads.find(branch) || setup_branch(committer: repo.owner, repo: repo, branch: branch, from_branch: from_branch)
        end

        def restore_premade_repo(location_premade_git:, owner_name:, repo_name: nil, is_public: false, import_users: false, template: false)
          if location_premade_git.include?("://") || location_premade_git.start_with?("git@")
            temp_folder = File.join(Dir.tmpdir, SecureRandom.hex(10))
            child = Progeny::Command.new("git", "clone", location_premade_git, temp_folder)
            unless child.status.success?
              raise "git clone failed: #{child.err}"
            end
            git_folder = File.join(temp_folder, ".git")
          else
            git_folder = location_premade_git
          end

          repo = create(owner_name: owner_name, repo_name: repo_name, setup_master: false, is_public: is_public, template: template)

          repo.dgit_all_routes.map(&:path).each do |dest|
            FileUtils.rm_rf(dest)
            FileUtils.mkdir_p File.dirname(dest)
            FileUtils.cp_r(git_folder, dest)
          end

          FileUtils.rm_rf(temp_folder) if temp_folder != nil

          reader = GitHub::DGit::Routing.hosts_for_network(repo.network.id).first

          GitHub::DGit::Maintenance.recompute_checksums(repo, reader, is_wiki: false, force_dgit_init: true)

          import_users_from_commit_history(repo) if import_users

          repo
        end

        def import_users_from_commit_history(repo)
          email_to_login_map(repo).each_slice(5).flat_map do |authors|
            ::User.transaction do
              authors.map do |author|
                user = create_user_from_repo_author(author)
                # add user as member of the repository
                repo.add_member(user) if user
                user
              end
            end
          end
        end

        # Returns a hash in the form of {"file path" => "file contents"}. Directories are not included.
        def get_repo_blob_contents(repo:, branch: repo.default_branch)
          ref = Seeds::Objects::Git::Ref.find_or_create_branch_ref(repo: repo, ref_name: branch, target_ref_name: repo.default_branch)
          raise Seeds::Objects::CreateFailed, "Reference for #{branch} not found. Try reloading repo." unless ref

          files = {}
          repo.tree_entries(ref.sha, "", recursive: true)[1].each do |entry|
            files[entry.path.to_s] = entry.data.to_s if entry.type == "blob"
          end

          files
        end

        private

        def email_to_login_map(repo)
          repo.heads.flat_map do |head|
            get_commits(branch: head, repo: repo).map do |commit|
              author = commit["author"]
              name = author[0]
              email = author[1]
              [email, name]
            end
          end.to_h
        end

        def random_repo_name_for(owner)
          count = owner.repositories.count
          "#{Faker::Hipster.word}-#{count}"
        end

        def create_user_from_repo_author(author)
          email = author[0]
          login = author[1]

          login = Seeds::Objects::User.sanitize_login(login)

          if login.blank?
            login = email.split("@").first
            login = Seeds::Objects::User.sanitize_login(login)
          end

          Seeds::Objects::User.create(login: login, email: email)
        rescue Seeds::Objects::CreateFailed => e
          puts "Error creating user #{login} with email #{email}: #{e.message}"
        end

        def get_commits(branch:, repo:)
          head = repo.rpc.read_refs["refs/heads/#{branch.name}"]
          oids = repo.rpc.list_revision_history(head)
          repo.rpc.read_commits(oids)
        end
      end
    end
  end
end
