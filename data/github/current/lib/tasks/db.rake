# frozen_string_literal: true
# rubocop:disable GitHub/DoNotCallMethodsOnActiveRecordBase
require "structure_cleaner"
require "github/database_structure"
require "tasks/database_tasks"
require "test_schema"
require "progeny"
require "vt_combo"

module DBStructureUtilities
  def self.get_mysql_major_version
    ActiveRecord::Base.connection.execute("SELECT VERSION()").first.first.split(".").first.to_i
  end

  def self.write_version_sentinel
    File.write(path_for(".mysql-version"), get_mysql_major_version.to_s)
  end

  def self.dump(db:, output:)
    path = path_for(output)
    config = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, name: db).configuration_hash

    ActiveRecord::Tasks::DatabaseTasks.structure_dump(config, path)

    if db == "mysql1_primary"
      File.open(path, "a") do |f|
        f.puts ActiveRecord::Base.connection.dump_schema_information
        f.print "\n"
      end
    end

    VTCombo.dump_vschema(db)
  end

  def self.cleanup(input:, output: nil, select_tables: nil, reject_tables: nil)
    output ||= input

    in_path = path_for(input)
    out_path = path_for(output)

    contents = File.read(in_path)
    contents = StructureCleaner.remove_blank_lines(contents)
    contents = StructureCleaner.clean_auto_increment(contents)
    contents = StructureCleaner.clean_conditional_statements(contents)
    contents = StructureCleaner.remove_table_definitions(contents, ["_+[^`]*"])
    contents = StructureCleaner.replace_utf8_with_utf8mb3(contents)
    contents = StructureCleaner.remove_unnecessary_column_character_set(contents)

    if select_tables
      contents = StructureCleaner.extract_table_definitions(contents, select_tables)
    end

    reject_tables ||= []
    reject_tables << "ar_internal_metadata"

    contents = StructureCleaner.remove_table_definitions(contents, reject_tables)
    contents = StructureCleaner.clean_partitions_comment(contents)

    File.write(out_path, contents)
  end

  def self.path_for(file_name)
    File.join(Rails.root, "db", file_name)
  end

  def self.schema_up_to_date?(db_config, test_schema: TestSchema.new([]), schema_hash: nil)
    test_schema.schema_up_to_date?(db_config)
  rescue ActiveRecord::NoDatabaseError, RuntimeError # vitess raises RuntimeError when database does not exist
    false
  rescue Errno::ECONNREFUSED => err # vtcombo takes time to start up, so we try to be forgiving
    attempts ||= 1
    puts "Connection to #{db_config[:database]} refused"
    raise err if attempts > 2

    sleep 5
    attempts += 1
    retry
  end

  def self.populate_metadata(structure_paths, db_config)
    schema_hash = Digest::SHA256.hexdigest(structure_paths.map { |x| File.read(x) }.join)
    ActiveRecord::Base.establish_connection(db_config)
    ActiveRecord::Base.connection_pool.internal_metadata.create_table
    ActiveRecord::Base.connection_pool.internal_metadata[:environment] = db_config.env_name
    ActiveRecord::Base.connection_pool.internal_metadata[:schema_hash] = schema_hash
    ActiveRecord::Base.connection_handler.clear_all_connections!(:all)
  end
end

