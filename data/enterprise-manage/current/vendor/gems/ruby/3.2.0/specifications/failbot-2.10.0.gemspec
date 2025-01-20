# -*- encoding: utf-8 -*-
# stub: failbot 2.10.0 ruby lib

Gem::Specification.new do |s|
  s.name = "failbot".freeze
  s.version = "2.10.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["@rtomayko".freeze, "@atmos".freeze, "@sr".freeze]
  s.date = "2022-02-24"
  s.description = "...".freeze
  s.email = ["github+failbot@lists.github.com".freeze]
  s.homepage = "http://github.com/github/failbot#readme".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4".freeze)
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Deliver exceptions to Haystack".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, [">= 10.0"])
  s.add_development_dependency(%q<rack>.freeze, [">= 1.6.4"])
  s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.6"])
  s.add_development_dependency(%q<minitest>.freeze, [">= 5.0"])
  s.add_development_dependency(%q<minitest-stub-const>.freeze, [">= 0.6"])
  s.add_development_dependency(%q<webmock>.freeze, [">= 3.0"])
end
