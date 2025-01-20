# -*- encoding: utf-8 -*-
# stub: version_sorter 2.3.0 ruby lib
# stub: ext/version_sorter/extconf.rb

Gem::Specification.new do |s|
  s.name = "version_sorter".freeze
  s.version = "2.3.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Chris Wanstrath".freeze, "K. Adam Christensen".freeze]
  s.date = "2021-10-20"
  s.description = "VersionSorter is a C extension that does fast sorting of large sets of version strings.".freeze
  s.email = "chris@ozmm.org".freeze
  s.extensions = ["ext/version_sorter/extconf.rb".freeze]
  s.files = ["ext/version_sorter/extconf.rb".freeze]
  s.homepage = "https://github.com/github/version_sorter#readme".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.15".freeze
  s.summary = "Fast sorting of version strings".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version
end
