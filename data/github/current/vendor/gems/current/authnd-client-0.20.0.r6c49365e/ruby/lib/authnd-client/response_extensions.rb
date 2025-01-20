# frozen_string_literal: true

module Authnd
  module Proto
    class IssueTokenResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RegisterDeviceResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RegisterDeviceKeyResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RevokeDeviceKeyResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RevokeDeviceKeysResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class UpdateDeviceResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RevokeDeviceAuthResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class RequestDeviceAuthResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class GetDeviceAuthStatusResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class FindActiveDeviceAuthResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class CompleteDeviceAuthResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class FindDeviceKeyRegistrationsResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end

    class FindDeviceKeyRegistrationResponse
      def success?
        result == :RESULT_SUCCESS
      end
    end
  end
end
