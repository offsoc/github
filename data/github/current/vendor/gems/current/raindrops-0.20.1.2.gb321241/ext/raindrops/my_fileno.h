#include <ruby.h>
#include <ruby/io.h>

static int my_fileno(VALUE io)
{
#ifdef HAVE_RB_IO_DESCRIPTOR
	if (TYPE(io) != T_FILE)
		io = rb_convert_type(io, T_FILE, "IO", "to_io");

	return rb_io_descriptor(io);
#else
	rb_io_t *fptr;

	if (TYPE(io) != T_FILE)
		io = rb_convert_type(io, T_FILE, "IO", "to_io");
	GetOpenFile(io, fptr);

	if (fptr->fd < 0)
		rb_raise(rb_eIOError, "closed stream");
	return fptr->fd;
#endif
}
