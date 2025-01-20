# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class RepoAdvisory < Seeds::Runner
      DEFAULT_ORG_NAME = "github"
      DEFAULT_USER_NAME = "monalisa"
      DEFAULT_REPO_NAME = "smile"
      DEFAULT_ORG_NWO = "#{DEFAULT_ORG_NAME}/#{DEFAULT_REPO_NAME}"
      DEFAULT_USER_NWO = "#{DEFAULT_USER_NAME}/#{DEFAULT_REPO_NAME}"
      COLLABORATOR_USER_NAME = "collaborator"

      DEFAULT_PACKAGE_NAME = "my-example-package.rb"
      DEFAULT_ECOSYSTEM_NAME = "RubyGems"
      DEFAULT_AFFECTED_VERSIONS = "<1.1.0"

      def self.help
        <<~HELP
        Creates an unpublished repo advisory, with options to specify the repo, author, and
        affected product details.

        - Ensures given test user exists (defaults to "#{DEFAULT_USER_NAME}")
        - Ensures given repo exists (defaults to "#{DEFAULT_USER_NWO}")

        Options:
          --author, -u
           String name of the pull request author. Defaults to "#{DEFAULT_USER_NAME}".

          --nwo, -r
           String "name with owner" of the pull request base repository. Defaults to "#{DEFAULT_USER_NWO}".

          --package, -p
           String name of affected package. Defaults to "#{DEFAULT_PACKAGE_NAME}".

          --ecosystem, -e
           String name of affected ecosystem. Defaults to "#{DEFAULT_ECOSYSTEM_NAME}".

          --versions, -v
           String name of affected versions. Defaults to "#{DEFAULT_AFFECTED_VERSIONS}".

          --published
           Create a published advisory instead of an unpublished one.

          --innersource
            Creates a new private security advisory. Toggles innersource flag and enables GHAS on repo.
            If repo NWO given it must belong to an org. By default, the repo will belong to the "github" org.
            The organization will belong to the default "github" business.
        HELP
      end

      def self.run(options = {})
        user_login = options[:user] || DEFAULT_USER_NAME
        puts "Finding or creating user #{user_login}..."
        user = Seeds::Objects::User.create(login: user_login)

        collaborator_login = COLLABORATOR_USER_NAME
        puts "Finding or creating collaborator #{collaborator_login}..."
        collaborator = Seeds::Objects::User.create(login: collaborator_login)

        if options[:innersource]
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "innersource_advisories")
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "private_advisories_disabled")
          admin = Objects::User.monalisa
          business = Seeds::Objects::Business.github

          org_name = options[:nwo] ? options[:nwo].split("/").first : DEFAULT_ORG_NAME
          puts "Finding or creating organization #{org_name}..."
          org = Seeds::Objects::Organization.create(login: org_name, admin: admin)
          business.add_organization(org, actor: admin)
          Seeds::Objects::SecurityConfiguration.custom_configuration(
            org:,
            options: { default_for_new_public_repos: true, default_for_new_private_repos: true }
          )

          unless org.members.include?(user)
            puts "Adding #{user} to organization..."
            org.add_member(user)
          end

          unless org.members.include?(collaborator)
            puts "Adding collaborator to organization..."
            org.add_member(collaborator)
          end

          puts "Enabling advanced security on #{org}..."
          business.mark_advanced_security_as_purchased_for_entity(actor: admin)
        end

        no_nwo_owner = options[:innersource] ? DEFAULT_ORG_NAME : user_login
        nwo = options[:nwo] || "#{no_nwo_owner}/#{DEFAULT_REPO_NAME}"
        is_public = options[:innersource] ? false : true

        puts "Finding or creating repo #{nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: nwo, is_public: is_public, setup_master: true)

        # By default, repos created in the test environment don't have representation on disk.
        # This causes a call to `empty?` on a repo to return `true`. Since repository advisories
        # cannot be published if they are empty, we need to reload our test repo so that `.empty?`
        # will return `true`.
        repo.reload

        if options[:innersource]
          #TODO - change when org config is in/there is org dependency method
          puts "Enabling innersource advisories on #{nwo}..."
          SecurityProduct::InnersourceAdvisories.new(repo).enable(actor: admin)
        end

        unless repo.members.include?(user)
          puts "Adding #{user} to repo as member with write permissions..."
          repo.add_member(user)
        end

        unless repo.members.include?(collaborator)
          puts "Adding collaborator to repo as member with write permissions..."
          repo.add_member(collaborator)
        end

        puts "Creating unpublished repo advisory..."
        repo_advisory = repo.repository_advisories.create!(
          author: user,
          body: Faker::Lorem.paragraphs(number: 1 + rand(2)).join("\n\n"),
          description: Faker::Lorem.paragraphs(number: 1 + rand(2)).join("\n\n"),
          severity: RepositoryAdvisory.severities.keys.sample,
          title: Faker::Lorem.sentence
        )

        package_name = options[:package] || DEFAULT_PACKAGE_NAME
        ecosystem_name = options[:ecosystem] || DEFAULT_ECOSYSTEM_NAME
        affected_versions = options[:versions] || DEFAULT_AFFECTED_VERSIONS

        repo_advisory.affected_products.create!(
          package: package_name,
          ecosystem: ecosystem_name,
          affected_versions: affected_versions
        )

        puts "Adding collaborator to repo advisory..."
        repo_advisory.add_collaborator(collaborator)

        puts "Commenting on repo advisory..."
        repo_advisory.comments.create!(body: Faker::Lorem.sentence, user: collaborator)

        publish = options[:published]
        if publish
          puts "Publishing repo advisory..."
          repo_advisory.set_published(actor: user)
        end

        puts "Done! Created #{repo_advisory.ghsa_id}"
      end
    end
  end
end
