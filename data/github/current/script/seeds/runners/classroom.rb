# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Classroom < Seeds::Runner
      def self.help
        <<~HELP
        Seeds classroom scenarios for local development. Generates:
        - Org for classroom generation
        - Repo to use as a starter code
        - Repo for Git & GitHub Fundamentals starter course
        - Users as students
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      def self.create_user(login:, email: nil, **opts)
        if user = ::User.find_by(login: login)
          puts "FOUND USER: #{user.login}"
          return user
        end

        email = email || Faker::Internet.unique.email
        user = Seeds::Objects::User.create(**T.unsafe({ login: login, email: email, **opts }))
        puts "CREATED USER: #{user.login}"
        user
      end

      def self.create_repo(owner:, name:, public: true, template: true, location_premade_git: nil)
        if repo = ::Repository.find_by(name: name)
          puts "FOUND REPO: #{repo.nwo}"
          return repo
        end

        if location_premade_git
          repo = Seeds::Objects::Repository.restore_premade_repo(
            owner_name: owner,
            repo_name: name,
            location_premade_git: location_premade_git,
            is_public: public,
            template: template,
          )
        else
          repo = Seeds::Objects::Repository.create(
            owner_name: owner,
            repo_name: name,
            is_public: public,
            template: template,
            setup_master: true,
          )
        end
        puts "CREATED REPO: #{repo.nwo}"
        repo
      end

      def self.create_org(login:, admin:)
        if org = ::Organization.find_by(login: login)
          puts "FOUND ORG: #{org.login}"
          return org
        end

        org = Seeds::Objects::Organization.create(login: "classroom-dev-org", admin: mona)
        puts "CREATED ORG: #{org.login}"
        org
      end

      def self.run(options = {})
        org = create_org(login: "classroom-dev-org", admin: mona)

        create_repo(owner: org.login, name: "template-repo")

        create_repo(owner: org.login, name: "github-starter-course", location_premade_git: "https://github.com/education/github-starter-course.git")

        create_repo(owner: org.login, name: "autograding-example-node", location_premade_git: "https://github.com/education/autograding-example-node.git")

        create_user(login: "student1")

        create_user(login: "student2")

        puts "Seeding data complete 🌱"
      end
    end
  end
end
