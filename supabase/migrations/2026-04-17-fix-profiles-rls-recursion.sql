drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id);
