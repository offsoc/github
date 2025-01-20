# -*- encoding: utf-8 -*-
# stub: webauthn 3.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "webauthn".freeze
  s.version = "3.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/cedarcode/webauthn-ruby/issues", "changelog_uri" => "https://github.com/cedarcode/webauthn-ruby/blob/master/CHANGELOG.md", "source_code_uri" => "https://github.com/cedarcode/webauthn-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Gonzalo Rodriguez".freeze, "Braulio Martinez".freeze]
  s.bindir = "exe".freeze
  s.date = "2023-12-26"
  s.description = "WebAuthn ruby server library \u2015 Make your application a W3C Web Authentication conformant\n    Relying Party and allow your users to authenticate with U2F and FIDO2 authenticators.".freeze
  s.email = ["gonzalo@cedarcode.com".freeze, "braulio@cedarcode.com".freeze]
  s.homepage = "https://github.com/cedarcode/webauthn-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.5".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "WebAuthn ruby server library".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<android_key_attestation>.freeze, ["~> 0.3.0".freeze])
  s.add_runtime_dependency(%q<awrence>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<bindata>.freeze, ["~> 2.4".freeze])
  s.add_runtime_dependency(%q<cbor>.freeze, ["~> 0.5.9".freeze])
  s.add_runtime_dependency(%q<cose>.freeze, ["~> 1.1".freeze])
  s.add_runtime_dependency(%q<openssl>.freeze, [">= 2.2".freeze])
  s.add_runtime_dependency(%q<safety_net_attestation>.freeze, ["~> 0.4.0".freeze])
  s.add_runtime_dependency(%q<tpm-key_attestation>.freeze, ["~> 0.12.0".freeze])
  s.add_development_dependency(%q<base64>.freeze, [">= 0.1.0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.17".freeze, "< 3.0".freeze])
  s.add_development_dependency(%q<byebug>.freeze, ["~> 11.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.9.1".freeze])
  s.add_development_dependency(%q<rubocop-rake>.freeze, ["~> 0.5.1".freeze])
  s.add_development_dependency(%q<rubocop-rspec>.freeze, ["~> 2.2.0".freeze])
end
