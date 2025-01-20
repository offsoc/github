# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # ConfigFiles contains methods for reading `github.conf` and friends
    # via the GheConfig module from Enterprise Manage, which in turn shells to `ghe-config`
    module ConfigFiles
      def reset_raw_config
        @raw_config = GheConfig.new.load_config
      end

      def raw_config
        return @raw_config if defined?(@raw_config)

        @raw_config = GheConfig.new.load_config
      end

      def cluster_config
        return @cluster_config if defined?(@cluster_config)

        @cluster_config = File.exist?("/data/user/common/cluster.conf") ? GheConfig.new.load_config("/data/user/common/cluster.conf") : {}
      end

      def secrets_config
        return @secrets_config if defined?(@secrets_config)

        @secrets_config = File.exist?("/data/user/common/secrets.conf") ? GheConfig.new.load_config("/data/user/common/secrets.conf")["secrets"] : {}
      end

      def secret_value(*args)
        args.reduce(secrets_config) { |m, k| m && m[k] }
      end

      # Returns cluster.conf values,
      # e.g. `cluster.node1.foo` is `cluster_value("node1", "foo")`
      def cluster_value(*args)
        args.unshift("cluster").reduce(cluster_config) { |m, k| m && m[k] }
      end

      # Wrap `cluster_value` to specifically test if the value is `true`,
      # to avoid the very unusual Ruby style `var == true`  elsewhere.
      # Needed because when reading the config, GheConfig has a special case to cast the
      # strings "true" and "false" to Ruby bools.  An absent key would be nil
      # and therefore `false`, and any other value would by truthy.
      def cluster_value_true?(*args)
        cluster_value(*args) == true
      end
    end
  end
end
