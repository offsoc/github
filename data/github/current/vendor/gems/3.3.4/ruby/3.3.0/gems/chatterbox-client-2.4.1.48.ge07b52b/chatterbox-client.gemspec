# -*- encoding: utf-8 -*-
$:.push File.expand_path("../gem", __FILE__)
require "./chatterbox/version"

Gem::Specification.new do |s|
  s.name           = "chatterbox-client"
  s.version        = Chatterbox::VERSION
  s.platform       = Gem::Platform::RUBY
  s.authors        = ["The Scros at GitHub"]
  s.email          = ["all@github.com"]
  s.homepage       = ""
  s.summary        = %q{Shareable way to post to anything}
  s.description    = %q{Shareable way to post to topics that go to GitHub places}

  s.files          = %w[chatterbox/version.rb chatterbox/client.rb chatterbox-client.gemspec chatterbox-client.rb]
  s.require_paths  = ["."]

  s.required_ruby_version = '>= 3.1'

  s.metadata = {
    "allowed_push_host" => "https://rubygems.pkg.github.com",
    "github_repo" => "https://github.com/github/chatterbox",
  }
end
