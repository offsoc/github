# -*- encoding: utf-8 -*-
# stub: chatops-controller 5.2.0.4.g2193e18 ruby lib

Gem::Specification.new do |s|
  s.name = "chatops-controller".freeze
  s.version = "5.2.0.4.g2193e18".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ben Lavender".freeze, "Misty De Meo".freeze, "GitHub".freeze]
  s.date = "2024-05-10"
  s.description = "See the README for documentation".freeze
  s.email = ["opensource+chatops-controller@github.com".freeze]
  s.homepage = "https://github.com/github/chatops-controller".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Rails helpers to create JSON-RPC chatops".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<actionpack>.freeze, [">= 6.0".freeze])
  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 6.0".freeze])
  s.add_development_dependency(%q<rspec-rails>.freeze, ["~> 3".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0".freeze])
end
