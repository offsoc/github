# frozen_string_literal: true

require "rails/generators/active_record"
require "rails/version"
module Github
  module KV
    module Generators
      class ActiveRecordGenerator < ::Rails::Generators::Base
        include ::Rails::Generators::Migration
        desc "Generates migration for KV table"

        namespace "github:kv:active_record"

        class_option :shard_key, type: :string, default: nil
        class_option :table_name, type: :string, default: nil

        source_paths << File.join(File.dirname(__FILE__), "templates")

        def create_migration_file
          migration_template "migration.rb", "db/migrate/create_#{table_name}_table.rb",
                             migration_version: migration_version
        end

        def self.next_migration_number(dirname)
          ::ActiveRecord::Generators::Base.next_migration_number(dirname)
        end

        def self.migration_version
          "[#{Rails::VERSION::MAJOR}.#{Rails::VERSION::MINOR}]"
        end

        def shard_key
          options["shard_key"]
        end

        def migration_version
          self.class.migration_version
        end

        def self.table_name
          GitHub::KV.config.table_name
        end

        def table_name
          options["table_name"] || self.class.table_name
        end
      end
    end
  end
end
