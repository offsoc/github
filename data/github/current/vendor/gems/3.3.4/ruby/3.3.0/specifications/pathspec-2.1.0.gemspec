# -*- encoding: utf-8 -*-
# stub: pathspec 2.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "pathspec".freeze
  s.version = "2.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org", "rubygems_mfa_required" => "true" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Brandon High".freeze]
  s.date = "2024-04-10"
  s.description = "Use to match path patterns such as gitignore".freeze
  s.email = "highb@users.noreply.github.com".freeze
  s.executables = ["pathspec-rb".freeze]
  s.files = ["bin/pathspec-rb".freeze]
  s.homepage = "https://github.com/highb/pathspec-ruby".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.0".freeze)
  s.rubygems_version = "3.3.26".freeze
  s.summary = "PathSpec: for matching path patterns".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.2".freeze])
  s.add_development_dependency(%q<fakefs>.freeze, ["~> 2.5".freeze])
  s.add_development_dependency(%q<kramdown>.freeze, ["~> 2.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.10".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.63.0".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.21".freeze])
end
