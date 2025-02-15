# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ExampleScheduledJob`.
# Please instead update this file by running `bin/tapioca dsl ExampleScheduledJob`.

class ExampleScheduledJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: ExampleScheduledJob).void)
      ).returns(T.any(ExampleScheduledJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
