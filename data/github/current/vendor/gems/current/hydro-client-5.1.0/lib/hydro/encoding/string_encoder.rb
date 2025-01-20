module Hydro
  class StringEncoder
    def encode(message, **args)
      message.nil? ? nil : message.to_s
    end
  end
end
