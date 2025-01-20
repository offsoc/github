# frozen_string_literal: true
class GraphqlController < ApplicationController
  skip_before_action :verify_authenticity_token

  def execute
    res = DummyRepository.execute(operation_name: params[:operation_name])
    render json: res
  end
end
