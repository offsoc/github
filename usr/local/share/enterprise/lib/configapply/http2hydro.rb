module Enterprise
    module ConfigApply
      module Http2Hydro
        def http2hydro_enabled?
          raw_config.dig("app", "enterprise-manage","audit-forward") != "disabled"
        end
      end
    end
  end
  