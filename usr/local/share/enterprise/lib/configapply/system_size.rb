# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # SystemSize contains methods that report on the memory and CPU size of the GHE system.
    module SystemSize
      CGROUP_MOUNTPOINT = "/sys/fs/cgroup".freeze

      # memory returns the available RAM for GHE in kB but rounded to the
      # lower end GB. This is useful as machines report slightly different
      # kB values for the same GB values here. Since our budget calculation
      # is mostly based on GBs, we want to ensure a few kB difference do not
      # change anything.
      #
      # If run under a Docker or LXC container, it uses the container's (lower)
      # memory limit, because /proc/meminfo is not namespaced.  In case
      # the container has an artificially high limit that exceeds host RAM,
      # cap the value at the actual RAM amount.
      def memory
        @memory ||= ([container_memory_limit, host_memory_size].min/1024/1024).floor*1024*1024
      end

      # memory_mb returns the value of memory in MB.
      def memory_mb
        memory / MEGABYTE
      end

      # host_memory_size reads the total amount of system RAM from /proc, in kB
      def host_memory_size
        File.read("/proc/meminfo").scan(/MemTotal:\s+(\d+)/).flatten.first.to_i
      end

      # container_memory_limit returns the cgroup memory limit for the
      # Docker or LXC container we're running in, in kB
      def container_memory_limit
        if File.exist?("/etc/github/.codespaces")
          host_memory_size # Codespaces has no memory limit so return host memory size instead
        else
          File.read(File.join(cgroup_dir_for_subsystem("memory"), "memory.limit_in_bytes")).to_i / 1024
        end
      end

      # Get the filesystem directory path for the named cgroup subsystem,
      # like "memory" or "cpu".  Assumes cgroup heirarchy
      # is mounted at `/sys/fs/cgroup`.
      # See http://man7.org/linux/man-pages/man7/cgroups.7.html
      #
      # Note, GHE Docker instances bind-mount the host `/sys/fs/cgroup` dir,
      # so the cgroup path includes the container ID; e.g.:
      #   /sys/fs/cgroup/memory/docker/2763ced6114c633a8e4ab9b4cdf868f49dddb241f626c23c640d2bf1b0d20b4c
      # When this bind mount is not present, such as under LXC and default Docker,
      # it's simpler:
      #   /sys/fs/cgroup/memory
      def cgroup_dir_for_subsystem(subsystem = "memory")
        # A path under CGROUP_MOUNTPOINT, like "/docker/abc123"
        # Scan extracts from a line like "3:memory:/docker/abc123"
        cgroup_name = File.read("/proc/1/cgroup").scan(/:(?:.*,)?#{subsystem}(?:,.*)?:(.+)/).flatten.first
        raise(ArgumentError, "cgroup subsystem #{subsystem} not found") if cgroup_name.nil?

        path_with_cgroup = File.join CGROUP_MOUNTPOINT, subsystem, cgroup_name
        if File.exist? path_with_cgroup
          path_with_cgroup
        else
          File.join CGROUP_MOUNTPOINT, subsystem
        end
      end

      def cpus
        `nproc`.to_i
      end

      def interface_mtu(interface = "eth0")
        File.read("/sys/class/net/#{interface}/mtu").to_i || nil
      end
    end
  end
end
