module Enterprise
  module ConfigApply
    module Telegraf
      def telegraf_enabled?
        !!raw_config.dig("app", "telegraf", "enabled")
      end
    end
  end
end
