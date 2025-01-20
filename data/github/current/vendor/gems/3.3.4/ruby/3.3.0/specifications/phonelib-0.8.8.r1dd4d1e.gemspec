# -*- encoding: utf-8 -*-
# stub: phonelib 0.8.8.r1dd4d1e ruby lib

Gem::Specification.new do |s|
  s.name = "phonelib".freeze
  s.version = "0.8.8.r1dd4d1e".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Vadim Senderovich".freeze]
  s.date = "2024-08-19"
  s.description = "    Google libphonenumber library was taken as a basis for\n    this gem. Gem uses its data file for validations and number formatting.\n".freeze
  s.email = ["daddyzgm@gmail.com".freeze]
  s.homepage = "https://github.com/daddyz/phonelib".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = [" --no-private - CHANGELOG.md --readme README.md".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Gem validates phone numbers with Google libphonenumber database".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, ["< 14.0".freeze])
  s.add_development_dependency(%q<nokogiri>.freeze, ["~> 1.15".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["= 2.14.1".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<benchmark-ips>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<benchmark-memory>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rack-cache>.freeze, ["= 1.2".freeze])
  s.add_development_dependency(%q<json>.freeze, ["= 2.3.1".freeze])
end
