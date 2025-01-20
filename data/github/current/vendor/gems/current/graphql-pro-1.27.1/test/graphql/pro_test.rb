# frozen_string_literal: true
require "test_helper"

class ProTest < Minitest::Test
  parallelize_me!

  def test_it_works_without_rails
    if !rails_loaded? || !MODERN_RAILS
      # rails 4.1 raises an issue about JSON version conflicts:
      # /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler/runtime.rb:317:in `check_for_activated_spec!': You have already activated json 2.1.0, but your Gemfile requires json 1.8.6. Prepending `bundle exec` to your command may solve this. (Gem::LoadError)
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler/runtime.rb:32:in `block in setup'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler/runtime.rb:27:in `map'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler/runtime.rb:27:in `setup'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler.rb:101:in `setup'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/gems/2.3.0/gems/bundler-1.15.3/lib/bundler/setup.rb:19:in `<top (required)>'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/site_ruby/2.3.0/rubygems/core_ext/kernel_require.rb:55:in `require'
      # from /Users/rmosolgo/.rbenv/versions/2.3.2/lib/ruby/site_ruby/2.3.0/rubygems/core_ext/kernel_require.rb:55:in `require'
      skip
    else
      version = `ruby -Ilib -e "require('graphql/pro'); puts(GraphQL::Pro::VERSION)"`.chomp
      assert_equal GraphQL::Pro::VERSION, version
    end
  end

  def test_it_loaded_or_didnt_load_rails
    if rails_loaded?
      assert defined?(Rails)
    else
      refute defined?(Rails)
    end
  end

  def test_it_passes_rubocop
    # On GitHub actions, it finds vendor/bundled/... configs
    assert system("bundle exec rubocop --config .rubocop.yml")
  end
end
