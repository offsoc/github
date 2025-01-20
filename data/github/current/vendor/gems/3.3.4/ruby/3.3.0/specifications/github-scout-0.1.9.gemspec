# -*- encoding: utf-8 -*-
# stub: github-scout 0.1.9 ruby lib

Gem::Specification.new do |s|
  s.name = "github-scout".freeze
  s.version = "0.1.9".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github/scout" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-09-03"
  s.description = "We use the scout library to detect blob stack".freeze
  s.email = ["anuragc617@github.com".freeze, "bishal-pdmsft@github.com".freeze]
  s.executables = ["scout".freeze]
  s.files = ["bin/scout".freeze]
  s.homepage = "https://github.com/github/scout".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "GitHub tech stack detection".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<github-linguist>.freeze, ["~> 8".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.10".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.14".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 0".freeze])
end
