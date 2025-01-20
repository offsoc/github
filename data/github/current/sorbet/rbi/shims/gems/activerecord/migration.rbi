# typed: true
# frozen_string_literal: true

class ActiveRecord::Migration
  include ActiveRecord::ConnectionAdapters::SchemaStatements
  include ActiveRecord::ConnectionAdapters::Quoting
  include ActiveRecord::ConnectionAdapters::DatabaseStatements
  extend ActiveRecord::ConnectionHandling
end
