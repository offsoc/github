# -*- encoding: utf-8 -*-
# stub: github_chatops_extensions 0.5.2.96.g33cefed ruby lib

Gem::Specification.new do |s|
  s.name = "github_chatops_extensions".freeze
  s.version = "0.5.2.96.g33cefed".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Kevin Paulisse".freeze, "Baraa Basata".freeze, "Tom Maher".freeze]
  s.date = "2024-03-12"
  s.description = "`github-chatops-extensions` provides utilities to write modular chatops in Ruby while plugging in to\nsome back end systems that GitHub uses for authentication and authorization.\n".freeze
  s.email = "security@github.com".freeze
  s.homepage = "https://github.com/github/github-chatops-extensions".freeze
  s.licenses = ["GitHub Internal Use Only".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Utilities to check entitlements, add Duo 2FA, and write modular chatops in Ruby.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<chatterbox-client>.freeze, ["~> 2.3".freeze])
  s.add_runtime_dependency(%q<failbot>.freeze, [">= 2.5".freeze, "< 4".freeze])
  s.add_runtime_dependency(%q<fido-challenger-client>.freeze, ["~> 0.10.g73f5eb8".freeze])
  s.add_runtime_dependency(%q<net-ldap>.freeze, ["~> 0.17".freeze])
  s.add_runtime_dependency(%q<rack>.freeze, [">= 2.2".freeze, "< 4.0".freeze])
  s.add_runtime_dependency(%q<dogstatsd-ruby>.freeze, ["~> 5.6".freeze])
end
