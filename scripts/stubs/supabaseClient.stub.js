export const supabase = {
  from() {
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      order() {
        return Promise.resolve({ data: [], error: null });
      },
    };
  },
};
