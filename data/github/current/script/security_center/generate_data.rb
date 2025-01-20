#!/usr/bin/env safe-ruby
# typed: strict
# frozen_string_literal: true

puts "Loading the Rails environment…"
require_relative "../../config/environment"
abort "This can only be run in development" unless Rails.env.development?

require "optparse"
require "#{Rails.root}/script/seeds/objects/business"
require "#{Rails.root}/script/seeds/objects/organization"
require "#{Rails.root}/script/seeds/objects/repository"
require "#{Rails.root}/script/seeds/objects/user"
require "#{Rails.root}/script/seeds/runners/advanced_security"
require "#{Rails.root}/script/seeds/runners/code_scanning"
require "#{Rails.root}/script/seeds/runners/security_center_secret_scanning"
require "#{Rails.root}/script/seeds/runners/security_manager"

require "#{Rails.root}/script/create_dependabot_example_vulnerable_repo"
require "#{Rails.root}/packages/security_products/app/models/security_center/security_features"

DEFAULT_MAX_RETRIES = 3
DEFAULT_MODIFY_GITHUB_BUSINESS = false
DEFAULT_NUMBER_OF_BUSINESSES = 0
DEFAULT_NUMBER_OF_ORGS_PER_BUSINESS = 0
DEFAULT_VERBOSE = false

CODE_SCANNING_REPO_GIT_PATH = "script/seeds/data/code_scanning/default.git"
SECRET_SCANNING_REPO_GIT_PATH = "script/seeds/data/secret_scanning/default.git"

