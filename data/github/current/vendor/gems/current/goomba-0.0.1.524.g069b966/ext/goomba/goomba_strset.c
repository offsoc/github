#include <ruby/util.h>
#include "goomba.h"

#define FNV_SEED 0x3344

static uint32_t fnv_32a_str(const char *str, uint32_t hval)
{
    const unsigned char *s = (const unsigned char *)str;
    while (*s) {
		hval ^= (uint32_t)*s++;
		hval *= 0x01000193u;
    }
    return hval;
}

void string_set_init(StringSet *set)
{
	set->strings = NULL;
	set->size = 0;
	set->alloc = 0;
}

void string_set_free(StringSet *set)
{
	uint32_t i;

	for (i = 0; i < set->alloc; ++i)
		xfree(set->strings[i]);

	xfree(set->strings);
}

void string_set_clear(StringSet *set)
{
	uint32_t i;
	for (i = 0; i < set->alloc; ++i)
		set->strings[i] = NULL;
	set->size = 0;
}

static void string_set_resize(StringSet *set)
{
	uint32_t i, new_size = set->alloc ? (set->alloc * 2) : 4;
	char **new_strings = xcalloc(new_size, sizeof(char *)); 

	for (i = 0; i < set->alloc; ++i) {
		char *str = set->strings[i];

		if (str) {
			uint32_t hash = fnv_32a_str(str, FNV_SEED);

			while (new_strings[hash & (new_size - 1)] != NULL)
				hash++;

			new_strings[hash & (new_size - 1)] = str;
		}
	}

	xfree(set->strings);
	set->strings = new_strings;
	set->alloc = new_size;
}

void string_set_insert(StringSet *set, const char *str)
{
	uint32_t hash = fnv_32a_str(str, FNV_SEED);
	const char *m;

	if (set->size + 1 > set->alloc * 3 / 4)
		string_set_resize(set);

	while ((m = set->strings[hash & (set->alloc - 1)]) != NULL) {
		if (!strcmp(m, str))
			return;
		hash++;
	}

	set->strings[hash & (set->alloc - 1)] = ruby_strdup(str);
	set->size++;
}

void string_set_remove(StringSet *set, const char *str)
{
	uint32_t hash = fnv_32a_str(str, FNV_SEED);
	char *m;

	if (!set->alloc)
		return;

	while ((m = set->strings[hash & (set->alloc - 1)]) != NULL) {
		if (!strcmp(m, str)) {
			xfree(m);
			set->strings[hash & (set->alloc - 1)] = NULL;
			set->size--;
			return;
		}

		hash++;
	}
}

bool string_set_contains(const StringSet *set, const char *str)
{
	uint32_t hash = fnv_32a_str(str, FNV_SEED);
	const char *m;

	if (!set->alloc)
		return false;

	while ((m = set->strings[hash & (set->alloc - 1)]) != NULL) {
		if (m[0] == str[0] && !strcmp(m + 1, str + 1))
			return true;

		hash++;
	}

	return false;
}

VALUE string_set_to_rb(const StringSet *set)
{
	uint32_t i;
	VALUE rb_out = rb_ary_new2(set->size);

	for (i = 0; i < set->alloc; ++i) {
		if (set->strings[i])
			rb_ary_push(rb_out, rb_str_new2(set->strings[i]));
	}
	return rb_out;
}
