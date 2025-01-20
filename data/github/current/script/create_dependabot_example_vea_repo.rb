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

class CreateExampleVulnerabilityExposureAnalysisRepository
  REQUIREMENTS = <<~'REQUIREMENTS'
    PyYAML>= 3.11, <3.12
    pillow>= 2.4.0, < 5.3.1
    tensorflow>= 2.4.0, < 2.4.2
  REQUIREMENTS

  LOAD = <<~'LOAD'
  """Examples of vulnerablity exposure analysis with pyyaml.
  """
  import yaml

  def load_from_yaml(self, filepath: str, model_identifiers: Dict[str, List[str]]):
    """
    Load fixtures from the given filename
    """
    rendered_yaml = self.env.get_template(filepath).render(
        model_identifiers=model_identifiers)
    data = yaml.load(rendered_yaml, Loader=yaml.FullLoader)

    identifier_data = {}
    filename = os.path.basename(filepath)

  def preload_for_yaml():
    with self._preloading_env() as env:
        rendered_yaml = env.get_template(filepath).render()
        data = yaml.load(rendered_yaml, Loader=yaml.FullLoader)
        if data:
            if filename in MULTI_CLASS_FILENAMES:
                for class_name in data:
                    model_identifiers[class_name] = list(
                        data[class_name].keys())
            else:
                class_name = filename[:filename.rfind('.')]
                model_identifiers[class_name] = list(data.keys())
  LOAD

  LOAD2 = <<~'LOAD2'
  """Examples of vulnerablity exposure analysis with pyyaml.
  """
  import yaml
  def postload_for_yaml:
    data = yaml.load(rendered_yaml, Loader=yaml.FullLoader)
    if data:
      print("Loaded data.")
  LOAD2

  PRELOAD = <<~'PRELOAD'
  def preload_for_yaml():
    with self._preloading_env() as env:
        rendered_yaml = env.get_template(filepath).render()
        data = yaml.preload(rendered_yaml, Loader=yaml.FullLoader)
        if data:
            if filename in MULTI_CLASS_FILENAMES:
                for class_name in data:
                    model_identifiers[class_name] = list(
                        data[class_name].keys())
            else:
                class_name = filename[:filename.rfind('.')]
                model_identifiers[class_name] = list(data.keys())
  PRELOAD

  POSTLOAD = <<~'POSTLOAD'
  """Examples of vulnerablity exposure analysis with pyyaml.
  """
  import yaml
  def postload_for_yaml:
    data = yaml.postload(rendered_yaml, Loader=yaml.FullLoader)
    if data:
      print("Loaded data.")
  POSTLOAD

  README = <<~'README'
    # %{repo_name}

    This example is managed by @github/dependabot-updates to provide an example repository
    to test vulnerability exposure analysis features. Currently only supports Python's `pip` ecosystem.

    Note that pushing changes to Manifest that fix vulnerabilities will not close the vulnerabilities
    in development without the [dependency-graph-api](https://github.com/github/dependency-graph-api) service.

    # Config

    ```
      GitHub Bot Install ID: %{dependabot_install_id}
    ```

    ---

    Need another test repo? Check out `bin/create-example-vea-repo.rb --help`

  README

  VEA_EXAMPLES = [
    {
      package_name: "pyyaml",
      range: "< 4.1",
      references: [
        {
          filename: "pyyaml/load.py",
          function_name: "yaml.load",
          locations: [
            { start_line: 11, end_line: 11, start_column: 15, end_column: 19 },
            { start_line: 19, end_line: 19, start_column: 19, end_column: 23 }
          ]
        },
        {
          filename: "pyyaml/another_load.py",
          function_name: "yaml.load",
          locations: [
            { start_line: 5, end_line: 5, start_column: 15, end_column: 19 },
          ]
        },
        {
          filename: "pyyaml/preload.py",
          function_name: "yaml.preload",
          locations: [
            { start_line: 4, end_line: 4, start_column: 19, end_column: 26 }
          ]
        },
        {
          filename: "pyyaml/postload.py",
          function_name: "yaml.postload",
          locations: [
            { start_line: 5, end_line: 5, start_column: 15, end_column: 23 }
          ]
        }
      ]
    }
  ]

  def create_repository(name: default_name, owner: monalisa, private: false)
    repository = owner.repositories.new(
      name: name,
      created_by_user_id: owner.id,
      private: private,
    )
    repository.save!
    repository.setup_git_repository

    install_dependabot_app(owner)
    add_manifests(repository, actor: owner)
    create_vulnerability_exposure_update(repository)
    VEA_EXAMPLES.each do |vea_item|
      add_example_alert_with_vea_data(repository: repository, data: vea_item)
    end

    repository
  rescue GitRPC::ConnectionError
    abort "\nIn order to seed repositories `script/server` must be running"
  end

  def install_dependabot_app(owner)
    return @dependabot_install if defined?(@dependabot_install)

    user = owner.organization? ? owner.admin : owner
    @dependabot_install = GitHub.dependabot_github_app.
                                 install_on(user,
                                   repositories: [],
                                   installer: user,
                                   entry_point: :script_create_dependabot_example_vulnerable_repo,
                                 ).
                                 installation
  end

  def add_manifests(repository, actor: monalisa)
    @commit = repository.commits.create({ message: "Initial commit", committer: actor }) do |files|
      files.add "requirements.txt", REQUIREMENTS
      files.add "pyyaml/load.py", LOAD
      files.add "pyyaml/another_load.py", LOAD2
      files.add "pyyaml/preload.py", PRELOAD
      files.add "pyyaml/postload.py", POSTLOAD
      files.add "README.md", readme_for(repository)
    end

    repository.refs.create("refs/heads/master", @commit, actor)
  end

  def create_vulnerability_exposure_update(repository)
    @update = RepositoryVulnerabilityExposureUpdate.create!(
      repository_id: repository.id,
      commit_oid: @commit.oid,
      state: "requested"
    )
  end

  def add_example_alert_with_vea_data(repository:, data:)
    vvr = VulnerableVersionRange.find_by(affects: data[:package_name], requirements: data[:range])

    alert = repository.repository_vulnerability_alerts.create!(
      vulnerable_version_range: vvr,
      vulnerability: T.must(vvr).vulnerability,
      vulnerable_manifest_path: "requirements.txt",
    )

    data[:references].each do |reference|
      reference_data = {
        repository_id: repository.id,
        vulnerable_version_range_id: T.must(vvr).id,
        repository_vulnerability_alert_id: alert.id,
        repository_vulnerability_exposure_update_id: @update.id,
        commit_oid: @commit.oid,
        function_name: reference[:function_name],
        filename: reference[:filename],
      }

      reference[:locations].each do |location|
        reference_data.merge!(location)
        RepositoryVulnerableFunctionReference.create(reference_data)
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
    "vea-repo-#{Time.now.to_i}"
  end

  def readme_for(repository)
    README % { repo_name: repository.name,
               dependabot_install_id: @dependabot_install.id }
  end
end

if __FILE__ == $0
  opts = {}
  OptionParser.new do |options|
    options.banner = "Usage: create_dependabot_example_vea_repo.rb [options]"

    options.on("-n", "--name NAME", "Name the repository") do |name|
      opts[:name] = name
    end

    options.on("-p", "--private", "Create a private repository (default: false)") do
      opts[:private] = true
    end

    options.on("-o", "--organization", "Create an Organization owned repository (default: false)") do
      opts[:organization] = true
    end

    options.on("-h", "--help", "Prints this help") do
      puts options
      exit
    end
  end.parse!

  # Create Dependabot app and install triggers
  CreateIntegrationTrigger.new.call

  # Create example vulnerability data
  CreateExampleVulnerabilities.new.call

  repository = CreateExampleVulnerabilityExposureAnalysisRepository.new.call(opts.to_hash)

  puts "\n\n"
  puts "Your new repository is ready:\n"
  puts "    http://#{GitHub.host_name}/#{repository.nwo}"
  puts "\n"
end
