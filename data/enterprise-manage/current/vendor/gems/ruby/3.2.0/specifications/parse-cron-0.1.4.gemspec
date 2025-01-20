# -*- encoding: utf-8 -*-
# stub: parse-cron 0.1.4 ruby lib

Gem::Specification.new do |s|
  s.name = "parse-cron".freeze
  s.version = "0.1.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Michael Siebert".freeze]
  s.date = "2014-02-06"
  s.description = "Parses cron expressions and calculates the next occurence".freeze
  s.email = ["siebertm85@googlemail.com".freeze]
  s.homepage = "https://github.com/siebertm/parse-cron".freeze
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Parses cron expressions and calculates the next occurence".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rspec>.freeze, ["~> 2.6.0"])
end
