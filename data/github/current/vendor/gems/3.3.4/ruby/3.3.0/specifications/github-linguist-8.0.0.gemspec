# -*- encoding: utf-8 -*-
# stub: github-linguist 8.0.0 ruby lib ext
# stub: ext/linguist/extconf.rb

Gem::Specification.new do |s|
  s.name = "github-linguist".freeze
  s.version = "8.0.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github-linguist/linguist" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze, "ext".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-09-02"
  s.description = "We use this library at GitHub to detect blob languages, highlight code, ignore binary files, suppress generated files in diffs, and generate language breakdown graphs.".freeze
  s.executables = ["github-linguist".freeze, "git-linguist".freeze]
  s.extensions = ["ext/linguist/extconf.rb".freeze]
  s.files = ["bin/git-linguist".freeze, "bin/github-linguist".freeze, "ext/linguist/extconf.rb".freeze]
  s.homepage = "https://github.com/github-linguist/linguist".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "GitHub Language detection".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<cgi>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<charlock_holmes>.freeze, ["~> 0.7.7".freeze])
  s.add_runtime_dependency(%q<mini_mime>.freeze, ["~> 1.0".freeze])
  s.add_runtime_dependency(%q<rugged>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.15".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 2.1".freeze])
  s.add_development_dependency(%q<plist>.freeze, ["~> 3.1".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.14".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<yajl-ruby>.freeze, ["~> 1.4".freeze])
  s.add_development_dependency(%q<licensed>.freeze, ["~> 4.0".freeze])
  s.add_development_dependency(%q<licensee>.freeze, ["~> 9.15".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.0".freeze])
end
