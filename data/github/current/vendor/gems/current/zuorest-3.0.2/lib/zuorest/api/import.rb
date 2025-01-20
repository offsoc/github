# frozen_string_literal: true

require "zuorest/utils"

module Zuorest::Import

  def get_import(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/import/#{id}", headers:)
  end

end
