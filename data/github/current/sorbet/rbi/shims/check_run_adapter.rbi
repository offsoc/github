# typed: true

# CheckRunAdapter is a SimpleDelegator which wraps a CheckRun instance and
# gives it an interface like a Status.
#
# It might eventually be possible to generate this kind of RBI file, see:
# https://github.com/github/app-partitioning/issues/67

class CombinedStatus
  class CheckRunAdapter
    sig { returns(T::Boolean) }
    def failed?; end

    sig { params(actor: User).void }
    def rerequest(actor:); end

    sig { returns(Class) }
    def class; end

    sig { returns(T.nilable(Integer)) }
    def id; end
  end
end
