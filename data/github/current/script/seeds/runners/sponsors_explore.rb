# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SponsorsExplore < Seeds::Runner
      extend T::Sig

      TOTAL_REPOS_TO_GET_FUNDING_YMLS = 5
      FUNDING_YML_SPONSORABLES_PER_REPO = 3

      sig { returns String }
      def self.help
        <<~HELP
        Create some users and organizations with GitHub Sponsors profiles and public repositories, to populate
        the Sponsors Explore page with sponsorable dependencies.
        HELP
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"
        require "timecop"
        new.run(options)
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def run(options)
        sponsorable_user_count = options.fetch(:user_count, 20)
        sponsorable_org_count = options.fetch(:org_count, 5)
        repo_count_per_sponsorable = options.fetch(:repo_count, 3)
        total_sponsorables_to_feature = 5
        sponsorables = []
        monalisa = Seeds::Objects::User.monalisa
        user_sponsorable = T.let(nil, T.nilable(GitHubSponsors::Types::Sponsorable))

        sponsorable_user_count.times do
          login = Seeds::DataHelper.random_username
          sponsorables << Timecop.freeze(random_time) do
            user_sponsorable = Seeds::Objects::User.create(login: login, email: Seeds::DataHelper.random_email)
          end
        end
        total_orgs_to_admin = (sponsorable_org_count.to_f / 2).floor
        total_orgs_to_belong_to = sponsorable_org_count - total_orgs_to_admin
        total_orgs_to_admin.times do
          sponsorables << Timecop.freeze(random_time) do
            Seeds::Objects::Organization.create(login: random_login, admin: monalisa)
          end
        end

        total_orgs_to_belong_to.times do
          sponsorables << Timecop.freeze(random_time) do
            org = Seeds::Objects::Organization.create(login: random_login, admin: user_sponsorable)
            org.add_member(monalisa)
            org
          end
        end

        existing_listing_sponsorable_logins = SponsorsListing.where(sponsorable_id: sponsorables)
          .select(:slug, :sponsorable_id).map(&:sponsorable_login).to_set
        sponsorables_missing_listings = sponsorables.reject do |sponsorable|
          existing_listing_sponsorable_logins.include?(sponsorable.login)
        end

        if existing_listing_sponsorable_logins.any?
          puts "Skipping Sponsors listing creation for: #{existing_listing_sponsorable_logins.to_a.to_sentence}"
        end

        sponsorables_missing_listings.each do |sponsorable|
          puts "Creating Sponsors listing for #{sponsorable}"
          creation_time = [sponsorable.created_at + 10.minutes, Time.now].min
          Timecop.freeze(creation_time) do
            FactoryBot.create(:sponsors_listing, :approved_with_only_custom_amounts, sponsorable: sponsorable)
          end
        end

        if SponsorsListing.featured.count < total_sponsorables_to_feature
          sponsorables_to_feature = sponsorables.sample(total_sponsorables_to_feature)
          GitHub::PrefillAssociations.prefill_associations(sponsorables_to_feature,
            { sponsors_listing: :stafftools_metadata })
          sponsorables_to_feature.each do |sponsorable|
            listing = sponsorable.sponsors_listing
            puts "Featuring #{sponsorable}'s Sponsors profile"
            if listing.featured_allowed?
              listing.update!(featured_state: :active)
            else
              listing.update!(featured_state: :allowed)
              listing.stafftools_metadata.update!(ignored_at: nil) if listing.ignored?
            end
          end
        end

        names_with_owners = Set.new
        sponsorables.each do |sponsorable|
          repo_count_per_sponsorable.times do
            names_with_owners.add("#{sponsorable}/#{random_repo_name}")
          end
        end

        existing_repos = Repository.with_names_with_owners(names_with_owners).public_scope
        existing_repo_nwos = existing_repos.map(&:name_with_owner).to_set
        nwos_to_create = names_with_owners - existing_repo_nwos
        new_repos = nwos_to_create.map do |nwo|
          puts "Creating public repo #{nwo}"
          Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: false, is_public: true)
        end

        all_sponsorable_repos = existing_repos + new_repos
        funding_sponsorable_ids_by_repo_id = funding_sponsorable_ids_by_repo_id_for(all_sponsorable_repos)
        repos_to_get_funding_ymls = repos_to_create_funding_ymls_for(funding_sponsorable_ids_by_repo_id,
          all_sponsorable_repos)
        repo_ids_with_funding_yml = RepositoryPreferredFile.funding.distinct
          .where(repository_id: repos_to_get_funding_ymls)
          .pluck(:repository_id)
          .to_set

        repos_to_get_funding_ymls.each do |repo|
          unless repo_ids_with_funding_yml.include?(repo.id)
            puts "Creating a funding.yml for #{repo.nwo}"
            FactoryBot.create(:repository_preferred_file, :funding, repository: repo)
          end

          create_repository_sponsorables(repo, funding_sponsorable_ids_by_repo_id[T.must(repo.id)] || Set.new)
        end
      end

      private

      sig { params(repo: Repository, existing_funding_yml_sponsorable_ids: T::Set[Integer]).void }
      def create_repository_sponsorables(repo, existing_funding_yml_sponsorable_ids)
        eligible_sponsorables = all_sponsorables.reject do |sponsorable|
          sponsorable_id = T.must(sponsorable.id)
          owned_repo_count = repo_counts_owned_by_sponsorable_id[sponsorable_id] || 0
          existing_funding_yml_sponsorable_ids.include?(sponsorable_id) || sponsorable_id == repo.owner_id ||
            owned_repo_count < 1
        end
        sponsorables_for_funding_yml = Array(eligible_sponsorables.sample(FUNDING_YML_SPONSORABLES_PER_REPO))
        sponsorables_for_funding_yml.each do |sponsorable|
          puts "Adding #{sponsorable} to #{repo.nwo}'s funding.yml"
          FactoryBot.create(:repository_sponsorable, :funding_file, repository: repo, sponsorable: sponsorable)
        end
      end

      sig { returns T::Array[GitHubSponsors::Types::Sponsorable] }
      def all_sponsorables
        return @all_sponsorables if @all_sponsorables
        list = SponsorsListing.with_approved_state.includes(:sponsorable).map(&:sponsorable).compact
        @all_sponsorables = T.let(list, T.nilable(T::Array[GitHubSponsors::Types::Sponsorable]))
        @all_sponsorables || []
      end

      sig { returns T::Hash[Integer, Integer] }
      def repo_counts_owned_by_sponsorable_id
        return @repo_counts_owned_by_sponsorable_id if @repo_counts_owned_by_sponsorable_id
        result = Repository.owned_by(all_sponsorables).group(:owner_id).count
        @repo_counts_owned_by_sponsorable_id = T.let(result, T.nilable(T::Hash[Integer, Integer]))
        @repo_counts_owned_by_sponsorable_id || {}
      end

      sig do
        params(
          funding_sponsorable_ids_by_repo_id: T::Hash[Integer, T::Set[Integer]],
          repos: T::Array[Repository],
        ).returns(T::Array[Repository])
      end
      def repos_to_create_funding_ymls_for(funding_sponsorable_ids_by_repo_id, repos)
        repos_eligible_to_get_funding_ymls = repos.select do |repo|
          repo_id = repo.id
          next false unless repo_id
          !funding_sponsorable_ids_by_repo_id.key?(repo_id) ||
            T.must(funding_sponsorable_ids_by_repo_id[repo_id]).size < FUNDING_YML_SPONSORABLES_PER_REPO
        end
        Array(repos_eligible_to_get_funding_ymls.sample(TOTAL_REPOS_TO_GET_FUNDING_YMLS)).compact
      end

      sig { params(repos: T::Array[T.any(Integer, Repository)]).returns(T::Hash[Integer, T::Set[Integer]]) }
      def funding_sponsorable_ids_by_repo_id_for(repos)
        existing_repo_sponsorables = RepositorySponsorable.for_repository(repos).repo_funding_file
          .select(:repository_id, :sponsorable_id)
        existing_repo_sponsorables.each_with_object({}) do |repo_sponsorable, hash|
          hash[repo_sponsorable.repository_id] ||= Set.new
          hash[repo_sponsorable.repository_id].add(repo_sponsorable.sponsorable_id)
        end
      end

      sig { returns Time }
      def random_time
        Time.now - rand(1..365).days
      end

      sig { returns String }
      def random_hex
        T.must(SecureRandom.hex[0..7])
      end

      sig { returns String }
      def random_repo_name
        name = "#{Faker::NatoPhoneticAlphabet.code_word}-#{Faker::Space.star_cluster}"
        "#{name}-#{random_hex}".gsub(/\s+/, "")
      end

      sig { returns String }
      def random_login
        prefix = Faker::Internet.domain_word
        suffix = Faker::Company.suffix.titleize.gsub(/\s+/, "")
        name = "#{prefix}-#{random_hex}-#{suffix}"
        T.must(name[0...User::LOGIN_MAX_LENGTH])
      end
    end
  end
end
