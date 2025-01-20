# -*- encoding: utf-8 -*-
# stub: braintree 4.20.0 ruby lib

Gem::Specification.new do |s|
  s.name = "braintree".freeze
  s.version = "4.20.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/braintree/braintree_ruby/issues", "changelog_uri" => "https://github.com/braintree/braintree_ruby/blob/master/CHANGELOG.md", "documentation_uri" => "https://developer.paypal.com/braintree/docs", "source_code_uri" => "https://github.com/braintree/braintree_ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Braintree".freeze]
  s.date = "2024-03-26"
  s.description = "Resources and tools for developers to integrate Braintree's global payments platform.".freeze
  s.email = "code@getbraintree.com".freeze
  s.homepage = "https://www.braintreepayments.com/".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.2.5".freeze
  s.summary = "Braintree Ruby Server SDK".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<builder>.freeze, [">= 3.2.4".freeze])
  s.add_runtime_dependency(%q<rexml>.freeze, [">= 3.1.9".freeze])
end
