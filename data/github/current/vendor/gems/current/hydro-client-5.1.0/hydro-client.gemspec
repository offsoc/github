# coding: utf-8
lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "hydro/version"

Gem::Specification.new do |spec|
  spec.name          = "hydro-client"
  spec.version       = Hydro::VERSION
  spec.authors       = ["Shreyas Joshi"]
  spec.email         = ["shreyasjoshis@github.com"]
  spec.licenses      = ["MIT"]

  spec.summary       = %q{Wrapper for Hydro.}
  spec.description   = %q{Wrapper for Hydro.}
  spec.homepage      = "https://github.com/github/hydro-client-ruby"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://rubygems.pkg.github.com/github"

    spec.metadata["homepage_uri"] = spec.homepage
    spec.metadata["source_code_uri"] = spec.homepage
    spec.metadata["changelog_uri"] = spec.homepage
    spec.metadata["github_repo"] = "ssh://github.com/github/hydro-client-ruby"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir.chdir(File.expand_path("..", __FILE__)) do
    Dir.glob("**/*").reject { |f| f.match(%r{^(test|spec|features|go)/}) }
  end

  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "activesupport", "> 6.0"
  spec.add_runtime_dependency "google-protobuf", ">= 3.7", "< 5.0"
  spec.add_runtime_dependency "ruby-kafka", ">= 1.3", "< 1.6"
  spec.add_runtime_dependency "zstd-ruby", "~> 1.5", ">= 1.5.1.1"
  spec.add_runtime_dependency "twirp"

  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake", "~> 13.2"
  spec.add_development_dependency "minitest", "~> 5.0"
  spec.add_development_dependency "grpc-tools", "~> 1.4"
  spec.add_development_dependency "webmock"
  spec.add_development_dependency "webrick"
  spec.add_development_dependency "rackup"
  spec.add_development_dependency "debug"
end
