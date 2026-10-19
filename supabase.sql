-- Execute este script no SQL Editor do SEU projeto Supabase.
create table if not exists public.school_feedback (
  id bigint generated always as identity primary key,
  rating smallint not null check (rating between 1 and 5),
  category text not null check (char_length(category) between 1 and 80),
  feedback text not null check (char_length(trim(feedback)) between 8 and 1200),
  created_at timestamptz not null default now()
);

alter table public.school_feedback enable row level security;

-- Visitantes podem enviar avaliações, mas NÃO podem ler a tabela.
drop policy if exists "public_can_submit_feedback" on public.school_feedback;
create policy "public_can_submit_feedback"
on public.school_feedback for insert to anon, authenticated
with check (
  rating between 1 and 5
  and char_length(category) between 1 and 80
  and char_length(trim(feedback)) between 8 and 1200
);

-- Apenas usuários cujo app_metadata.role é "admin" podem consultar os feedbacks.
drop policy if exists "admins_can_read_feedback" on public.school_feedback;
create policy "admins_can_read_feedback"
on public.school_feedback for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Não há política de update/delete para visitantes nem para usuários comuns.
-- Não coloque a chave service_role no frontend.
grant insert on public.school_feedback to anon, authenticated;
grant select on public.school_feedback to authenticated;
grant usage, select on sequence public.school_feedback_id_seq to anon, authenticated;