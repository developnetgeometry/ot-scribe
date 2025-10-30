-- Allow supervisors to read profiles of their team members
create policy prof_sup_read_team
on public.profiles
as permissive
for select
using (
  id = auth.uid()
  OR supervisor_id = auth.uid()
  OR exists (
    select 1
    from public.ot_requests r
    where r.employee_id = profiles.id
      and r.supervisor_id = auth.uid()
  )
);