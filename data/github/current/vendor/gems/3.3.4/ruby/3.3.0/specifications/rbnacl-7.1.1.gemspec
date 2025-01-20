# -*- encoding: utf-8 -*-
# stub: rbnacl 7.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "rbnacl".freeze
  s.version = "7.1.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/RubyCrypto/rbnacl/issues", "changelog_uri" => "https://github.com/RubyCrypto/rbnacl/blob/master/CHANGES.md", "documentation_uri" => "https://www.rubydoc.info/gems/rbnacl/7.1.1", "source_code_uri" => "https://github.com/RubyCrypto/rbnacl/tree/v7.1.1", "wiki_uri" => "https://github.com/RubyCrypto/rbnacl/wiki" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Tony Arcieri".freeze, "Jonathan Stott".freeze]
  s.date = "2020-01-27"
  s.description = "The Networking and Cryptography (NaCl) library provides a high-level toolkit for building cryptographic systems and protocols".freeze
  s.email = ["bascule@gmail.com".freeze, "jonathan.stott@gmail.com".freeze]
  s.homepage = "https://github.com/RubyCrypto/rbnacl".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3.0".freeze)
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Ruby binding to the libsodium/NaCl cryptography library".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<ffi>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
end
