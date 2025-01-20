# -*- encoding: utf-8 -*-
# stub: github-ldap 1.10.1.7.g5a50c9c ruby lib

Gem::Specification.new do |s|
  s.name = "github-ldap".freeze
  s.version = "1.10.1.7.g5a50c9c"

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["David Calavera".freeze, "Matt Todd".freeze]
  s.date = "2017-06-06"
  s.description = "LDAP authentication for humans".freeze
  s.email = ["david.calavera@gmail.com".freeze, "chiology@gmail.com".freeze]
  s.homepage = "https://github.com/github/github-ldap".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.10".freeze
  s.summary = "LDAP client authentication wrapper without all the boilerplate".freeze

  s.installed_by_version = "3.4.10" if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<net-ldap>.freeze, ["~> 0.16.0"])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3"])
  s.add_development_dependency(%q<ladle>.freeze, [">= 0"])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5"])
  s.add_development_dependency(%q<rake>.freeze, [">= 0"])
end
