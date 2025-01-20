# frozen_string_literal: true

require "rake/testtask"

Rake::TestTask.new do |test|
  test.libs << "lib" << "test"
  test.pattern = "test/**/test_*.rb"
  test.verbose = true
  test.warning = false
end

namespace :test do
  %i[acceptance api manage models validators view_models].each do |dir|
    Rake::TestTask.new(dir) do |test|
      test.libs << "lib" << "test"
      test.pattern = "test/#{dir}/**/test_*.rb"
      test.verbose = true
      test.warning = false
    end
  end
end
