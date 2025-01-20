require "json"
require "net/http"

module GitHub
  module Launch
    class Client
      DEFAULT_TIMEOUT = 1 # second

      def self.make_client(ns, proto: :grpc, server:, ca_file: nil, timeout: DEFAULT_TIMEOUT)
        if proto == :grpc
          if ca_file.nil?
            raise ArgumentError, "you must provide the 'ca_file' argument"
          end
          creds =
          if ca_file == :insecure
            :this_channel_is_insecure
          else
            certs = File.read(ca_file)
            GRPC::Core::ChannelCredentials.new(certs)
          end

          ns::Stub.new(server, creds, timeout: timeout)
        else
          new(service: ns::Service, proto: proto, server: server, timeout: timeout)
        end
      end

      # Encapsulates a GRPC method call over HTTP.
      def initialize(service:, proto:, server:, timeout:)
        @service = service
        @proto = proto
        @server = server
        @timeout = timeout
      end

      attr_reader :service, :proto, :server, :timeout

      def method_missing(name, *args)
        if args.size == 1 && rpc = lookup_rpc(name)
          call(rpc, name, args.first)
        else
          super
        end
      end

      def respond_to_missing?(name)
        return true if args.size == 1 && rpc = lookup_rpc(name)

        super
      end

      private

      def call(rpc, name, req)
        url = URI("#{proto}://#{server}/_grpcshim/#{rpc.name}")
        result = Net::HTTP.post url, encode(req),
          "Content-Type" => "application/vnd.github.protobuf"
        result.value # raises an error if the response isn't a 200
        decode(rpc, result.body)
      end

      def encode(obj)
        [obj.to_proto].pack("m")
      end

      def decode(rpc, data)
        rpc.output.decode(data.unpack("m")[0])
      end

      def lookup_rpc(name)
        @rpcs ||= Hash[service.rpc_descs.map { |name, desc| [GRPC::GenericService.underscore(name.to_s), desc] }]
        @rpcs.fetch(name.to_s)
      end
    end
  end
end
