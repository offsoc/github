#ifndef _GOOMBA_STRBUF_H
#define _GOOMBA_STRBUF_H

#include "string_buffer.h"

#define strbuf GumboStringBuffer
#define strbuf_put gumbo_string_buffer_put
#define strbuf_puts gumbo_string_buffer_puts
#define strbuf_putc gumbo_string_buffer_putc
#define strbuf_putv gumbo_string_buffer_putv
#define strbuf_init gumbo_string_buffer_init
#define strbuf_free gumbo_string_buffer_destroy
#define strbuf_clear gumbo_string_buffer_clear
#define strbuf_splice gumbo_string_buffer_splice

#endif
