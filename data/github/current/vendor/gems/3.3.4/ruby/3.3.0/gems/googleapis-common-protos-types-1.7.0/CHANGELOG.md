# Release History

### 1.7.0 (2023-07-16)

#### Features

* Support for a few additional client library organizations ([#141](https://github.com/googleapis/common-protos-ruby/issues/141)) 

### 1.6.0 (2023-04-24)

#### Features

* Added Google::Rpc::Context::AttributeContext
* Added Google::Rpc::Context::AuditContext
* Added dotnet-specific fields to API language settings
* Added overrides_by_request_protocol to api.BackendRule
* Added proto_reference_documentation_uri to api.Publishing
* Added SERVICE_NOT_VISIBLE and GCP_SUSPENDED error reason values

### 1.5.0 (2023-01-04)

#### Features

* Added "cookie" JwtLocation
* Added protos related to client library publishing
* Added several new error reasons
* Added protos describing HTTP requests and responses

### 1.4.0 (2022-08-17)

#### Features

* Update minimum Ruby version to 2.6 ([#75](https://github.com/googleapis/common-protos-ruby/issues/75)) 

### 1.3.2 (2022-06-23)

#### Bug Fixes

* Remove some unnecessary requires

### 1.3.1 (2022-04-05)

* Sync updates to imports in the source protos

### 1.3.0 (2021-10-19)

* Add google/api/routing to common-protos-types
* Remove cloud-specific extended_operations proto. It's being moved to google-cloud-common.

### 1.2.0 (2021-09-03)

* Add Google::Cloud::OperationResponseMapping and the extended_operations_pb file
* Removed unnecessary files from the gem package

### 1.1.0 / 2021-07-07

* Add Google::Api::ErrorReason
* Add Google::Api::Visibility and Google::Api::VisibilityRule
* Add Google::Type::Decimal
* Add NON_EMPTY_DEFAULT value to Google::Api::FieldBehavior.

### 1.0.6 / 2021-02-01

* Add Google::Type::Interval type.
* Add Google::Type::LocalizedText type.
* Add Google::Type::PhoneNumber and Google::Type::PhoneNumber::ShortCode types.
* Add "service_root_url" field to Google::Api::Documentation.
* Add UNORDERED_LIST value to Google::Api::FieldBehavior.
* Add UNIMPLEMENTED and PRELAUNCH values to Google::Api::LaunchStage.
* Add "monitored_resource_types" field to Google::Api::MetricDescriptor.
* Add Google::Api::ResourceDescriptor::Style type and add "style" field to Google::Api::ResourceDescriptor.
* Moved HttpRequest and LogSeverity types from Google::Logging::Type to Google::Cloud::Logging::Type, and created aliases for backward compatibility.
* Remove internal "features" field from Google::Api::Endpoint.
* Require protobuf 3.14.

### 1.0.5 / 2020-04-08

* Add JWT location support in Google::Api::AuthProvider.
* Add "protocol" field and a "disable_auth" option to Google::Api::BackendRule.
* Add "launch_stage" field to Google::Api::MetricDescriptor and Google::Api::MonitoredResourceDescriptor.
* Add Google::Api::ResourceDescriptor and Google::Api::ResourceReference types and remove obsolete Google::Api::Resource type.
* Remove obsolete "experimental" field from Google::Api::Service type.
* Add Google::Rpc::ErrorInfo type.
* Add Google::Type::DateTime, Google::Type::Month, and Google::Type::TimeZone types.
* Require protobuf 3.11.

### 1.0.4 / 2019-04-03

* Add WaitOperation RPC to operations_pb.rb and update documentation.
* Add new common types for:
  + google/api/resource.proto
  + google/type/calendar_period.proto
  + google/type/expr.proto
  + google/type/fraction.proto
  + google/type/quaternion.proto
