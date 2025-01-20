# frozen_string_literal: true

namespace :routes do
  desc "Get the ownership info for the rails routes in CSV format"
  task :ownership => [:environment] do

    csv = CSV.new($stdout)
    csv << %w(service_mapping endpoint prefix verb path)

    Rails.application.routes.routes.each do |route|
      wrapped = ActionDispatch::Routing::RouteWrapper.new(route)

      # Some routes just redirect elsewhere. Redirects do not have owners.
      next if wrapped.endpoint.start_with?("redirect(")

      # In development, rails adds its own controllers. We can skip these.
      next if wrapped.controller.start_with?("rails/")

      begin
        controller_class = "#{wrapped.controller.camelize}Controller".constantize

        service_mapping = controller_class.service_mapping(wrapped.action)
      rescue NameError
        $stderr.puts "no controller! #{wrapped.endpoint}"
      end

      csv << [service_mapping, wrapped.endpoint, wrapped.name, wrapped.verb, wrapped.path]
    end
  end
end
