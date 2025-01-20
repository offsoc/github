#!/bin/sh
#/ Usage: ernicorn-queue-stats.sh
#/
#/ Emit the cumulative total of connected and connecting ernicorn UNIX
#/ domain sockets.  Sockets in the connecting state are indications of
#/ backlog and considered 'queued'.  Sockets in the connected state are
#/ considered 'active'.
#/
#/ Output is formatted as JSON with a "now" key of the current number
#/ of seconds since the UNIX epoch, and "active" and "queued" keys with
#/ values being the count of sockets in those states:
#/
#/     {"now":1524682986,"active":4,"queued":27}

set -e

LC_ALL="C"

uds_stats=$(cat /proc/net/unix |
            grep -F -e 'ernicorn.sock' |
            cut -d ' ' -f6 |              # sixth column is `socket_state`
            grep -e '0[23]$')

num_queued=$(echo "$uds_stats" | grep -c -e '02$' || true) # state 02: SS_CONNECTING
num_active=$(echo "$uds_stats" | grep -c -e '03$' || true) # state 03: SS_CONNECTED

printf "{\"now\":%d,\"active\":%d,\"queued\":%d}\n" \
       "$(date +%s)" "$num_active" "$num_queued"
