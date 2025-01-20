# frozen_string_literal: true

require Rails.root.join("script/seeds/objects")

namespace :enterprise do
  namespace :actions do
    # Initialize the organization that will own the in-the-box actions. Won't use existing
    # ones unless they have the right email/login:
    #
    # owner_email: The email address for the owner
    # owner_names: "^" separated list of possible owner names to try
    # org_names: "^" separated list of possible org names to try
    #
    # (Yes, the "^" separation is weird, blame rake argument parsing)
    #
    desc "seeds the actions owner and org for enterprise"
    task :init_actions_owner_and_org, [:owner_email, :owner_names, :org_names] => [:environment] do |_t, args|
      next unless GitHub.single_or_multi_tenant_enterprise?

      owner = find_or_create_owner(args[:owner_email], args[:owner_names].split("^"))
      org = find_or_create_org(owner, args[:org_names].split("^"))

      puts "Actions organization owner: #{owner.login}"
      puts "Actions organization name: #{org.login}"
    end

    # Initialize the two first party organizations that will own the in-the-box actions. Won't use existing
    # ones unless they have the right email/login:
    #
    # Required arguments:
    # owner_email: The email address for the owner
    # owner_names: "^" separated list of possible owner names to try
    # actions_org_names: "^" separated list of possible org names to try when creating the Actions organization
    # github_org_names: "^" separated list of possible org names to try when creating the GitHub organization
    #
    task :init_actions_owner_and_first_party_orgs, [:owner_email, :owner_names, :actions_org_names, :github_org_names] => [:environment] do |_t, args|
      next unless GitHub.single_or_multi_tenant_enterprise?

      owner = find_or_create_owner(args[:owner_email], args[:owner_names].split("^"))
      actions_org = find_or_create_org(owner, args[:actions_org_names].split("^"))
      github_org = find_or_create_org(owner, args[:github_org_names].split("^"))

      puts "First party organizations owner: #{owner.login}"
      puts "Actions organization name: #{actions_org.login}"
      puts "GitHub organization name: #{github_org.login}"
    end

    def find_or_create_owner(email, names)
      existing = User.find_by_email email
      return existing if existing.present?

      names.each do |name|
        next if User.find_by_login name
        begin
          user = User.create!(
            login: name,
            email: email,
            password: SecureRandom.hex,
            require_email_verification: false,
            billing_attempts: 0,
            plan: "medium"
          )
          user.emails.map(&:verify!)
          return user
        rescue ActiveRecord::RecordInvalid => e
          puts "An error occurred while creating user with login #{name}: #{e.message}"
          next
        end
      end

      raise ArgumentError, "Trying to find or create users for the Actions org failed."
    end

    def find_or_create_org(owner, names)
      names.each do |name|
        if org = owner.organizations.find_by_login(name) # Already exists!
          return org
        end

        next if Organization.find_by_login(name) # Must be owned by somebody else

        org = Organization.create(
          login: name,
          admin: owner,
          billing_email: owner.email,
          plan: "enterprise",
        )

        unless org.valid? && org.persisted?
          puts "Organization #{name} failed to create: #{org.errors.full_messages.to_sentence}\n#{org.inspect}"
          next
        end
        org.update(
          profile_bio: "Automate your GitHub workflows",
          profile_name: "GitHub Actions"
        )
        return org
      end

      raise ArgumentError, "All available organization names are already taken"
    end

    # Initialize in-the-box actions. Creates the initial set of actions (as repos)
    # from seeds planted on the image. Created at :org/:repo
    #
    # org_login: The name of the org
    # repo: The name of the repo
    # path_to_git_dir: Path to an existing git repo's .git folder
    #
    task :init_action, [:org_login, :repo, :path_to_git_dir] => [:environment] do |_t, args|
      return unless GitHub.enterprise?

      unless org = Organization.find_by_login(args[:org_login])
        raise ArgumentError, "Could not find organization with login: #{args[:org_login]}"
      end

      unless RetiredNamespace.retired?(org.login, args[:repo])
        repo = restore_premade_repo(
          git_folder: args[:path_to_git_dir],
          owner_name: org.login,
          repo_name: args[:repo],
          is_public: true,
          visibility: Repository::PUBLIC_VISIBILITY)
      end
    end

    task :set_org_avatar, [:org, :path_to_avatar] => [:environment] do |_t, args|
      return unless GitHub.enterprise?

      unless File.extname(args[:path_to_avatar]).eql? ".png"
        raise ArgumentError, "Avatar expected to be a .png file, got: #{args[:path_to_avatar]}"
      end
      logo = IO.binread(args[:path_to_avatar])

      org = Organization.find_by(login: args[:org])
      owner = org.owner

      # Create the auth token
      avatar = Avatar.new(
        asset: Asset.new(size: logo.size),
        size: logo.size,
        content_type: "image/png",
      )
      token = avatar.storage_cluster_upload_token(avatar.storage_policy(actor: owner))

      # Upload the file
      upload_url = GitHub.url + "/storage/avatars"
      upload_headers = { "Accept" => "application/vnd.github.assets+json; charset=utf-8", "GitHub-Remote-Auth" => token }

      upload_params = {
        file: Faraday::UploadIO.new(StringIO.new(logo), "image/png"),
        name: args[:path_to_avatar].split("/").last,
        content_type: "image/png",
        owner_type: "User",
        owner_id: org.id,
        size: logo.size
      }

      upload_connection = Faraday.new do |f|
        f.request :multipart
        f.request :url_encoded
        f.adapter :net_http
      end

      upload_response = upload_connection.post(upload_url, upload_params, upload_headers)
      parsed_response_body = GitHub::JSON.parse(upload_response.body)

      # Set app primary avatar to the newly-created one
      # (like the "crop and confirm" step on the manual process).
      # Notice that the second argument is the updater, and not the user that
      # will get the avatar set (that is implicit within the avatar)
      if upload_response.success? && parsed_response_body && parsed_response_body["id"]
        avatar = Avatar.find(parsed_response_body["id"])
        PrimaryAvatar.set!(avatar, owner, handle_previous_avatar: true)
      else
        error = RuntimeError.new "Avatar upload failed."
        Failbot.report error, app: "github-user"
      end
    end

    def restore_premade_repo(git_folder:, owner_name:, repo_name: nil, is_public: false, visibility: Repository::INTERNAL_VISIBILITY)
      repo = create(owner_name: owner_name, repo_name: repo_name, setup_master: false, is_public: is_public, visibility: visibility)

      # We need to ensure that we pass `git_folder` with a trailing `/` so
      # that rsync will just copy the contents of the `git_folder` directory and not the directory itself.
      git_folder = "#{git_folder}/" unless git_folder.end_with?("/")
      rsync_opts = { archive: true, hard_links: true, delete: true }
      repo.dgit_all_routes.each do |route|
        rpc = route.build_maint_rpc

        begin
          # NOTE: `rsync` does **not** copy files over the network.
          # It requires the provided `git_folder` path to be present on each node
          # and copies the folder contents locally on that node.
          rpc.rsync(git_folder, route.path, rsync_opts)
          puts "Restored the premade repo #{git_folder.inspect} to #{route.path.inspect} on #{route.host.inspect}."
        rescue ::GitRPC::Error => e
          raise ArgumentError, "An error occurred while copying the premade repo #{git_folder.inspect} to #{route.path.inspect} on #{route.host.inspect}: #{e.message}"
        end
      end

      reader = GitHub::DGit::Routing.hosts_for_network(repo.network.id).first

      GitHub::DGit::Maintenance.recompute_checksums(repo, reader, is_wiki: false, force_dgit_init: true)

      repo
    end

    def create(owner_name:, repo_name:, setup_master:, is_public: false, visibility: Repository::INTERNAL_VISIBILITY)
      owner = ::Organization.find_by_login(owner_name) || ::User.find_by_login(owner_name)

      repo = ::Repository.nwo("#{owner_name}/#{repo_name}")
      unless repo
        repo = ::Repository.handle_creation(
          owner.organization? ? owner.admins.first : owner,
          owner,
          {
            name: repo_name,
            has_wiki: false,
            public: is_public,
          },
          synchronous: true
        ).repository
        repo.reset_memoized_attributes

        raise Seeds::Objects::CreateFailed, repo.errors.full_messages.to_sentence unless repo.persisted?
      end

      repo.setup_git_repository

      # ensure that any existing repo has the required privacy
      repo.public = is_public
      repo.save!

      repo.set_visibility(actor: owner, visibility: visibility)

      # if required, check the master branch has been created
      branch(repo, "master") if setup_master && !owner.bot?

      repo
    end

    # Ensures that a tenant for the global enterprise/business ("billing plan owner")
    # is created on Actions Services.
    # Note this does not guarantee it is actually faulted into all Actions Services.
    task :init_global_business_tenant => [:environment] do |_t, _args|
      if GitHub.single_business_environment?
        business = GitHub.global_business
        puts "Ensuring Actions tenant exists for business: #{business.name} (#{business.id})"
        GitHub::LaunchClient::Deployer::setup_tenant(business)
      else
        puts "Not initializing Actions tenant since not in single business environment"
      end
    end
  end
end
