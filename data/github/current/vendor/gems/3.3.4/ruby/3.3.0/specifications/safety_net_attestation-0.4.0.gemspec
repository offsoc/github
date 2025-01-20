# -*- encoding: utf-8 -*-
# stub: safety_net_attestation 0.4.0 ruby lib

Gem::Specification.new do |s|
  s.name = "safety_net_attestation".freeze
  s.version = "0.4.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/bdewater/safety_net_attestation/blob/master/CHANGELOG.md", "homepage_uri" => "https://github.com/bdewater/safety_net_attestation", "source_code_uri" => "https://github.com/bdewater/safety_net_attestation" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Bart de Water".freeze]
  s.bindir = "exe".freeze
  s.date = "2019-12-31"
  s.homepage = "https://github.com/bdewater/safety_net_attestation".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3".freeze)
  s.rubygems_version = "3.1.2".freeze
  s.summary = "SafetyNet attestation response verification".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<jwt>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pry-byebug>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["= 0.75.0".freeze])
end
