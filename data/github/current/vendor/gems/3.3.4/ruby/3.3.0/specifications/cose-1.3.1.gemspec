# -*- encoding: utf-8 -*-
# stub: cose 1.3.1 ruby lib

Gem::Specification.new do |s|
  s.name = "cose".freeze
  s.version = "1.3.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/cedarcode/cose-ruby/issues", "changelog_uri" => "https://github.com/cedarcode/cose-ruby/blob/master/CHANGELOG.md", "source_code_uri" => "https://github.com/cedarcode/cose-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Gonzalo Rodriguez".freeze, "Braulio Martinez".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-08-12"
  s.email = ["gonzalo@cedarcode.com".freeze, "braulio@cedarcode.com".freeze]
  s.homepage = "https://github.com/cedarcode/cose-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Ruby implementation of RFC 8152 CBOR Object Signing and Encryption (COSE)".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<cbor>.freeze, ["~> 0.5.9".freeze])
  s.add_runtime_dependency(%q<openssl-signature_algorithm>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<appraisal>.freeze, ["~> 2.2.0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.17".freeze, "< 3".freeze])
  s.add_development_dependency(%q<byebug>.freeze, ["~> 11.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.8".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["= 0.80.1".freeze])
  s.add_development_dependency(%q<rubocop-performance>.freeze, ["~> 1.4".freeze])
end
