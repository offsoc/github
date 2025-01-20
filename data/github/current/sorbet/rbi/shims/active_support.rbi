# typed: strict
# frozen_string_literal: true


class Time
  sig { params(fraction_digits: T.nilable(Integer)).returns(String) }
  def rfc3339(fraction_digits = nil); end

  sig { params(arg0: T.any(Numeric, ActiveSupport::Duration)).returns(T.self_type) }
  sig { params(arg0: T.any(Time, ActiveSupport::TimeWithZone)).returns(Float) }
  sig { params(arg0: Date).returns(Rational) }
  sig { params(arg0: DateTime).returns(Rational) }
  def -(arg0); end

  DateTimeable = T.type_alias { T.any(Date, Time, ActiveSupport::TimeWithZone, DateTime, Numeric, String) }

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def <(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def <=(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def >(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def >=(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(Integer)
  end
  def <=>(arg0); end
end

class Date
  sig { params(arg0: T.any(Numeric, ActiveSupport::Duration)).returns(T.self_type) }
  sig { params(arg0: Date).returns(Rational) }
  sig { params(arg0: DateTime).returns(Rational) }
  def -(arg0); end

  sig { params(arg0: T.any(Integer, Float, Rational, ActiveSupport::Duration)).returns(T.self_type) }
  def +(arg0); end

  DateTimeable = T.type_alias { T.any(Date, Time, ActiveSupport::TimeWithZone, DateTime, Numeric, String) }

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def <(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def <=(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def >(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(T::Boolean)
  end
  def >=(arg0); end

  sig do
    params(arg0: DateTimeable)
      .returns(Integer)
  end
  def <=>(arg0); end
end
