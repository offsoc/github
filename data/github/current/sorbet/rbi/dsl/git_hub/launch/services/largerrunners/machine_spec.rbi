# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Largerrunners::MachineSpec`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Largerrunners::MachineSpec`.

class GitHub::Launch::Services::Largerrunners::MachineSpec
  sig do
    params(
      architecture: T.nilable(String),
      cpu_cores: T.nilable(Integer),
      documentation_url: T.nilable(String),
      gpu: T.nilable(GitHub::Launch::Services::Largerrunners::MachineSpecGpu),
      id: T.nilable(String),
      memory_gb: T.nilable(Integer),
      storage_gb: T.nilable(Integer),
      type: T.nilable(String)
    ).void
  end
  def initialize(architecture: nil, cpu_cores: nil, documentation_url: nil, gpu: nil, id: nil, memory_gb: nil, storage_gb: nil, type: nil); end

  sig { returns(String) }
  def architecture; end

  sig { params(value: String).void }
  def architecture=(value); end

  sig { void }
  def clear_architecture; end

  sig { void }
  def clear_cpu_cores; end

  sig { void }
  def clear_documentation_url; end

  sig { void }
  def clear_gpu; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_memory_gb; end

  sig { void }
  def clear_storage_gb; end

  sig { void }
  def clear_type; end

  sig { returns(Integer) }
  def cpu_cores; end

  sig { params(value: Integer).void }
  def cpu_cores=(value); end

  sig { returns(String) }
  def documentation_url; end

  sig { params(value: String).void }
  def documentation_url=(value); end

  sig { returns(T.nilable(GitHub::Launch::Services::Largerrunners::MachineSpecGpu)) }
  def gpu; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Largerrunners::MachineSpecGpu)).void }
  def gpu=(value); end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end

  sig { returns(Integer) }
  def memory_gb; end

  sig { params(value: Integer).void }
  def memory_gb=(value); end

  sig { returns(Integer) }
  def storage_gb; end

  sig { params(value: Integer).void }
  def storage_gb=(value); end

  sig { returns(String) }
  def type; end

  sig { params(value: String).void }
  def type=(value); end
end
