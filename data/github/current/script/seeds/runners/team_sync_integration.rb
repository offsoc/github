# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class TeamSyncIntegration < Seeds::Runner
      def self.help
        <<~HELP
        Create Team Sync Integration
        HELP
      end

      def self.run(options = {})
        Seeds::Objects::Integration.create_team_sync_integration(id: 2345).tap do |integration|
          return integration if IntegrationInstallTrigger.where(integration: integration, install_type: "team_sync_enabled").present?

          Seeds::Objects::IntegrationInstallTrigger.create(integration: integration, install_type: "team_sync_enabled")

          create_integration_key(integration: integration)
        end
      end

      def self.staging_lab_group_syncer_private_key
        <<~PEM
          -----BEGIN RSA PRIVATE KEY-----
          MIIEpQIBAAKCAQEAvPdXflC+GUQF+ZvxSWHUREd6TC7ySGDHdyhpshxFhxZmVqhD
          LBKKK/2j5+bkuBvgBhb1pf0rUwFerMXkCj7oBGvJC/dtt7KJcYqx5YDAb28DmHhZ
          3DTPb+pAzVHI/JGzEh7lauJeORvjsdtQeO19TRioO1sLSCVw/fobWzkCEnk7X0aV
          N3t7bFp3Saaz+Lqsw35gZ16JBoaypZJfDlGg4KkwbMg5kGwueRukB/j8G7o8kH2I
          aedQBM28o/kcpfe4fuE7f1IGas3Yc1O4UZCmqqls620LXfb6VhG5B7lMakV0uDDv
          YwQHYwKQLH3NhUzpsX+cE7I/OEHbsQ9n2SgvZQIDAQABAoIBAQCvIcGaFTUJ74xm
          GUwXya5UFbbX0o7D28YhvnevFhquJ2lzmQCgYRJj0PBOpiSGKXeHzVGfpDK5/EQF
          dmZxxHl+V3L+PzQVk0dkzrkvThOLc2Tus2P8/YjfXUjvwYO36UUAX1gapm/TF/EA
          TpWXbeu6P0bzs96R3/mHuXwPIJe2C8GTvVB3qUnr2QoA58YqJLN+qyP3FQavPcSY
          3ek/I8M5lt/JKP4P46hCZl4C1u4QhklPKRZLI7QzennJPB1zRraFsGR26auhLwSG
          /a37nu1iKeJB6/Fv1ZkdaRgz9nqb6vficl2WhT48iukNJ4PNohkguPvc7zynECI3
          TKbFNxPBAoGBAPUJgfzD4JcnHquUxriGMZzkAwllPQSPNuR/6LT3u3pNGhfb1soK
          6fZ3Z4X7WXVxVG1SJZGQJViCIStYLWJeBE1nxclkPekSIlp6in2ypeQi+E25aS3l
          ayoFfJtiJ67Y1o0JHsPCffR1LEH/kVC6+EKsHesqc0eg64RB4snz8cYVAoGBAMVr
          onJawYE7R0tRISVweZZCReGn7UFmVkaNM0V+lNNiU3SiFeAeg43hzb3Jo2dtm1eD
          WrXamtgTdwWu/Hw6006UeKM01Zlez/FHb8zo0JCuh5vk2KdovrC0PmLeoScj5uZh
          OByK/K6wwIeJvAjp2VnMjbhaztKcES9GNi4E++gRAoGBAKrxbxV/MPdB+0uIBvpD
          4+inyNaNIfxETO8rrJRTHx87GrD6VOWup3mh4z69ErOz1EpPvJXIEcWlQq6SXVb6
          b9XwRzMwE2C9nemxA1ydfM2i98aBSrcSDajLGxrrZvO7ojHR4vx+epBIDhAc0quX
          RAp/OIAOpU2bHbKupCBvZoPhAoGBAJxs5JJnhtu29I6hAfqAXFbKvERIop0nUUUl
          rHJsEdBMIIRRybODegl52WN/2ZGiL2vwEHf3dqmvAqfmNvjYQ4YH7m6i9nxHu8wa
          JmPeNSPuplTHx0Meo7mvl58Pd/FjaRkx/xvepMhmFKdQY0VMxYN5qPFiQm5uas9i
          epuMJ22BAoGAeAwZ3KGq+PKOSHaM/nlmieNal0erxfcsJ3S3zlhAYN5MVjVz60c1
          XM1l2d3V6nCXI5Q1WzqT21q3gAT5/oROUuln56SOzAYnMEQWRTRV2w5lPVPOfQ+i
          NMhmqbst35eBA3hmE4ShtUETDR8BDUb+Up38O2fBRPqWfPahWS2/Ors=
          -----END RSA PRIVATE KEY-----
        PEM
      end

      def self.create_integration_key(integration:)
        integration_key = IntegrationKey.where(integration: integration)
        return integration_key if integration_key.present?

        IntegrationKey.new(integration: integration,
                           creator: integration.owner,
                           skip_generate_key: true).tap do |integration_key|
          private_key = OpenSSL::PKey::RSA.new(staging_lab_group_syncer_private_key)
          integration_key.private_key = private_key
          integration_key.public_pem = private_key.public_key.to_pem
          integration_key.save!
        end
      end
    end
  end
end
