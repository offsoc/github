module Zuorest::Contact
  def create_contact(body, headers = {})
    post("/v1/object/contact", body:, headers:)
  end

  def get_contact(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/contact/#{id}", headers:)
  end
end
