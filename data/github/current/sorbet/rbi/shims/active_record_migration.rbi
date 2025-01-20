class ActiveRecord::Migration
  include GitHub::VitessMigrationExtensions

  # Ideally lib/github/migration_extensions.rb would be updated to be Sorbet compliant, but for now
  # this can fill the gap.
  def self.connection_specification_name=(name); end
  def self.connection_specification_name; end
  def self.use_connection_class(klass); end
end
