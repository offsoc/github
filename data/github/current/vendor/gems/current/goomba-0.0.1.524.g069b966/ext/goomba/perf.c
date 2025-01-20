#include "goomba.h"

#ifdef __MACH__
#	include <mach/clock.h>
#	include <mach/mach.h>
#else
#	include <time.h>
#	ifndef CLOCK_MONOTONIC_COARSE
#		define CLOCK_MONOTONIC_COARSE CLOCK_MONOTONIC
#	endif
#endif

double goomba_get_ms(void)
{
#ifdef __MACH__
        clock_serv_t cclock;
        mach_timespec_t clock;
        host_get_clock_service(mach_host_self(), SYSTEM_CLOCK, &cclock);
        clock_get_time(cclock, &clock);
        mach_port_deallocate(mach_task_self(), cclock);
#else
        struct timespec clock;
        clock_gettime(CLOCK_MONOTONIC, &clock);
#endif
        return clock.tv_sec*1000.0 + clock.tv_nsec/1000000.0;
}

void goomba_stats(VALUE rb_stats, const char *statname, int count, double value)
{
	VALUE rb_st = rb_ary_new_from_args(3,
		rb_str_new2(statname), INT2FIX(count), rb_float_new(value));
	rb_ary_push(rb_stats, rb_st);
}
