# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Packages
      def packages_enabled?
        !!raw_config.dig("app", "packages", "enabled")
      end

      def packages_debug?
        !!raw_config.dig("app", "packages", "debug")
      end

      def packages_docker_enabled_state
        ecosystem_enabled("docker")
      end

      def packages_container_enabled_state
        ecosystem_enabled("container")
      end

      def packages_maven_enabled_state
        ecosystem_enabled("maven")
      end

      def packages_npm_enabled_state
        ecosystem_enabled("npm")
      end

      def packages_npm_upstreaming_enabled_state
        ecosystem_enabled("npm-upstreaming")
      end

      def packages_rubygems_enabled_state
        ecosystem_enabled("rubygems")
      end

      def packages_nuget_enabled_state
        ecosystem_enabled("nuget")
      end

      def packages_container_blob_redirection_enabled_state
        return false if raw_config.dig("app", "packages", "container-blob-redirection-enabled").nil?
        raw_config.dig("app", "packages", "container-blob-redirection-enabled")
      end

      def ecosystem_enabled(ecosystem)
        app    = raw_config.dig("app", "packages", "#{ecosystem}-enabled")
        secret = secret_value("packages", "#{ecosystem}-enabled")

        if "#{app}" == "" && "#{secret}" == ""
          "true"
        else
          app || secret || "false"
        end
      end

      def docker_disabled?
        !packages_docker_enabled_state
      end

      def container_disabled?
        state = raw_config.dig("app", "packages", "container-enabled")

        if "#{state}" == "false"
          true
        else
          false
        end
      end

      def container_readonly?
        state = raw_config.dig("app", "packages", "container-enabled")

        if "#{state}" == "readonly"
          true
        else
          false
        end
      end
    end
  end
end
