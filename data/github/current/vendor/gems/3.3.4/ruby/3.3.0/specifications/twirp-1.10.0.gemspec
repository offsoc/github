# -*- encoding: utf-8 -*-
# stub: twirp 1.10.0 ruby lib

Gem::Specification.new do |s|
  s.name = "twirp".freeze
  s.version = "1.10.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Cyrus A. Forbes".freeze, "Mario Izquierdo".freeze]
  s.date = "2023-01-05"
  s.description = "Twirp is a simple RPC framework with protobuf service definitions. The Twirp gem provides native support for Ruby.".freeze
  s.email = ["forbescyrus@gmail.com".freeze, "tothemario@gmail.com".freeze]
  s.homepage = "https://github.com/github/twirp-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9".freeze)
  s.rubygems_version = "3.3.3".freeze
  s.summary = "Twirp services in Ruby.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<google-protobuf>.freeze, ["~> 3.0".freeze, ">= 3.7.0".freeze])
  s.add_runtime_dependency(%q<faraday>.freeze, ["< 3".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 5".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 2.2.3".freeze])
end
