# -*- encoding: utf-8 -*-
# stub: ssh_data 1.3.0.20.g4ec1875 ruby lib

Gem::Specification.new do |s|
  s.name = "ssh_data".freeze
  s.version = "1.3.0.20.g4ec1875".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["mastahyeti".freeze]
  s.date = "2023-08-04"
  s.email = "opensource+ssh_data@github.com".freeze
  s.homepage = "https://github.com/github/ssh_data".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Library for parsing SSH certificates".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<ed25519>.freeze, ["~> 1.2".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.10".freeze])
  s.add_development_dependency(%q<rspec-parameterized>.freeze, ["~> 0.5".freeze])
  s.add_development_dependency(%q<rspec-mocks>.freeze, ["~> 3.10".freeze])
end