class SecurityCenterGenerateData
  extend T::Sig

  sig { returns(T::Boolean) }; attr_reader :modify_github_business
  sig { returns(Integer) }; attr_reader :num_of_businesses
  sig { returns(Integer) }; attr_reader :num_of_orgs_per_business
  sig { returns(Integer) }; attr_reader :max_retries
  sig { returns(T::Boolean) }; attr_reader :verbose

  sig { returns(CreateExampleVulnerableRepository) }; attr_reader :dependabot_alerts_creator
  sig { returns(::User) }; attr_reader :user

  sig { params(options: T::Hash[Symbol, T.untyped]).void }
  def initialize(options = {})
    puts "ℹ️ Dotcom, Token Scanning Service, and Turboscan must be running for these seeds to run.\n\n"

    @modify_github_business = T.let(options.fetch(:modify_github_business, DEFAULT_MODIFY_GITHUB_BUSINESS).present?, T::Boolean)
    @num_of_businesses = T.let(Integer(options.fetch(:num_of_businesses, DEFAULT_NUMBER_OF_BUSINESSES)), Integer)
    @num_of_orgs_per_business = T.let(Integer(options.fetch(:num_of_orgs_per_business, DEFAULT_NUMBER_OF_ORGS_PER_BUSINESS)), Integer)
    @max_retries = T.let(Integer(options.fetch(:max_retries, DEFAULT_MAX_RETRIES)), Integer)
    @verbose = T.let(options.fetch(:verbose, DEFAULT_VERBOSE).present?, T::Boolean)

    @dependabot_alerts_creator = T.let(CreateExampleVulnerableRepository.new, CreateExampleVulnerableRepository)
    @user = T.let(Seeds::Objects::User.monalisa, ::User)

    puts "Creating a Dependabot app and installing triggers…"
    silenced { CreateIntegrationTrigger.new.call }

    puts "Creating dependency vulnerabilities…"
    silenced { CreateExampleVulnerabilities.new.call }
  end

  sig { returns(T::Array[::Business]) }
  def call
    if modify_github_business
      puts "Enabling GHAS for the \"#{Seeds::Objects::Business.github.name}\" organization…"
      silenced { Seeds::Runner::AdvancedSecurity.execute }
      puts "✅ Enabled GHAS for the \"#{Seeds::Objects::Business.github.name}\" organization…\n\n"

      puts "Creating a security manager team for the \"#{Seeds::Objects::Business.github.name}\" organization…"
      silenced { Seeds::Runner::SecurityManager.execute }
      puts "✅ Created a security manager teamfor the \"#{Seeds::Objects::Business.github.name}\" organization…\n\n"

      create_organizations(business: Seeds::Objects::Business.github)
    end

    businesses = T.let([], T::Array[Business])
    time = Benchmark.measure do
      businesses = create_businesses
    end
    puts "Benchmark time: #{time.real * 1000} ms\n\n"
    businesses
  end

  private

  sig { returns(::Business) }
  def create_business
    business = Seeds::Objects::Business.create(name: "#{Faker::Company.name} #{SecureRandom.random_number(1000)}, Inc")
    business.customer = Seeds::Objects::Business.github.customer
    business.save!
    business.mark_advanced_security_as_purchased_for_entity(actor: user)
    puts "✅ Created business #{business.slug}!\n\n"

    create_organizations(business: business)

    ::SecurityOverviewAnalytics::Initialization.for(business).enqueue
    ::SecurityOverviewAnalytics::FanoutScheduler.initialize_for(business)

    business
  end

  sig { returns(T::Array[::Business]) }
  def create_businesses
    businesses = []

    num_of_businesses.times do |idx_biz|
      puts "Creating business #{idx_biz + 1} of #{num_of_businesses}…"
      business = create_business
      businesses << business
    end

    businesses
  end

  sig { params(repository: ::Repository).void }
  def create_code_scanning_alerts(repository:)
    description = "Creating #{SecurityCenter::SecurityFeatures::CODE_SCANNING.humanize.titleize} alerts for repository \"#{repository.name_with_display_owner}\""
    puts description

    with_retry(block_description: description) do
      silenced do
        Seeds::Runner::CodeScanning.execute({
          is_public: repository.visibility == ::Repository::PUBLIC_VISIBILITY,
          name: repository.name,
          organization_name: repository.organization.try(:login),
          repo_path: CODE_SCANNING_REPO_GIT_PATH,
        })
      end
    end

    puts "✅ Created #{SecurityCenter::SecurityFeatures::CODE_SCANNING.humanize.titleize} alerts for repository \"#{repository.name_with_display_owner}\"!\n\n"
  end

  sig { params(repository: ::Repository).void }
  def create_dependabot_alerts(repository:)
    description = "Creating #{SecurityCenter::SecurityFeatures::DEPENDABOT_ALERTS.humanize.titleize} for repository \"#{repository.name_with_display_owner}\""
    puts description

    with_retry(block_description: description) do
      dependabot_alerts_creator.create_repository(owner: repository.organization, repository: repository)
    end

    puts "✅ Created #{SecurityCenter::SecurityFeatures::DEPENDABOT_ALERTS.humanize.titleize} for repository \"#{repository.name_with_display_owner}\"!\n\n"
  end

  sig { params(business: ::Business).returns(::Organization) }
  def create_organization(business:)
    organization = T.let(
      Seeds::Objects::Organization.create(
        admin: user,
        login: "#{Faker::Movies::StarWars.planet}-#{SecureRandom.random_number(1000)}".parameterize
      ),
      Organization
    )
    organization.business = business
    organization.save!
    puts "✅ Created organization \"#{organization.display_login}\" in business \"#{business.slug}\"!\n\n"

    puts "Enabling GHAS for new repos in the \"#{organization.display_login}\" organization…"
    silenced do
      Seeds::Runner::AdvancedSecurity.execute({
        business_slug: business.slug,
        create_repo: false,
        organization_name: organization.login
      })
    end
    puts "✅ Enabled GHAS for new repos in the \"#{organization.display_login}\" organization!\n\n"

    puts "Creating a security manager team for the \"#{organization.display_login}\" organization…"
    silenced { Seeds::Runner::SecurityManager.execute({ organization_name: organization.login }) }
    puts "✅ Created a security manager team in the \"#{organization.display_login}\" organization!\n\n"

    organization
  end

  sig { params(business: ::Business).returns(T::Array[::Organization]) }
  def create_organizations(business:)
    organizations = []
    repository_promises = T.let([], T::Array[T.untyped])

    num_of_orgs_per_business.times do |idx_org|
      puts "Creating organization #{idx_org + 1} of #{num_of_orgs_per_business} for business \"#{business.slug}\"…"
      organization = create_organization(business: business)
      organizations << organization

      repository_promises = repository_promises + async_create_repositories(organization: organization)
      repository_promises = repository_promises + async_create_repositories(organization: organization, archived: true)
    end

    Promise.all(repository_promises).sync

    organizations
  end

  sig { params(organization: ::Organization, archived: T::Boolean).returns(T::Array[T.untyped]) }
  def async_create_repositories(organization:, archived: false)
    repository_promises = []

    # Create repos for every combination of security features and visibility.
    [::Repository::PUBLIC_VISIBILITY, ::Repository::PRIVATE_VISIBILITY, ::Repository::INTERNAL_VISIBILITY].each do |visibility|
      feature_types = RepositorySecurityCenterStatus.primary_feature_types
      (0..feature_types.size).each do |k|
        feature_types.combination(k).each do |security_features|
          repository_promises << Promise.resolve(
            create_repository(
              archived: archived,
              organization: organization,
              security_features: security_features,
              visibility: visibility
            )
          )
        end
      end
    end

    repository_promises
  end

  sig { params(organization: ::Organization, visibility: String, archived: T::Boolean, security_features: T::Array[Symbol]).returns(T.nilable(::Repository)) }
  def create_repository(organization:, visibility:, archived: false, security_features: [])
    repository_name = ([visibility, Faker::Games::Pokemon.name] + security_features).join(" ").parameterize
    should_create_code_scanning_alerts = security_features.include?(:code_scanning)
    should_create_dependabot_alerts = security_features.include?(:dependabot_alerts)
    should_create_secret_scanning_alerts = security_features.include?(:secret_scanning)

    if security_features.blank?
      puts "Creating #{archived ? "archived" : ""} \"#{visibility}\" repository with no security features for organization \"#{organization.display_login}\"…"
    else
      puts "Creating #{archived ? "archived" : ""} \"#{visibility}\" repository with security features #{security_features.to_sentence.humanize.downcase} for organization \"#{organization.display_login}\"…"
    end

    repository = T.let(nil, T.untyped)
    with_retry(block_description: "Create \"#{visibility}\" repository for organization \"#{organization.display_login}\"", raise_on_retry_exhaustion: true) do
      repository = Seeds::Objects::Repository.create(
        is_public: visibility == ::Repository::PUBLIC_VISIBILITY,
        owner_name: organization.login,
        repo_name: repository_name,
        setup_master: true
      )
    end
    repository = T.cast(repository, Repository) # rubocop:todo GitHub/AvoidCast

    repository.toggle_visibility(actor: user, visibility: visibility)
    puts "✅ Created #{visibility} repository #{repository.name}!\n\n"
    repository.setup_security_products_on_creation(user, false)

    alert_creation_promises = []

    # Code Scanning alerts are difficult to create manually, so when we want Code Scanning alerts, we replace the
    # underlying git repo with the premade Code Scanning git repo.
    # Thus, it's important that `create_code_scanning_alerts` occurs before alerts for other security features are created.
    alert_creation_promises << Promise.resolve(create_code_scanning_alerts(repository: repository)) if should_create_code_scanning_alerts
    alert_creation_promises << Promise.resolve(create_secret_scanning_alerts(repository: repository)) if should_create_secret_scanning_alerts
    alert_creation_promises << Promise.resolve(create_dependabot_alerts(repository: repository)) if should_create_dependabot_alerts

    Promise.all(alert_creation_promises).sync

    repository.set_archived if archived
    repository
  rescue => e # rubocop:todo Lint/GenericRescue
    puts "❌ Failed to create repository"
  end

  sig { params(repository: ::Repository).void }
  def create_secret_scanning_alerts(repository:)
    description = "Creating #{SecurityCenter::SecurityFeatures::SECRET_SCANNING.humanize.titleize} alerts for repository \"#{repository.name_with_display_owner}\""
    puts description

    with_retry(block_description: description) do
      Seeds::Runner::SecurityCenterSecretScanning.execute(
        organization_name: repository.organization.try(:login),
        repository_name: repository.name
      )
    end

    puts "✅ Created #{SecurityCenter::SecurityFeatures::SECRET_SCANNING.humanize.titleize} alerts for repository \"#{repository.name_with_display_owner}\"!\n\n"
  end

  sig { params(blk: T.proc.void).void }
  def silenced(&blk)
    if verbose
      yield
      return
    end

    original_stdout = $stdout
    begin
      $stdout = StringIO.new
      yield
    ensure
      $stdout = original_stdout
    end
  end

  sig { params(block_description: String, raise_on_retry_exhaustion: T::Boolean, sleep_seconds: Integer, blk: T.proc.void).void }
  def with_retry(block_description:, raise_on_retry_exhaustion: false, sleep_seconds: 3, &blk)
    attempts = 0

    begin
      yield
    rescue Exception => e # rubocop:todo Lint/GenericRescue
      # Certain seeds call `abort` instead of `raise` to stop the script. Rescuing `Exception` catches these cases so we can retry.

      attempts += 1

      if attempts > max_retries
        msg = "❌ Block \"#{block_description}\" - failed too many times."
        raise msg if raise_on_retry_exhaustion

        puts "#{msg} Moving on…"
        return
      end

      puts "❗️ Block \"#{block_description}\" - failed. Retrying…"
      sleep sleep_seconds
      retry
    end
  end
end

if __FILE__ == $0
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: generate_data.rb [options]"

    opts.on("-m", "--modify-github-business", "Modify GitHub business") do
      options[:modify_github_business] = true
    end

    opts.on("-b", "--num-of-businesses=[NUM]", Integer, "Number of businesses to create (default: #{DEFAULT_NUMBER_OF_BUSINESSES})") do |num|
      options[:num_of_businesses] = num
    end

    opts.on("-o", "--num-of-orgs-per-business=[NUM]", Integer, "Number of organizations per business to create (default: #{DEFAULT_NUMBER_OF_ORGS_PER_BUSINESS})") do |num|
      options[:num_of_orgs_per_business] = num
    end

    opts.on("-r", "--max-retries=[NUM]", Integer, "Maximum number of times to retry on failure (default: #{DEFAULT_MAX_RETRIES})") do |num|
      options[:max_retries] = num
    end

    opts.on("-v", "--verbose", "Enable verbose output") do
      options[:verbose] = true
    end
  end.parse!

  SecurityCenterGenerateData.new(options.to_hash).call
end
