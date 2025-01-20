# -*- encoding: utf-8 -*-
# stub: tpm-key_attestation 0.12.1 ruby lib

Gem::Specification.new do |s|
  s.name = "tpm-key_attestation".freeze
  s.version = "0.12.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/cedarcode/tpm-key_attestation/blob/master/CHANGELOG.md", "homepage_uri" => "https://github.com/cedarcode/tpm-key_attestation", "source_code_uri" => "https://github.com/cedarcode/tpm-key_attestation" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Gonzalo".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-08-05"
  s.homepage = "https://github.com/cedarcode/tpm-key_attestation".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "TPM Key Attestation verifier".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<bindata>.freeze, ["~> 2.4".freeze])
  s.add_runtime_dependency(%q<openssl>.freeze, ["> 2.0".freeze])
  s.add_runtime_dependency(%q<openssl-signature_algorithm>.freeze, ["~> 1.0".freeze])
end
