# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class UserLists < Seeds::Runner
      def self.help
        <<~EOF
        Seed user lists for local development
        EOF
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        new.run(options)
      end

      def run(options)
        create_users
        create_languages
        create_user_lists
      end

      private

      def create_users
        puts "Creating users to own some lists and repositories"
        monalisa
        user_lister_user
        forker
      end

      def create_languages
        ruby
        javascript
        php
      end

      def languages
        @languages ||= [ruby, javascript, php]
      end

      def create_user_lists
        puts "Creating some user lists"
        [monalisa, user_lister_user].each do |user|
          create_user_lists_for(user)
        end
      end

      def create_user_lists_for(user)
        create_fave_five_list_for(user)
        create_loved_projects_list_for(user)
        create_stars_list_for(user) # Add this list last, so it has all stars in it

        # Do this after adding all stars, so the star count is up-to-date:
        update_user_profile_metadata(user)
      end

      def create_fave_five_list_for(user)
        user_list = create_user_list("My fave :five:", user: user,
          description: "The absolute best five repos I've seen.")
        add_public_source_repos_to_list(user_list, user: user, target_count: 5)
        star_list_items(user_list, user: user)
        add_language_to_list_repos(user_list)
      end

      def create_loved_projects_list_for(user)
        user_list = create_user_list("#{user}'s loved projects", user: user)
        add_public_source_repos_to_list(user_list, user: user, target_count: 3)
        add_private_source_repo_to_list(user_list, user: user)
        add_public_forked_repo_to_list(user_list)
        star_list_items(user_list, user: user)
        add_language_to_list_repos(user_list)
      end

      def create_stars_list_for(user)
        user_list = create_user_list("⭐️ All my stars", user: user,
          description: "if i've starred it, it's here :boom:")

        starred_repo_ids = user.stars.reload.repositories.pluck(:starrable_id)
        repo_ids_in_list = user_list.items.pluck(:repository_id)
        repo_ids_to_add = starred_repo_ids - repo_ids_in_list

        if repo_ids_to_add.any?
          repo_nwos_by_id = Repository.where(id: repo_ids_to_add).map { |repo| [repo.id, repo.nwo] }.to_h

          repo_ids_to_add.each do |repo_id|
            name_with_owner = repo_nwos_by_id[repo_id]
            puts "- Adding repo #{name_with_owner} to '#{user_list.name}'"
            FactoryBot.create(:user_list_item, user_list: user_list, repository_id: repo_id)
          end
        end
      end

      def monalisa
        @monalisa ||= Seeds::Objects::User.monalisa
      end

      def ruby
        return @ruby if @ruby
        @ruby = LanguageName.find_by(name: "Ruby")
        unless @ruby
          puts "Creating Ruby language"
          @ruby = FactoryBot.create(:ruby_language_name)
        end
        @ruby
      end

      def javascript
        return @javascript if @javascript
        @javascript = LanguageName.find_by(name: "JavaScript")
        unless @javascript
          puts "Creating JavaScript language"
          @javascript = FactoryBot.create(:javascript_language_name)
        end
        @javascript
      end

      def php
        return @php if @php
        @php = LanguageName.find_by(name: "PHP")
        unless @php
          puts "Creating PHP language"
          @php = FactoryBot.create(:php_language_name)
        end
        @php
      end

      def user_lister_user
        return @user_lister_user if @user_lister_user
        login = "user-lister"
        @user_lister_user = User.find_by(login: login)
        unless @user_lister_user
          puts "- Creating #{login}..."
          @user_lister_user = FactoryBot.create(:user, login: login)
        end
        @user_lister_user
      end

      def create_user_list(name, user:, description: nil)
        slug = UserList.slug_for_name(name)
        user_list = UserList.find_by(slug: slug, user: user)

        unless user_list
          puts "- Creating user list '#{name}' for #{user}"
          user_list = FactoryBot.create(:user_list, name: name, user: user, description: description)
        end

        unless user_list.name == name
          puts "- Renaming #{user}'s list: '#{user_list.name}' => '#{name}'"
          user_list.update!(name: name)
        end

        unless user_list.description == description
          puts "- Updating '#{name}' user list's description"
          user_list.update!(description: description)
        end

        user_list
      end

      def add_public_source_repos_to_list(user_list, user:, target_count:)
        user_list_repos = user_list.items.reload.includes(:repository).map(&:repository).compact
        public_source_repo_count = user_list_repos.count { |repo| repo.public? && repo.parent_id.nil? }
        return if public_source_repo_count == target_count

        total_to_create = target_count - public_source_repo_count
        return if total_to_create <= 0

        puts "- Adding #{total_to_create} #{"repository".pluralize(total_to_create)} to '#{user_list.name}'"
        total_to_create.times do |i|
          repo_owner_login = "popularMaintainer#{i}"
          repo_name = "neato-repo-#{i}"
          repo = Seeds::Objects::Repository.create_with_nwo(
            nwo: "#{repo_owner_login}/#{repo_name}",
            setup_master: false,
            is_public: true,
          )
          FactoryBot.create(:user_list_item, user_list: user_list, repository: repo)
        end
      end

      def add_language_to_list_repos(user_list)
        valid_language_ids = languages.map(&:id)
        user_list_repos = user_list.repositories.reload
        repos_without_language = user_list_repos.where.not(primary_language_name_id: valid_language_ids)
          .or(user_list_repos.where(primary_language_name_id: nil))
        repos_without_language.each do |repo|
          add_language_to_repo(repo)
        end
      end

      def add_language_to_repo(repo)
        language = languages.sample
        unless repo.primary_language_name_id == language.id
          puts "Setting primary language of #{repo.nwo} to #{language.name}"
          repo.update_primary_language!(language)
        end
      end

      def add_public_forked_repo_to_list(user_list)
        user_list_repos = user_list.items.reload.includes(repository: :parent).map(&:repository).compact
        any_public_forked_repo = user_list_repos.any? { |repo| repo.public? && repo.parent.present? }
        return if any_public_forked_repo

        puts "- Adding fork #{public_forked_repo.nwo} to '#{user_list.name}'"
        FactoryBot.create(:user_list_item, user_list: user_list, repository: public_forked_repo)
      end

      def add_private_source_repo_to_list(user_list, user:)
        user_list_repos = user_list.items.reload.includes(:repository).map(&:repository).compact
        any_private_source_repo = user_list_repos.any? { |repo| repo.private? && repo.parent_id.nil? }
        return if any_private_source_repo

        unless private_repo.readable_by?(user)
          puts "- Adding #{user} as a member of #{private_repo.nwo}"
          private_repo.add_member(user)
        end

        puts "- Adding private repository #{private_repo.nwo} to '#{user_list.name}'"
        FactoryBot.create(:user_list_item, user_list: user_list, repository: private_repo)
      end

      def star_list_items(user_list, user:)
        user_list.items.reload.includes(:repository).each do |item|
          repo = item.repository
          unless repo.starred_by?(user)
            puts "- Starring #{repo.nwo} as #{user}"
            FactoryBot.create(:star, user: user, starrable: repo)
          end
        end
      end

      def private_repo
        @private_repo ||= Seeds::Objects::Repository.create_with_nwo(
          nwo: "popularMaintainer0/neato-private-repo",
          setup_master: false,
          is_public: false,
        )
      end

      def public_forkable_repo
        @public_forkable_repo ||= Seeds::Objects::Repository.restore_premade_repo(
          location_premade_git: "test/fixtures/git/examples/forkable.git",
          owner_name: "popularMaintainer0",
          repo_name: "CopyMePls",
          is_public: true,
        )
      end

      def public_forked_repo
        return @public_forked_repo if @public_forked_repo
        forked_repo, reason = public_forkable_repo.fork(forker: forker)
        unless forked_repo
          raise Objects::CreateFailed, "Could not fork #{public_forkable_repo.nwo} as #{forker}: #{reason}"
        end
        @public_forked_repo = forked_repo
      end

      def forker
        return @forker if @forker
        login = "the-fork-maker"
        @forker = Seeds::Objects::User.create(login: login, email: "#{login}@example.com")
      end

      def update_user_profile_metadata(user)
        user_metadata = user.reload_user_metadata

        stars_count = public_star_count_for(user)
        stars_public_and_private_count = public_and_private_star_count_for(user)
        repository_count = public_repo_count_for(user)
        repository_public_and_private_count = public_and_private_repo_count_for(user)

        unless user_metadata
          puts "Creating user metadata record for #{user}"
          user_metadata = FactoryBot.create(:user_metadata, user: user, stars_count: stars_count,
            stars_public_and_private_count: stars_public_and_private_count, repository_count: repository_count,
            repository_public_and_private_count: repository_public_and_private_count)
        end

        metadata_updates = {}
        metadata_updates[:stars_count] = stars_count unless user_metadata.stars_count == stars_count
        unless user_metadata.stars_public_and_private_count == stars_public_and_private_count
          metadata_updates[:stars_public_and_private_count] = stars_public_and_private_count
        end
        unless user_metadata.repository_count == repository_count
          metadata_updates[:repository_count] = repository_count
        end
        unless user_metadata.repository_public_and_private_count == repository_public_and_private_count
          metadata_updates[:repository_public_and_private_count] = repository_public_and_private_count
        end

        if metadata_updates.any?
          puts "Updating user metadata record for #{user}"
          pp metadata_updates
          user_metadata.update!(metadata_updates)
        end
      end

      def public_star_count_for(user)
        repository_stars_ids = user.stars.repositories.pluck(:starrable_id)
        public_repository_stars_count = ::Repository.where(id: repository_stars_ids).public_scope
          .filter_spam_and_disabled_for(nil).size
        user.stars.topics.size + public_repository_stars_count
      end

      def public_and_private_star_count_for(user)
        user.stars.filter_spam_for(nil).size
      end

      def public_repo_count_for(user)
        user.public_repositories.count
      end

      def public_and_private_repo_count_for(user)
        user.repositories.count
      end
    end
  end
end
