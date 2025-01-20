lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "aqueduct/version"

Gem::Specification.new do |spec|
  spec.name          = "aqueduct-client"
  spec.version       = Aqueduct::VERSION
  spec.authors       = "@github/data-pipelines"

  spec.summary       = "An aqueduct client for ruby"
  spec.homepage      = "https://github.com/github/aqueduct-client-ruby"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://rubygems.pkg.github.com/github"

    spec.metadata["homepage_uri"] = spec.homepage
    spec.metadata["source_code_uri"] = "https://github.com/github/aqueduct-client-ruby"
    spec.metadata["changelog_uri"] = "https://github.com/github/aqueduct-client-ruby"
    spec.metadata["github_repo"] = "ssh://github.com/github/aqueduct-client-ruby"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  # Specify which files should be added to the gem when it is released.
  spec.files         = Dir.chdir(File.expand_path('..', __FILE__)) do
    Dir.glob("**/*").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "google-protobuf", "~> 3.12"
  spec.add_runtime_dependency "twirp", ">= 1.1"
  spec.add_runtime_dependency "faraday"
  spec.add_runtime_dependency "nanoid"

  spec.add_development_dependency "bundler", "~> 2"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.0"
  spec.add_development_dependency "rack"
  spec.add_development_dependency "webrick"
end
