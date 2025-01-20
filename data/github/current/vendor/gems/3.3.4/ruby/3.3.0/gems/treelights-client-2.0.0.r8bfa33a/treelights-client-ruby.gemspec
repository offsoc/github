lib = File.expand_path("../ruby/lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "treelights/version"

Gem::Specification.new do |spec|
  spec.name          = "treelights-client"
  spec.version       = Github::Treelights::VERSION
  spec.authors       = ["Max Brunsfeld, Timothy Clem, Vicent Marti"]
  spec.email         = ["maxbrunsfeld@gmail.com, timothy.clem@gmail.com, vmg@github.com"]

  spec.summary       = %q{Twirp Client for Treelights.}
  spec.description   = %q{Treelights is an RPC service that performs syntax highlighting for source code.}
  spec.homepage      = "https://github.com/github/treelights-client-ruby"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = [
    *Dir.glob("./*.gemspec"),
    *Dir.glob("Gemfile"),
    *Dir.glob("Gemfile.lock"),
    *Dir.glob("ruby/Rakefile"),
    *Dir.glob("ruby/**/*.rb").reject {|f| f.match(/\bspec/)},
  ]

  spec.require_paths = ["ruby/lib"]

  spec.add_runtime_dependency "google-protobuf", '~> 3.5'
  spec.add_runtime_dependency 'twirp', '~> 1.1'
  spec.add_runtime_dependency "faraday", '>= 0.9'
  
  spec.add_development_dependency 'rack', '~> 3.0'
  spec.add_development_dependency "bundler", "~> 2.4"
  spec.add_development_dependency "rspec", "~> 3.8"
  spec.add_development_dependency "vcr", "~> 6.0"
  spec.add_development_dependency "webmock", "~> 3.5"
end
