# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # Eap contains methods related detecting if EAP services are enabled/disabled
    module Eap
      # True if the given Early Access Program (EAP) service has been enabled for this appliance
      def eap_enabled?(_service_name)
        false
      end
    end
  end
end
