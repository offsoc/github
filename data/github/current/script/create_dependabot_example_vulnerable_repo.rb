#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

require_relative "../config/environment"
require_relative "create-dependabot-github-app"
require_relative "create_dependabot_example_vulnerabilities"
require "optparse"

unless Rails.env.development?
  abort "This can only be run in development"
end

class CreateExampleVulnerableRepository
  FEATURES_ON_REPO = []

  GEMFILE = <<~'GEMFILE'
    # frozen_string_literal: true

    source "https://rubygems.org"

    git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

    gem "octokit"
  GEMFILE

  GEMFILE_LOCK = <<~'GEMFILE_LOCK'
    GEM
      remote: https://rubygems.org/
      specs:
        addressable (2.5.2)
          public_suffix (>= 2.0.2, < 4.0)
        faraday (0.15.3)
          multipart-post (>= 1.2, < 3)
        multipart-post (2.0.0)
        octokit (4.13.0)
          sawyer (~> 0.8.0, >= 0.5.3)
        public_suffix (3.0.3)
        sawyer (0.8.1)
          addressable (>= 2.3.5, < 2.6)
          faraday (~> 0.8, < 1.0)

    PLATFORMS
      ruby

    DEPENDENCIES
      octokit

    BUNDLED WITH
       1.17.2
  GEMFILE_LOCK

  PACKAGE_LOCK = <<~'PACKAGE_LOCK'
  {
    "name": "test",
    "version": "1.0.0",
    "devDependencies": {
      "sawyer": "0.8.1"
    }
  }
  PACKAGE_LOCK

  README = <<~'README'
    # %{repo_name}

    This example is managed by @github/dependabot-updates to provide a test rig for our features.

    Note that pushing changes to Manifest that fix vulnerabilities will not close the vulnerabilities
    in development without the [dependency-graph-api](https://github.com/github/dependency-graph-api) service.

    # Features

    Enabled for repository:
      %{features_on_repo}

    # Config

    ```
      GitHub Bot Install ID: %{dependabot_install_id}
    ```

    ---

    Need another test repo? Check out `bin/create-example-vulnerable-repo.rb --help`

  README

  GEM_VULNERABLE_DEPENDENCIES = [
    { package_name: "octokit", ranges: [">= 4.10.0, < 4.14.0", "> 4.10.0"], dependency_scope: "runtime" },
    { package_name: "faraday", ranges: ["> 0.1.0, < 0.15.4"], dependency_scope: "development" },
    { package_name: "multipart-post", ranges: [">= 2.0.0"], dependency_scope: "development" },
  ]

  NPM_VULNERABLE_DEPENDENCIES = [
    { package_name: "sawyer", ranges: [">= 0.8.1"], dependency_scope: "development" },
  ]

  def create_repository(name: default_name, owner: monalisa, private: false, repository: nil)
    unless repository
      repository = ::Repository.handle_creation(
        owner.organization? ? owner.admins.first : owner,
        owner,
        {
          name: name,
          public: !private,
          template: false
        },
        synchronous: true
      ).repository
      repository.reset_memoized_attributes
    end

    repository.setup_git_repository
    repository.enable_vulnerability_alerts(actor: owner)

    enable_features(repository)
    install_dependabot_app(owner)
    add_manifests(repository, actor: owner)
    add_example_vulnerabilities(repository)

    repository
  rescue GitRPC::ConnectionError
    abort "\nIn order to seed repositories `script/server` must be running"
  end

  def enable_features(repository)
    FEATURES_ON_REPO.each do |feature|
      repository.enable_feature(feature)
    end
  end

  def install_dependabot_app(owner)
    return @dependabot_install if defined?(@dependabot_install)

    user = owner.organization? ? owner.admin : owner
    dependabot_github_app = if GitHub.dependabot_github_app.nil?
      Integration.find_by(
        owner_id: GitHub.trusted_oauth_apps_owner,
        slug: "dependabot",
      )
    else
      GitHub.dependabot_github_app
    end

    @dependabot_install = dependabot_github_app.install_on(
      user,
      repositories: [],
      installer: user,
      entry_point: :script_create_dependabot_example_vulnerable_repo
    ).installation
  end

  def add_manifests(repository, actor: monalisa)
    commit = repository.commits.create({ message: "Initial commit", committer: actor }) do |files|
      files.add "Gemfile", GEMFILE
      files.add "Gemfile.lock", GEMFILE_LOCK
      files.add "package-lock.json", PACKAGE_LOCK
      files.add "README.md", readme_for(repository)
    end

    repository.refs.create("refs/heads/master", commit, actor)
  end

  def add_example_vulnerabilities(repository)
    GEM_VULNERABLE_DEPENDENCIES.each do |dependency|
      dependency[:ranges].each do |range|
        vvr = VulnerableVersionRange.find_by(affects: dependency[:package_name], requirements: range)
        repository.repository_vulnerability_alerts.create!(
          vulnerable_version_range: vvr,
          vulnerability: T.must(vvr).vulnerability,
          vulnerable_manifest_path: "Gemfile.lock",
          dependency_scope: dependency[:dependency_scope]
        )
      end
    end

    NPM_VULNERABLE_DEPENDENCIES.each do |dependency|
      dependency[:ranges].each do |range|
        vvr = VulnerableVersionRange.find_by(affects: dependency[:package_name], requirements: range)
        repository.repository_vulnerability_alerts.create!(
          vulnerable_version_range: vvr,
          vulnerability: T.must(vvr).vulnerability,
          vulnerable_manifest_path: "package-lock.json",
          dependency_scope: dependency[:dependency_scope]
        )
      end
    end
  end

  def call(options)
    owner = options[:organization] ? github : monalisa
    create_repository(name: options[:name] || default_name,
                      owner: owner,
                      private: options[:private])
  end

  private

  def monalisa
    return @monalisa if defined?(@monalisa)
    @monalisa = User.find_by!(login: "monalisa")
  end

  def github
    return @github if defined?(@github)
    @github = Organization.find_by!(login: "github")
  end

  def default_name
    "vulnerable-repo-#{Time.now.to_i}"
  end

  def readme_for(repository)
    README % { repo_name: repository.name,
               features_on_repo: repo_feature_list,
               dependabot_install_id: @dependabot_install&.id }
  end

  def repo_feature_list
    FEATURES_ON_REPO.to_yaml
  end
end

if __FILE__ == $0
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: create_dependabot_example_vulnerable_repo.rb [options]"

    opts.on("-n", "--name NAME", "Name the repository") do |name|
      options[:name] = name
    end

    opts.on("-p", "--private", "Create a private repository (default: false)") do
      options[:private] = true
    end

    opts.on("-o", "--organization", "Create an Organization owned repository (default: false)") do
      options[:organization] = true
    end
  end.parse!


  # Create Dependabot app and install triggers
  CreateIntegrationTrigger.new.call

  # Create example vulnerability data
  CreateExampleVulnerabilities.new.call

  repository = CreateExampleVulnerableRepository.new.call(options.to_hash)

  puts "\n\n"
  puts "Your new repository is ready:\n"
  puts "    http://#{GitHub.host_name}/#{repository.nwo}"
  puts "\n"
end
