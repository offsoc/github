# -*- encoding: utf-8 -*-
# stub: actions-runner-admin 0.0.1.r2aaecbd ruby ruby/lib/actions-runner-admin gen/ruby

Gem::Specification.new do |s|
  s.name = "actions-runner-admin".freeze
  s.version = "0.0.1.r2aaecbd".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["ruby/lib/actions-runner-admin".freeze, "gen/ruby".freeze]
  s.authors = ["luketomlinson".freeze]
  s.date = "2023-09-05"
  s.homepage = "https://github.com/github/actions-runner-admin".freeze
  s.rubygems_version = "3.4.10".freeze
  s.summary = "Ruby client for actions-runner-admin service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<twirp>.freeze, ["~> 1.1".freeze])
end
