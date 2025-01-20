# frozen_string_literal: true
module ActiveRecordSetup
  module_function

  def define_schema
    return if !rails_loaded?
    # Make sure it works if this configuration is set in the client app
    GraphQL::Pro::OperationStore::ActiveRecordBackend::GraphQLOperationStoreModel.primary_key_prefix_type = :table_name_with_underscore

    ActiveRecord::Schema.define do
      self.verbose = false
      # FIXTURES STRUCTURE
      create_table :cards, primary_key: :id do |t|
        t.column :name, :string
        t.column :mana_cost, :string
        t.column :converted_mana_cost, :integer
        t.column :colors_s, :string
        t.column :rarity, :string, null: false
        if active_record_config[:adapter] == "postgresql"
          t.json :metadata
        end
        t.timestamps
      end

      create_table :expansions, primary_key: :id do |t|
        t.column :name, :string
        t.column :sym, :string
        t.column :release_date, :date
        t.timestamps
      end

      create_table :printings, primary_key: :id do |t|
        t.column :card_name, :string
        t.column :card_mana_cost, :string
        t.column :expansion_id, :integer
        t.timestamps
      end

      # CanCan Integration structure
      create_table :can_can_customers, primary_key: :id do |t|
        t.column :name, :string
        t.column :credit_card_number, :string
      end
      create_table :can_can_orders, primary_key: :id do |t|
        t.column :can_can_customer_id, :integer
        t.column :total_amount, :integer
      end
      create_table :can_can_stores, primary_key: :id do |t|
        t.column :name, :string
      end

      # Pundit Integration structure
      create_table :pundit_beasts, primary_key: :id do |t|
        t.column :name, :string
        t.column :nickname, :string
        t.column :current_whereabouts_description, :string
      end

      # OPERATION STORE STRUCTURE
      create_table :graphql_clients, primary_key: :id do |t|
        t.column :name, :string, null: false
        t.column :secret, :string, null: false
        t.timestamps
      end
      add_index :graphql_clients, :name, unique: true
      add_index :graphql_clients, :secret, unique: true

      create_table :graphql_client_operations, primary_key: :id do |t|
        t.references :graphql_client, null: false
        t.references :graphql_operation, null: false
        t.column :alias, :string, null: false
        t.column :last_used_at, :datetime, null: true, index: true
        t.column :is_archived, :boolean, default: false, index: true
        t.timestamps
      end
      add_index :graphql_client_operations, [:graphql_client_id, :alias], unique: true, name: "graphql_client_operations_pairs"

      create_table :graphql_operations, primary_key: :id do |t|
        t.column :digest, :string, null: false
        t.column :body, :text, null: false
        t.column :name, :string, null: false
        t.timestamps
      end
      add_index :graphql_operations, :digest, unique: true

      create_table :graphql_index_entries, primary_key: :id do |t|
        t.column :name, :string, null: false
      end
      add_index :graphql_index_entries, :name, unique: true

      create_table :graphql_index_references, primary_key: :id do |t|
        t.references :graphql_index_entry, null: false
        t.references :graphql_operation, null: false
      end
      add_index :graphql_index_references, [:graphql_index_entry_id, :graphql_operation_id], unique: true, name: "graphql_index_reference_pairs"

      if active_record_config[:adapter] == "postgresql"
        begin
          execute <<-SQL
          -- Enable PostGIS (includes raster)
          CREATE EXTENSION postgis;
          SQL
        rescue ActiveRecord::StatementInvalid => err
          if err.message.include?("already exists")
            # no big deal, the extension is already installed
          else
            raise err
          end
        end

        execute <<-SQL
        create or replace function public.find_in_array(
          needle anyelement,
          haystack anyarray) returns integer as $$
        declare
          i integer;
        begin
          for i in 1..array_upper(haystack, 1) loop
            if haystack[i] = needle then
              return i;
            end if;
          end loop;
          raise exception 'find_in_array: % not found in %', needle, haystack;
        end;
        $$ language 'plpgsql'
        SQL
      end
    end
  end
end
