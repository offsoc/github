# frozen_string_literal: true
namespace :cache do
  desc "flush memcached"
  task :flush => :environment do
    GitHub.cache.flush_all
  end
end
