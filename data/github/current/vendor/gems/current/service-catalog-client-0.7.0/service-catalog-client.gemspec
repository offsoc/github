# frozen_string_literal: true

lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "service-catalog/client/version"

Gem::Specification.new do |spec|
  spec.name          = "service-catalog-client"
  spec.version       = ServiceCatalog::Client::VERSION
  spec.authors       = ["Parker Moore"]
  spec.email         = ["opensource@github.com"]

  spec.summary       = %q{A Ruby client for communicating with the Service Catalog API.}
  spec.homepage      = "https://github.com/github/cat"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://octofactory.githubapp.com/artifactory/api/gems/cat-gems-releases-local"

    spec.metadata["homepage_uri"] = spec.homepage
    spec.metadata["source_code_uri"] = "https://github.com/github/cat/tree/HEAD/service-catalog-client"
    spec.metadata["changelog_uri"] = "https://github.com/github/cat/blob/HEAD/service-catalog-client/CHANGELOG.md"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files         = Dir.chdir(File.expand_path("..", __FILE__)) do
    Dir.glob("**/*").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "activesupport"

  spec.add_development_dependency "graphql"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "minitest", "~> 5.0"
  spec.add_development_dependency "webmock", "~> 3.8"
  spec.add_development_dependency "yard", "~> 0.9.0"
end
