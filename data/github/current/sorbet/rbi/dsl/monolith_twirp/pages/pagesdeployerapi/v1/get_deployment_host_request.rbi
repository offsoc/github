# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Pages::Pagesdeployerapi::V1::GetDeploymentHostRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Pages::Pagesdeployerapi::V1::GetDeploymentHostRequest`.

class MonolithTwirp::Pages::Pagesdeployerapi::V1::GetDeploymentHostRequest
  sig { params(deployment_id: T.nilable(String), page_id: T.nilable(String)).void }
  def initialize(deployment_id: nil, page_id: nil); end

  sig { void }
  def clear_deployment_id; end

  sig { void }
  def clear_page_id; end

  sig { returns(String) }
  def deployment_id; end

  sig { params(value: String).void }
  def deployment_id=(value); end

  sig { returns(String) }
  def page_id; end

  sig { params(value: String).void }
  def page_id=(value); end
end
