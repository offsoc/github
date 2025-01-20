lib = File.expand_path("../ruby/lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "aleph/version"

Gem::Specification.new do |spec|
  spec.name          = "aleph-client"
  spec.version       = Aleph::VERSION
  spec.authors       = ["Timothy Clem"]
  spec.email         = ["timothy.clem@gmail.com"]

  spec.summary       = %q{Twirp Client for Aleph.}
  spec.description   = %q{Aleph is an RPC service that provides code navigation services.}
  spec.homepage      = "https://github.com/github/aleph-client-ruby"
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  # Specify which files should be added to the gem when it is released.
  spec.files = [
    *Dir.glob("./*.gemspec"),
    *Dir.glob("Gemfile"),
    *Dir.glob("Gemfile.lock"),
    *Dir.glob("LICENSE"),
    *Dir.glob("ruby/**/*.rb").reject {|f| f.match(/\bspec/)},
  ]
  spec.require_paths = ["ruby/lib"]

  spec.add_runtime_dependency "google-protobuf", '~> 3.14'
  spec.add_runtime_dependency 'twirp', '~> 1.1'
  spec.add_runtime_dependency "faraday", '>= 0.17.3', '<= 2.3.0'

  spec.add_development_dependency "bundler", "~> 2.4.3"
  spec.add_development_dependency "rspec", "~> 3.8"
  spec.add_development_dependency "vcr", "~> 6.1"
  spec.add_development_dependency "webmock", "~> 3.8"
end
