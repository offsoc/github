# -*- encoding: utf-8 -*-
# stub: RedCloth 4.3.3 ruby lib lib/case_sensitive_require ext
# stub: ext/redcloth_scan/extconf.rb

Gem::Specification.new do |s|
  s.name = "RedCloth".freeze
  s.version = "4.3.3".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze, "lib/case_sensitive_require".freeze, "ext".freeze]
  s.authors = ["Jason Garber".freeze, "Joshua Siler".freeze, "Ola Bini".freeze]
  s.date = "2023-11-03"
  s.description = "Textile parser for Ruby.".freeze
  s.email = "redcloth-upwards@rubyforge.org".freeze
  s.executables = ["redcloth".freeze]
  s.extensions = ["ext/redcloth_scan/extconf.rb".freeze]
  s.extra_rdoc_files = ["README.rdoc".freeze, "COPYING".freeze, "CHANGELOG".freeze]
  s.files = ["CHANGELOG".freeze, "COPYING".freeze, "README.rdoc".freeze, "bin/redcloth".freeze, "ext/redcloth_scan/extconf.rb".freeze]
  s.homepage = "http://redcloth.org".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--charset=UTF-8".freeze, "--line-numbers".freeze, "--inline-source".freeze, "--title".freeze, "RedCloth".freeze, "--main".freeze, "README.rdoc".freeze]
  s.rubygems_version = "3.4.19".freeze
  s.summary = "RedCloth-4.3.3".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["> 1.3.4".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.12".freeze])
  s.add_development_dependency(%q<diff-lcs>.freeze, ["~> 1.5".freeze])
end
