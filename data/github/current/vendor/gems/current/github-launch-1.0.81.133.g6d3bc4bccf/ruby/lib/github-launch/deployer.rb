require_relative "../../proto/twirp"
require_relative "client"

module GitHub
  module Launch
    class Deployer
      def initialize(opts = {})
        @stub = GitHub::Launch::Client.make_client(GitHub::Launch::Services::Deploy::LaunchDeploymentService, opts)
      end

      def deploy(opts = {})
        req = GitHub::Launch::Services::Deploy::DeployRequest.new(opts)
        @stub.deploy(req)
      end
    end
  end
end
