# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GitHubRepo < Seeds::Runner
      REPO_API_BASE_URL = "https://api.github.com/repos/"
      USER_AGENT_STRING = "GitHub-Seeds/1.0 GitHubRepo"
      @source_repo_metadata = {}
      @github_token = ""

      def self.help
        <<~HELP
        Creates copies of the code part of repos from GitHub.com
        - in case of user owned repo the user will be created
        - in case of org owned repo default admin user is 'monalisa' (overwrite possible with --admin)
        - in case of org owned repo default associated business is 'GitHub, Inc' (overwrite possible with --business)
        - providing a personal access token allows to copy over private and internal repositories (--token or env variable $SEED_REPO_PULL_TOKEN)
        - preserves the repo's visibility status

        Example Usage:
          # public user repo -> user will be auto created if it doesn't exist
          bin/seed github_repo --nwo h2floh/azure-dev-ops-react-ui-unit-testing

          # private org repo -> org will be created and auto assigned to GitHub, Inc enterprise with monalisa as admin
          bin/seed github_repo --nwo bbq-beets/h2floh --token $DIFFERENT_REPO_PULL_TOKEN

          # public org repo -> org will be created and assigned to MyInc enterprise and newuser as admin (both will be created if not yet exist)
          bin/seed github_repo --nwo korea-dinos/publicrepo --business MyInc --admin newuser

          # public repo -> org will be created not belonging to any enterprise setting monalisa as admin
          bin/seed github_repo --nwo korea-dinos/publicrepo --skip_business

          # public repo -> the visibility will be overwritten and set to internal
          bin/seed github_repo --nwo korea-dinos/publicrepo --overwrite_visibility internal

          # public repo -> will be a template repository
          bin/seed github_repo --nwo korea-dinos/publicrepo --template true
        HELP
      end

      class << self
        def run(options = {})
          # Retrieve the GITHUB_TOKEN to use (can be empty to access public repos)
          @github_token = get_github_token(options)
          # Validate input parameters
          validate_options(options)
          # Retrieve the source repo metadata
          @source_repo_metadata = retrieve_source_repo_metadata(options[:nwo])

          # if repo belongs to a user don't create org and business
          if @source_repo_metadata["owner"]["type"] == "User"
            owner = create_user_as_owner(login: @source_repo_metadata["owner"]["login"])
          else
            owner = create_org_as_owner(login: @source_repo_metadata["owner"]["login"], options: options)
          end

          # clone and add the repo
          copy_repo_from_source(options)
        end

        private

        # Wrapping this makes it easy to test
        def run_cmd(cmd)
          system(cmd)
        end

        # Wrapping this makes it easy to test
        def restore_repo(location_premade_git:, owner_name:, repo_name:, is_public:, import_users:)
          Seeds::Objects::Repository.restore_premade_repo(
            location_premade_git: location_premade_git,
            owner_name: owner_name,
            repo_name: repo_name,
            is_public: is_public,
            import_users: import_users)
        end

        # Wrapping this makes it easy to test
        def return_path(pathname:)
          pathname.realpath.to_s
        end

        # create a user as owner
        def create_user_as_owner(login:)
          user = Seeds::Objects::User.create(login: login)
        end

        # creates an org as owner and associate it with a business or not depending on command line options
        def create_org_as_owner(login:, options:)
          # if no user was provided use monalisa otherwise create user
          user = Seeds::Objects::User.monalisa
          unless options[:admin].nil? || options[:admin].blank?
            user = Seeds::Objects::User.create(login: options[:admin])
          end

          # create the organization
          org = Seeds::Objects::Organization.create(login: login, admin: user)

          # add new org to business (makes it easier to use self hosted runner groups on business level)
          unless options[:skip_business]
            # if no business was provided use GitHub, Inc otherwise create business
            biz = Seeds::Objects::Business.github
            unless options[:business].nil? || options[:business].blank?
              biz = Seeds::Objects::Business.create(name: options[:business], owner: user)
            end
            biz.add_organization(org)
          end
        end

        # copyied and adapted from script/seeds/runners/repos.rb
        def copy_repo_from_source(options)
          clone_url = @source_repo_metadata["clone_url"]
          dir_name = "/tmp/#{@source_repo_metadata["full_name"]}"
          puts "Cloning Repo #{clone_url}"
          puts "Init clone directory #{dir_name}"
          FileUtils.remove_dir(dir_name, true)
          FileUtils.mkdir_p(dir_name)

          puts "Try git clone..."
          if !run_cmd("GITHUB_TOKEN=#{@github_token} git clone -q #{clone_url} #{dir_name}")
            # in this case we don't have access
            puts "failed."
            raise Runner::RunnerError, "Could not find or don't have access to repo '#{clone_url}'. Please check if the repo exists and if it is private/internal please add a PAT with -t option."
          end
          puts "succeeded."
          dir = Pathname.new(dir_name).join(".git")

          puts "Pushing to local"
          # set visibility private and change later to actual value
          repo = restore_repo(location_premade_git: return_path(pathname: dir),
                              owner_name: @source_repo_metadata["owner"]["login"],
                              repo_name: @source_repo_metadata["name"],
                              is_public: false,
                              import_users: options[:import_users])

          puts "Update repo metadata"
          # set selected repo metadata (currently only visibility)
          set_repo_metadata(repo, options)
        end

        # calling GitHub.com API to get repo metadata
        def retrieve_source_repo_metadata(nwo)
          # call api.github.com
          uri = URI("#{REPO_API_BASE_URL}#{nwo}")
          request = Net::HTTP::Get.new(uri)
          # pat authentication
          request.basic_auth "", @github_token
          # set unique user agent to be able to get some telemetry on usage
          request["User-Agent"] = USER_AGENT_STRING
          response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http|
            http.request(request)
          }

          case response
          when Net::HTTPSuccess then
            repo_metadata = JSON.parse(response.body)
          when Net::HTTPNotFound then
            raise Runner::RunnerError, "Could not find or don't have access to repo '#{nwo}'. Please check if the repo exists and if it is private/internal please add a PAT with -t option."
          else
            raise Runner::RunnerError, "Error while contacting api.github.com: #{response.code} #{response.message}"
          end
        end

        # sets repo metadata according to source repo for selected attributes
        def set_repo_metadata(repo, options)
          if options[:overwrite_visibility].nil?
            # set visibility according to repo metadata
            if options[:skip_business] && @source_repo_metadata["visibility"] == "internal"
              puts "Visibility of source repo is 'internal' but 'skip_business' option is set to 'true'. Setting repo visibility to private."
            else
              repo.set_permission(@source_repo_metadata["visibility"])
            end
          else
            if options[:overwrite_visibility] == "internal" && @source_repo_metadata["owner"]["type"] == "User"
              puts "Source repo is user owned and can't be set to visibility 'internal'. Keeping source visibility '#{@source_repo_metadata["visibility"]}'"
              # keep original visibility in case user owned repo and overwrite_visibility is set to 'internal'
              repo.set_permission(@source_repo_metadata["visibility"])
            else
              # overwrite the visibility
              repo.set_permission(options[:overwrite_visibility])
            end
          end

          if options[:template]
            repo.update!(template: true)
          end
        end

        # returns the GITHUB_TOKEN either from ENV variable or by command line option
        def get_github_token(options)
          options[:token] || ENV["SEED_REPO_PULL_TOKEN"]
        end

        # validates options/input parameters
        def validate_options(options)
          if options[:nwo].split("/").length != 2
            raise Runner::RunnerError, "Invalid repo name. Please provide a valid repo name in the nwo format 'owner/repo'"
          end

          if !options[:overwrite_visibility].nil?
            unless %w(public private internal).include?(options[:overwrite_visibility])
              raise Runner::RunnerError, "Invalid overwrite_visibility. Please provide a valid visibility value 'public', 'private' or 'internal'"
            end
          end
        end

      end
    end
  end
end
