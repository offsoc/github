# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # UserNotice dynamically creates a constant for each notice defined in config/notices.yml.
    # As Sorbet knows nothing about dynamic constants, it is necessary to define them in
    # RBI files. This compiler will create constants for each notice defined in the config file.
    #
    # For example, for the following notice.yml:
    #
    # ~~~yml
    # notices:
    # - name: spoken_language
    #   effective_date: "2019-12-09"
    #   hide_from_new_user: false
    #   catalog_service: "github/marketing_engineering"

    # - name: scheduled_reminders_onboarding_notice
    #   effective_date: "2019-11-05"
    #   hide_from_new_user: false
    #   catalog_service: "github/scheduled_reminders"
    # ~~~
    #
    # The following RBI files will be generated:
    #
    # ~~~rb
    # class UserNotice
    #   SCHEDULED_REMINDERS_ONBOARDING_NOTICE = scheduled_reminders_onboarding_notice
    #   SPOKEN_LANGUAGE_NOTICE = spoken_language
    # end
    # ~~~

    class UserNotice < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::UserNotice) } }

      sig { override.returns(T::Enumerable[T.class_of(::UserNotice)]) }
      def self.gather_constants
        [::UserNotice]
      end

      sig { override.void }
      def decorate
        root.create_path(::UserNotice) do |klass|
          ::UserNotice.all.each do |notice|
            klass.create_constant(notice.constant_name, value: notice.name)
          end
        end

      end
    end
  end
end
