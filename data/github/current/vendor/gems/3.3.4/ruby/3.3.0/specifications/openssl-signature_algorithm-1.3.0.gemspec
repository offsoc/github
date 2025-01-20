# -*- encoding: utf-8 -*-
# stub: openssl-signature_algorithm 1.3.0 ruby lib

Gem::Specification.new do |s|
  s.name = "openssl-signature_algorithm".freeze
  s.version = "1.3.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/cedarcode/openssl-signature_algorithm/blob/master/CHANGELOG.md", "homepage_uri" => "https://github.com/cedarcode/openssl-signature_algorithm", "source_code_uri" => "https://github.com/cedarcode/openssl-signature_algorithm" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Gonzalo Rodriguez".freeze]
  s.bindir = "exe".freeze
  s.date = "2023-02-15"
  s.description = "ECDSA, EdDSA, RSA-PSS and RSA-PKCS#1 algorithms for ruby".freeze
  s.email = ["gonzalo@cedarcode.com".freeze]
  s.homepage = "https://github.com/cedarcode/openssl-signature_algorithm".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.2.32".freeze
  s.summary = "ECDSA, EdDSA, RSA-PSS and RSA-PKCS#1 algorithms for ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<openssl>.freeze, ["> 2.0".freeze])
end
