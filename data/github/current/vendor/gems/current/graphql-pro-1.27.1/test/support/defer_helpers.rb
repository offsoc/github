# frozen_string_literal: true

module DeferHelpers
  def get_patches(res, h_method: :to_h)
    res.context[:defer]&.map(&h_method)
  end

  # Assert that content length matches the specified header
  def validate_multipart(str)
    parts = str.split("\r\n")
    case parts.size
    when 7
      _preamble, _delimiter, _content_type, content_length, _body_break, body_text, _tail_delimiter = parts
    when 6
      _preamble, _content_type, content_length, _body_break, body_text, _terminal_delimiter = parts
    else
      raise "Unexpected #{parts.size} parts: #{parts.inspect}"
    end

    content_length_val = content_length.split(": ").last.to_i
    body_length_val = body_text.bytesize
    assert_equal content_length_val, body_length_val, "The content length header is right (#{content_length_val}: #{body_text.inspect})"
  end

  class DummyResponse
    def patches
      @patches ||= []
    end

    def stream; self; end

    def write(patch)
      patches << patch
    end

    def headers
      @headers ||= {}
    end
  end

  def self.create_streaming_sinatra_app(schema)
    Class.new(Sinatra::Base) do
      helpers Sinatra::Streaming

      post "/graphql", provides: "text/event-stream" do
        context = {}
        res = schema.execute(params[:query], variables: params[:variables], context: context)
        stream do |out|
          res.context[:defer].each do |deferral|
            patch = "#{JSON.dump(deferral.to_h)}\n\n"
            out.write(patch)
          end
        end
      end
    end
  end
end
