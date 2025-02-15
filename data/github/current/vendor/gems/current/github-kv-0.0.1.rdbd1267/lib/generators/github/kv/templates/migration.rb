# rubocop:disable Lint/Syntax
class Create<%= table_name.camelize %>Table < ActiveRecord::Migration<%= migration_version %>
  def self.up
    create_table :<%= table_name %> do |t|
      t.string :key, :null => false<% if shard_key.present? %>
      <%= "t.bigint :#{shard_key}, :null => false, :unsigned => true" %><% end %>
      t.binary :value, :null => false
      t.datetime :expires_at, :null => true
      t.timestamps :null => false
    end

    add_index  :<%= table_name %>, <%= shard_key.present? ? "[:#{shard_key}, :key]" : ":key" %>, :unique => true
    add_index  :<%= table_name %>, :expires_at

    change_column  :<%= table_name %>, :id, "bigint(20) NOT NULL AUTO_INCREMENT"
  end

  def self.down
    drop_table  :<%= table_name %>
  end
end
# rubocop:enable all
