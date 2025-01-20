# -*- encoding: utf-8 -*-
# stub: windbeam_api 0.15.0 ruby lib

Gem::Specification.new do |s|
  s.name = "windbeam_api".freeze
  s.version = "0.15.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/github/windbeam-api-ruby", "homepage_uri" => "https://github.com/github/windbeam-api-ruby", "source_code_uri" => "https://github.com/github/windbeam-api-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Nate Browne".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-07-10"
  s.email = ["nate-browne@github.com".freeze]
  s.homepage = "https://github.com/github/windbeam-api-ruby".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.4.19".freeze
  s.summary = "Ruby SDK for Windbeam's Twirp API.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 0".freeze])
end
