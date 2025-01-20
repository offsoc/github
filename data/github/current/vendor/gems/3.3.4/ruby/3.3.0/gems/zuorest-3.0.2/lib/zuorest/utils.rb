require "zuorest/argument_error"

module Utils
  def self.is_alpha?(string)
    !!string.match(/\A[[:alnum:]]+\z/)
  end

  def self.is_alpha_and_hyphen?(string)
    !!string.match(/\A[[:alnum:]]-?[[:alnum:]]+\z/)
  end

  def self.required_argument!(name, value)
    raise Zuorest::ArgumentError, "#{name} can't be empty" unless value.present?
  end

  def self.validate_id(id)
    messages = []
    messages << "is not alphanumric" if !self.is_alpha?(id) && id.present?
    messages << "size is more than 32 characters" if id.to_s.size > 32
    messages << "id can not be empty" unless id.present?
    raise Zuorest::ArgumentError.new("id": messages) if messages.size != 0
  end

  def self.validate_key(key)
    messages = []
    messages << "must contain alphanumeric and/or hyphen only" if !self.is_alpha_and_hyphen?(key) && key.present?
    messages << "size is more than 32 characters" if key.to_s.size > 32
    messages << "id can not be empty" unless key.present?
    raise Zuorest::ArgumentError.new("key": messages) if messages.size != 0
  end
end
