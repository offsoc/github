# frozen_string_literal: true
require_relative "./connection_helpers"

module AccessRelayHelpers
  def get_schema(*auth_args)
    Class.new(ConnectionHelpers::Schema).redefine do
      authorization(*auth_args)
    end
  end
end
