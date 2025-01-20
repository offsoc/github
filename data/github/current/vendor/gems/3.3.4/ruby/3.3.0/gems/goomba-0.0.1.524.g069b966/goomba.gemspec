# encoding: UTF-8

require_relative 'lib/goomba/version'

Gem::Specification.new do |s|
  s.name = 'goomba'
  s.version = Goomba::VERSION
  s.summary = "html document transformation"
  s.description = <<-EOF
  EOF
  s.email = 'vicent@github.com'
  s.homepage = 'https://github.com/github/goomba'
  s.authors = ["Vicent Marti"]

  s.files = %w[
    Rakefile
    goomba.gemspec
    lib/goomba.rb
    lib/goomba/sanitizer.rb
    lib/goomba/version.rb
  ]
  s.files += Dir.glob("ext/goomba/*.{c,h}")
  s.files += Dir.glob("ext/goomba/jit/*.{in,h}")

  s.test_files = []
  s.extensions = ["ext/goomba/extconf.rb"]
  s.require_paths = ["lib"]

  s.add_development_dependency "rake-compiler", "~> 1.0"
  s.add_development_dependency "minitest", "~> 5.5.1"
end