### GitHub db: customizations
namespace :db do
  # Clear check_protected_environments because it loads the env first and
  # the dbs might not exist yet. This is safe because the prod databases
  # are in their own database.yml.
  Rake::Task["db:check_protected_environments"].clear

  namespace :test do
    task load_vschema: "db:load_config" do
      next if GitHub.enterprise?

      vt_config = ActiveRecord::Base.configurations.configs_for(env_name: "test", name: "vt_primary")
      ActiveRecord::Base.configurations.configs_for(env_name: "test").each do |db_config|
        VTCombo.load_vschema_file(db_config, sequence_keyspace_name: vt_config.configuration_hash[:database])
      end
    end

    Rake::Task["db:test:load_schema"].clear
    task load_schema: %w(db:test:purge db:test:load_vschema) do
      should_reconnect = ActiveRecord::Base.connection_pool.active_connection?
      ActiveRecord::Schema.verbose = false
      ActiveRecord::Base.configurations.configs_for(env_name: "test").each do |db_config|
        structure_from_config = db_config.configuration_hash[:structure]

        structure_paths = Array(structure_from_config).map do |structure|
          Rails.root.join("db", structure)
        end

        structure_paths.each do |structure_path|
          if ENV["GITHUB_CI"]
            ActiveRecord::Tasks::MySQLDatabaseTasks.new(db_config).structure_load_spawn(structure_path)
          else
            ActiveRecord::Tasks::DatabaseTasks.structure_load(db_config, structure_path)
          end
        end

        unless structure_paths.empty?
          DBStructureUtilities.populate_metadata(structure_paths, db_config)
        end

        if !GitHub.enterprise? && db_config.name == "vt_primary"
          VTCombo.initialize_sequences(db_config)
        end
      end
    ensure
      if should_reconnect
        ActiveRecord::Base.establish_connection(ActiveRecord::Tasks::DatabaseTasks.env.to_sym)
      end
    end
  end

  # Alias create/drop to *_all version, so we can work with mutiple
  # dbs on database.yml.
  Rake::Task["db:create"].clear
  task :create => ["db:create:all"]
  Rake::Task["db:drop"].clear
  task :drop => ["db:drop:all"]

  Rake::Task["db:migrate"].clear
  task :migrate => :load_config do
    ActiveRecord::Tasks::DatabaseTasks.migrate
    Rake::Task["db:schema:dump"].invoke if ActiveRecord.dump_schema_after_migration
    Rake::Task["db:schema:cache_dump"].invoke
    if Rails.env.development?
      # run the hookshot-go migrations
      sh "#{Rails.root}/script/create-hookshot-cluster --migrate --verbose"
    end
  end

  namespace :migrate do
    Rake::Task["db:migrate:down"].clear
    task down: :load_config do
      raise "VERSION is required - To go down one migration, use db:rollback" if !ENV["VERSION"] || ENV["VERSION"].empty?

      ActiveRecord::Tasks::DatabaseTasks.check_target_version
      migration_context = ActiveRecord::Base.connection_pool.migration_context
      migration_context.run(:down, ActiveRecord::Tasks::DatabaseTasks.target_version)

      Rake::Task["db:schema:dump"].invoke if ActiveRecord.dump_schema_after_migration
      Rake::Task["db:schema:cache_dump"].invoke
      Rake::Task["db:vitess:initialize_sequences"].invoke
    end

    Rake::Task["db:migrate:up"].clear
    task up: :load_config do
      raise "VERSION is required" if !ENV["VERSION"] || ENV["VERSION"].empty?

      ActiveRecord::Tasks::DatabaseTasks.check_target_version
      migration_context = ActiveRecord::Base.connection_pool.migration_context
      migration_context.run(:up, ActiveRecord::Tasks::DatabaseTasks.target_version)

      Rake::Task["db:schema:dump"].invoke if ActiveRecord.dump_schema_after_migration
      Rake::Task["db:schema:cache_dump"].invoke
      Rake::Task["db:vitess:initialize_sequences"].invoke
    end

    task up_multi: :load_config do
      versions_str = ENV["VERSIONS"]
      raise "VERSIONS is required" if versions_str.nil? || versions_str.empty?

      # Validate that VERSIONS is a comma-separated list of integers
      unless versions_str.match?(/\A\d+(,\d+)*\z/)
        raise "VERSIONS must be a comma-separated list of integers"
      end

      # Split the list of versions into an array of integers and sort them
      versions = versions_str.split(",").map(&:to_i).sort

      versions.each do |version|
        ENV["VERSION"] = version.to_s

        ActiveRecord::Tasks::DatabaseTasks.check_target_version
        migration_context = ActiveRecord::Base.connection_pool.migration_context
        migration_context.run(:up, ActiveRecord::Tasks::DatabaseTasks.target_version)
      end

      Rake::Task["db:schema:dump"].invoke if ActiveRecord.dump_schema_after_migration
      Rake::Task["db:schema:cache_dump"].invoke
      Rake::Task["db:vitess:initialize_sequences"].invoke
    end
  end

  Rake::Task["db:rollback"].clear
  task :rollback => :load_config do
    step = ENV["STEP"] ? ENV["STEP"].to_i : 1
    ActiveRecord::Base.connection_pool.migration_context.rollback(step)
    Rake::Task["db:schema:dump"].invoke if ActiveRecord.dump_schema_after_migration
    Rake::Task["db:schema:cache_dump"].invoke
  end

  namespace :structure do
    task :dump => :load_config do
      Rake::Task["db:schema:dump"].invoke
      Rake::Task["db:schema:cache_dump"].invoke
    end

    task :abort_if_pending_migrations => :load_config do
      Rake::Task["db:schema:abort_if_pending_migrations"].invoke
    end

    task :load => :load_config do
      Rake::Task["db:schema:load"].invoke
    end
  end

  namespace :schema do
    include GitHub::DatabaseStructure

    # Extension of db:schema:dump to normalize the output and reduce
    # conflicts for output generated on different machines.
    Rake::Task["db:schema:dump"].clear
    task :dump => :load_config do
      if DBStructureUtilities.get_mysql_major_version < 8
        bold = "\033[1m"
        underline = "\033[4m"
        underline_off = "\033[24m"
        reset = "\033[0m"

        puts "🚨 #{bold}Refusing to dump schema for MySQL 5.7#{reset} 🚨"
        puts ""
        puts "The github/github master branch is now configured to run MySQL 8.0,"
        puts "this means that schema dumps and migrations can no longer be run with MySQL 5.7."
        puts ""
        puts "#{bold}* If you #{underline}are not#{underline_off} trying to create a migration PR you can ignore this message#{reset}"
        puts ""
        puts "#{bold}* If you #{underline}are#{underline_off} trying to create a migration PR, you should follow the instructions in https://github.com/github/mysql8-upgrade/blob/master/dotcom-codespaces-upgrade-support.md#{reset}"
        puts ""

        next
      end

      DBStructureUtilities.write_version_sentinel

      if !GitHub.enterprise?
        # github.com has tables spread across different schemas, here we need to dump
        # all of them in separate files.
        #
        # Once all are dumped, we clean them.
        DBStructureUtilities.dump(db: "abilities_primary", output: "abilities-structure.sql")
        DBStructureUtilities.dump(db: "authnd_primary", output: "authnd-structure.sql")
        DBStructureUtilities.dump(db: "configurations_primary", output: "configurations-structure.sql")
        DBStructureUtilities.dump(db: "mysql1_primary", output: "structure.sql")
        DBStructureUtilities.dump(db: "notifications_primary", output: "mysql2-structure.sql")
        DBStructureUtilities.dump(db: "notifications_deliveries_primary", output: "notifications-deliveries-structure.sql")
        DBStructureUtilities.dump(db: "notifications_entries_primary", output: "notifications-entries-structure.sql")
        DBStructureUtilities.dump(db: "notifications_summaries_primary", output: "notifications-summaries-structure.sql")
        DBStructureUtilities.dump(db: "kv_primary", output: "mysql5-structure.sql")
        DBStructureUtilities.dump(db: "repositories_primary", output: "repositories-structure.sql")
        DBStructureUtilities.dump(db: "repositories_actions_checks_primary", output: "repositories-actions-checks-structure.sql")
        DBStructureUtilities.dump(db: "repositories_pushes_sharded_primary", output: "repositories-pushes-structure.sql")
        DBStructureUtilities.dump(db: "issues_pull_requests_primary", output: "issues-pull-requests-structure.sql")
        DBStructureUtilities.dump(db: "spokes_write", output: "spokes-structure.sql")
        DBStructureUtilities.dump(db: "stratocaster_primary", output: "stratocaster-structure.sql")
        DBStructureUtilities.dump(db: "collab_primary", output: "collab-structure.sql")
        DBStructureUtilities.dump(db: "copilot_primary", output: "copilot-structure.sql")
        DBStructureUtilities.dump(db: "ballast_primary", output: "ballast-structure.sql")
        DBStructureUtilities.dump(db: "migrations_primary", output: "migrations-structure.sql")
        DBStructureUtilities.dump(db: "lodge_primary", output: "lodge-structure.sql")
        DBStructureUtilities.dump(db: "memex_primary", output: "memex-structure.sql")
        DBStructureUtilities.dump(db: "gitbackups_primary", output: "gitbackups-structure.sql")
        DBStructureUtilities.dump(db: "notify_primary", output: "notify-structure.sql")
        DBStructureUtilities.dump(db: "iam_primary", output: "iam-structure.sql")
        DBStructureUtilities.dump(db: "billing_primary", output: "billing-structure.sql")
        DBStructureUtilities.dump(db: "permissions_primary", output: "permissions-structure.sql")
        DBStructureUtilities.dump(db: "token_scanning_service_primary", output: "token-scanning-service-structure.sql")
        DBStructureUtilities.dump(db: "vt_primary", output: "vt-structure.sql")
        DBStructureUtilities.dump(db: "security_overview_analytics_primary", output: "security-overview-analytics-structure.sql")
        DBStructureUtilities.dump(db: "commits_primary", output: "commits-structure.sql")
        DBStructureUtilities.dump(db: "signup_flow_primary", output: "signup-flow-structure.sql")

        DBStructureUtilities.cleanup(input: "abilities-structure.sql")
        DBStructureUtilities.cleanup(input: "authnd-structure.sql")
        DBStructureUtilities.cleanup(input: "configurations-structure.sql")
        DBStructureUtilities.cleanup(input: "mysql2-structure.sql")
        DBStructureUtilities.cleanup(input: "notifications-deliveries-structure.sql")
        DBStructureUtilities.cleanup(input: "notifications-entries-structure.sql")
        DBStructureUtilities.cleanup(input: "notifications-summaries-structure.sql")
        DBStructureUtilities.cleanup(input: "mysql5-structure.sql")
        DBStructureUtilities.cleanup(input: "migrations-structure.sql")
        DBStructureUtilities.cleanup(input: "lodge-structure.sql")
        DBStructureUtilities.cleanup(input: "collab-structure.sql")
        DBStructureUtilities.cleanup(input: "copilot-structure.sql")
        DBStructureUtilities.cleanup(input: "memex-structure.sql")
        DBStructureUtilities.cleanup(input: "repositories-structure.sql")
        DBStructureUtilities.cleanup(input: "repositories-actions-checks-structure.sql")
        DBStructureUtilities.cleanup(input: "repositories-pushes-structure.sql")
        DBStructureUtilities.cleanup(input: "spokes-structure.sql")
        DBStructureUtilities.cleanup(input: "stratocaster-structure.sql")
        DBStructureUtilities.cleanup(input: "vt-structure.sql")

        DBStructureUtilities.cleanup(input: "issues-pull-requests-structure.sql")
        DBStructureUtilities.cleanup(input: "ballast-structure.sql", output: "ballast-structure.sql", select_tables: BALLAST_TABLES)
        DBStructureUtilities.cleanup(input: "repositories-structure.sql", output: "repositories-structure.sql", select_tables: REPOSITORIES_TABLES)

        DBStructureUtilities.cleanup(input: "gitbackups-structure.sql")
        DBStructureUtilities.cleanup(input: "notify-structure.sql")
        DBStructureUtilities.cleanup(input: "migrations-structure.sql")
        DBStructureUtilities.cleanup(input: "iam-structure.sql")
        DBStructureUtilities.cleanup(input: "billing-structure.sql")
        DBStructureUtilities.cleanup(input: "permissions-structure.sql")
        DBStructureUtilities.cleanup(input: "token-scanning-service-structure.sql")
        DBStructureUtilities.cleanup(input: "security-overview-analytics-structure.sql")
        DBStructureUtilities.cleanup(input: "commits-structure.sql")
        DBStructureUtilities.cleanup(input: "signup-flow-structure.sql")

        if Rails.env.production?
          DBStructureUtilities.cleanup(input: "structure.sql")
        else
          DBStructureUtilities.cleanup(input: "structure.sql", output: "structure.sql", reject_tables: OUTSIDE_MAIN_CLUSTER_TABLES - TABLES_BEING_MIGRATED)
        end
      else
        DBStructureUtilities.dump(db: "mysql1_primary", output: "structure.sql")
        DBStructureUtilities.cleanup(input: "structure.sql", output: "configurations-structure.sql", select_tables: CONFIGURATIONS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "abilities-structure.sql", select_tables: IAM_ABILITIES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "authnd-structure.sql", select_tables: AUTHND_PRODUCTION_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "mysql2-structure.sql", select_tables: MYSQL2_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "notifications-deliveries-structure.sql", select_tables: NOTIFICATIONS_DELIVERIES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "notifications-entries-structure.sql", select_tables: NOTIFICATIONS_ENTRIES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "notifications-summaries-structure.sql", select_tables: NOTIFICATIONS_SUMMARIES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "mysql5-structure.sql", select_tables: MYSQL5_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "repositories-structure.sql", select_tables: REPOSITORIES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "repositories-pushes-structure.sql", select_tables: REPOSITORIES_PUSHES_SHARDED_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "spokes-structure.sql", select_tables: SPOKES_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "stratocaster-structure.sql", select_tables: STRATOCASTER_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "gitbackups-structure.sql", select_tables: GITBACKUPS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "ballast-structure.sql", select_tables: BALLAST_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "repositories-actions-checks-structure.sql", select_tables: REPOSITORIES_ACTIONS_CHECKS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "issues-pull-requests-structure.sql", select_tables: ISSUES_PULL_REQUESTS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "collab-structure.sql", select_tables: COLLAB_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "copilot-structure.sql", select_tables: COPILOT_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "memex-structure.sql", select_tables: MEMEX_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "migrations-structure.sql", select_tables: OCTOSHIFT_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "notify-structure.sql", select_tables: NOTIFY_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "iam-structure.sql", select_tables: IAM_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "billing-structure.sql", select_tables: BILLING_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "permissions-structure.sql", select_tables: PERMISSIONS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "security-overview-analytics-structure.sql", select_tables: SECURITY_OVERVIEW_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "token-scanning-service-structure.sql", select_tables: TOKEN_SCANNING_SERVICE_PROD_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "vt-structure.sql", select_tables: VT_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "lodge-structure.sql", select_tables: LODGE_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "commits-structure.sql", select_tables: COMMITS_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "signup-flow-structure.sql", select_tables: SIGNUP_FLOW_TABLES)
        DBStructureUtilities.cleanup(input: "structure.sql", output: "structure.sql", reject_tables: OUTSIDE_MAIN_CLUSTER_TABLES - TABLES_BEING_MIGRATED)
      end
    end

    # Dump the schema cache. Called from `migrate`, `up`, `down`,
    # `rollback`, and `structure:dump`.
    task :cache_dump => :load_config do
      if GitHub.enterprise?
        # The filepath is hard coded for enterprise instances until we can rewrite the
        # ENTERPRISE_SKIP_SCHEMA_CACHE behavior. We need to ensure that we always
        # dump the cache but only load it when ENTERPRISE_SKIP_SCHEMA_CACHE is not set.
        ActiveRecord::Base.connection.schema_cache.dump_to("db/schema/enterprise.dump")
      else
        GitHub.schema_cached_models.each do |model|
          filename = model.connection.pool.db_config.schema_cache_path
          model.connection.schema_cache.dump_to(filename)
        end
      end
    end

    # replace db:abort_if_pending_migrations
    Rake::Task["db:abort_if_pending_migrations"].clear
    task :abort_if_pending_migrations => :load_config do
      ActiveRecord::Base.establish_connection
      pending_migrations = ActiveRecord::Base.connection_pool.migration_context.open.pending_migrations

      if pending_migrations.any?
        puts "You have #{pending_migrations.size} pending #{pending_migrations.size > 1 ? 'migrations:' : 'migration:'}"
        pending_migrations.each do |pending_migration|
          puts "  %4d %s" % [pending_migration.version, pending_migration.name]
        end
        abort %{Run `rails db:migrate` to update your database then try again.}
      end
    end

    # replace db:schema:load to load all structure files
    Rake::Task["db:schema:load"].clear
    task :load => [:load_config, "db:vitess:load_vschema"] do
      ActiveRecord::Base.configurations.configs_for(env_name: Rails.env).each do |db_config|
        structure_from_config = db_config.configuration_hash[:structure]

        structure_paths = Array(structure_from_config).map do |structure|
          structure_path = Rails.root.join("db", structure)
        end

        structure_paths.each do |structure_path|
          ActiveRecord::Tasks::DatabaseTasks.structure_load(db_config, structure_path)
        end

        unless structure_paths.empty?
          DBStructureUtilities.populate_metadata(structure_paths, db_config)
        end
      end

      Rake::Task["db:vitess:initialize_sequences"].invoke
      Rake::Task["db:schema:cache_dump"].invoke

      ActiveRecord::Base.establish_connection(:mysql1_primary)
    end

    namespace :initial do
      task :dump => "db:schema:dump" do
        dest_root = Rails.root.join("db", "initial_structure")
        FileUtils.mkdir_p(dest_root)
        ActiveRecord::Base.configurations.configs_for(env_name: "development").each do |db_config|
          structure_from_config = db_config.configuration_hash[:structure]

          Array(structure_from_config).each do |structure|
            structure_path = Rails.root.join("db", structure)
            dest_path = dest_root.join(structure)
            FileUtils.cp(structure_path, dest_path)
          end
        end
      end

      task :load => :load_config do
        dest_root = Rails.root.join("db", "initial_structure")
        ActiveRecord::Base.configurations.configs_for(env_name: "development").each do |db_config|
          config = db_config.configuration_hash
          structure_from_config = db_config.configuration_hash[:structure]

          Array(structure_from_config).each do |structure|
            structure_path = Rails.root.join("db", structure)
            dest_path = dest_root.join(structure)
            FileUtils.cp(dest_path, structure_path)
          end

          vschema = db_config.configuration_hash[:vschema_path]
          if vschema
            vschema_path = Rails.root.join(vschema)
            initial_vschema_path = vschema_path.to_s.gsub("/db/vschema/", "/db/initial_structure/vschema/")
            FileUtils.rm(vschema_path)
            FileUtils.cp(initial_vschema_path, vschema_path) if File.exist?(initial_vschema_path)
          end

        end
        Rake::Task["db:schema:load"].invoke
      end
    end
  end

  namespace :test do
    # replace db:test:load_structure to load all structure files
    task :load_structure => "db:load_config" do
      ActiveSupport.deprecator.warn(<<-MSG.squish)
          Using `bin/rails db:test:load_structure` is deprecated and will be removed in Rails 6.2.
          Configure the format using `config.active_record.schema_format = :sql` to use `structure.sql` and run `bin/rails db:test:load_schema` instead.
      MSG

      Rake::Task["db:test:load_schema"].invoke
    end

    task :load_initial_structure => "db:load_config" do
      db_configs = ActiveRecord::Base.configurations.configs_for(env_name: "test")

      dest_root = Rails.root.join("db", "initial_structure")

      db_configs.each do |db_config|
        if db_config.configuration_hash[:vschema_path]
          source_vschema_path = Rails.root.join("db", "initial_structure", "vschema", File.basename(db_config.configuration_hash[:vschema_path]))
          target_vschema_path = Rails.root.join(db_config.configuration_hash[:vschema_path])
          FileUtils.cp(source_vschema_path, target_vschema_path)
        end

        structure_from_config = db_config.configuration_hash[:structure]

        Array(structure_from_config).each do |structure|
          structure_path = Rails.root.join("db", structure)
          dest_path = dest_root.join(structure)
          FileUtils.cp(dest_path, structure_path)
        end
      end

      Rake::Task["db:test:load_schema"].invoke
    end

    task :soft_reset => "db:load_config" do
      ENV["TEST_QUEUE_WORKERS"] = "0"
      Rake::Task["db:test:ci:reset"].invoke
    end

    namespace :ci do
      task :reset => "db:load_config" do
        tasks = ActiveRecord::Tasks::DatabaseTasks
        concurrency = Integer(ENV["TEST_QUEUE_WORKERS"] || raise("Please provide TEST_QUEUE_WORKERS ENV"))
        test_schema = TestSchema.new(ActiveRecord::Base.configurations.configs_for(env_name: "test").map(&:configuration_hash))
        schema_update_statuses = { 0 => {}, 1 => {} }

        ActiveRecord::Base.configurations.configs_for(env_name: "test").each do |db_config|
          structure_paths = Array(db_config.configuration_hash[:structure]).map { |structure| Rails.root.join("db", structure) }
          # The ci:reset task is broken into two loops to give Vitess enough time to apply the vschema before loading
          # the structure and therefore avoiding a race condition where the new vschema was stored in Vitess but the new
          # vschema changes have not yet been applied to all components of Vitess.
          0.upto(concurrency) do |i| # zero updates the default test databases, 1 through concurrency updates the number-suffixed databases
            new_hash = db_config.configuration_hash.merge(database: "#{db_config.configuration_hash[:database]}#{i if i.positive?}")
            new_config = ActiveRecord::DatabaseConfigurations::HashConfig.new(db_config.env_name, db_config.name, new_hash)
            schema_up_to_date = false

            # Parallel worker dbs should all be of the same structure. Use the state of the first to inform action on the rest.
            if i < 2
              schema_up_to_date = DBStructureUtilities.schema_up_to_date?(new_config.configuration_hash, test_schema: test_schema)
              puts "#{new_config.database}: #{schema_up_to_date ? "up to date" : "out of date"}"
              schema_update_statuses[i][db_config.name] = schema_up_to_date
            end

            next if schema_update_statuses[[i, 1].min][db_config.name]

            tasks.drop(new_config)
            tasks.create(new_config)

            if db_config.configuration_hash[:vschema_path]
              VTCombo.load_vschema_file(new_config, sequence_keyspace_name: "github_test_vt#{i if i.positive?}")
            end
          end

          0.upto(concurrency) do |i|
            new_hash = db_config.configuration_hash.merge(database: "#{db_config.configuration_hash[:database]}#{i if i.positive?}")
            new_config = ActiveRecord::DatabaseConfigurations::HashConfig.new(db_config.env_name, db_config.name, new_hash)

            unless schema_update_statuses[[1, i].min][db_config.name]
              structure_paths.each do |structure_path|
                ActiveRecord::Tasks::MySQLDatabaseTasks.new(new_config).structure_load_spawn(structure_path)
              end

              if structure_paths.present? && i < 2
                DBStructureUtilities.populate_metadata(structure_paths, new_config)
              end
            end

            if new_config.name == "vt_primary"
              VTCombo.initialize_sequences(new_config)
            end
          end
        end
      end
    end
  end

  namespace :vitess do
    task :load_vschema => :load_config do
      next if GitHub.enterprise?

      vt_config = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, name: "vt_primary")
      ActiveRecord::Base.configurations.configs_for(env_name: Rails.env).each do |db_config|
        VTCombo.load_vschema_file(db_config, sequence_keyspace_name: vt_config.configuration_hash[:database])
      end
    end

    task :initialize_sequences => :load_config do
      next if GitHub.enterprise?

      VTCombo.initialize_sequences(ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, name: "vt_primary"))
    end
  end
end
