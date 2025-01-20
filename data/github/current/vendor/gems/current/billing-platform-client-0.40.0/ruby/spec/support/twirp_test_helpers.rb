module TwirpTestHelpers
  require 'google/protobuf'

  def stub_twirp_rpc(base_url, service, rpc)
    url = [base_url, service, rpc].join("/")
    stub_request(:post, url)
  end

  def twirp_response(schema, **fields)
    response_class = ::Google::Protobuf::DescriptorPool.generated_pool.lookup(schema).msgclass
    response = response_class.new(**fields)

    {
      body: response.to_proto,
      status: 200,
      headers: { "Content-Type" => "application/protobuf" },
    }
  end

  def twirp_request(schema, **fields)
    request_class = ::Google::Protobuf::DescriptorPool.generated_pool.lookup(schema).msgclass
    request = request_class.new(**fields)

    {
      body: request.to_proto,
      headers: { "Content-Type" => "application/protobuf" },
    }
  end
end
