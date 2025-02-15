# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SecurityAdvisoryUpdate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SecurityAdvisoryUpdate`.

class Hydro::Schemas::Github::V1::SecurityAdvisoryUpdate
  sig { params(security_advisory: T.nilable(Hydro::Schemas::Github::V1::Entities::SecurityAdvisory)).void }
  def initialize(security_advisory: nil); end

  sig { void }
  def clear_security_advisory; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SecurityAdvisory)) }
  def security_advisory; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SecurityAdvisory)).void }
  def security_advisory=(value); end
end
