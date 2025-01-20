#!/bin/sh
#/ This script is called by the kernel whenever a coredump happens.
#/   coredump.sh <pid> <uid> <gid> <signal> <time> <host> <exe>
#/
#/ Setup: sudo sysctl kernel.core_pattern="|/path/to/coredump.sh %p %u %g %s %t %h %e"
set -e

# Show usage.
if [ "$1" = "--help" ] || [ $# -lt 7 ]
then grep '^#/' <"$0" |cut -c 4-
    exit 2
fi

pid="$1"
uid="$2"
gid="$3"
signal="$4"
time="$5"
host="$6"
exe="$7"

msg="[$time] $exe ($pid) on $host running as ($uid/$gid) died with signal $signal"
corefile="/cores/$exe.$uid.$gid.$signal.$host.gz"

# Log to file
echo $msg >> /var/log/coredumps.log

# Save a core if we don't have a recent one already
if [ -f "$corefile" ]; then
  created=$(stat -c "%Y" "$corefile")
  diff=$(($time - $created))

  # If the core is older than 12 hours
  [ $diff -gt 43200 ] && {
    gzip > "$corefile"
  }
else
  mkdir -p /cores
  gzip > "$corefile"
fi
