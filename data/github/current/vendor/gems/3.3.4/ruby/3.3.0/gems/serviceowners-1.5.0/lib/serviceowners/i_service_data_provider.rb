# typed: strict
# frozen_string_literal: true

module Serviceowners
  # Data provider to allow service instances access to global data.
  module IServiceDataProvider
    extend T::Helpers
    extend T::Sig

    interface!

    sig { abstract.params(org_name: StringSym).returns(String) }
    def exec_for(org_name); end

    sig { abstract.params(team_name: StringSym).returns(T.nilable(Team)) }
    def team_for(team_name); end

    sig { abstract.params(package_name: String).returns(T.nilable(Service)) }
    def service_for_package(package_name); end
  end
end
