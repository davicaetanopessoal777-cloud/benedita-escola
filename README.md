# Conheça a Benedita — projeto independente

Site responsivo em HTML, CSS e JavaScript, com formulário de avaliações e painel administrativo privado usando Supabase (banco de dados PostgreSQL + autenticação).

## Antes de publicar

- Este projeto é independente e não é um site oficial da escola.
- O endereço usado foi encontrado na lista da Diretoria de Ensino Guarulhos Norte: Rua São João Del Rei, 141, Jardim Jovaia, Guarulhos–SP. Confirme se ainda está atualizado.
- As fotos da galeria são ilustrativas de bancos de imagens, não fotos confirmadas da escola. Troque por fotos autorizadas se desejar.
- Não recolha nome, turma, telefone nem outros dados pessoais de alunos. Não publique automaticamente os comentários.
- Como o formulário será público, peça a um adulto de confiança para revisar a política de privacidade e ajudar a administrar o projeto antes de divulgá-lo.

## 1. Criar o banco de dados

1. Crie um projeto no Supabase: https://supabase.com/
2. No painel do projeto, abra **SQL Editor**.
3. Cole e execute todo o conteúdo de `supabase.sql`.
4. Em **Project Settings / API** (ou Connect), copie a Project URL e a chave pública `anon`/publishable.
5. Abra `config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
   - A chave pública é feita para ser usada no navegador; as políticas RLS do SQL limitam o que visitantes podem fazer.
   - NUNCA coloque `service_role` ou senha de administrador em `config.js`.

## 2. Criar uma conta de administrador

1. No Supabase, abra **Authentication → Users** e crie um usuário com e-mail e senha seus.
2. No **SQL Editor**, substitua `SEU_EMAIL_EXATO` pelo e-mail da conta e execute:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'SEU_EMAIL_EXATO';
```

3. Faça logout/login de novo se a conta já estava aberta. A conta de administrador deve ter `app_metadata.role = admin`.
4. Abra `admin.html` para entrar. A página do painel não é protegida por estar “escondida”: a segurança real é aplicada pelas políticas RLS do banco e pela verificação do papel de administrador.

**Importante:** não compartilhe a senha da conta admin nem a URL privada de convite. Ative confirmação de e-mail e proteção contra abuso nas configurações de autenticação quando disponíveis.

## 3. Testar localmente

Abra `index.html` num navegador para visualizar o site. Para testar o envio ao Supabase, publique o site num host HTTPS ou use um servidor local simples. O formulário não salva nada enquanto `config.js` não tiver URL e chave válidas.

## 4. Publicar gratuitamente

Uma opção simples para este site estático é GitHub Pages, Netlify ou Vercel:
1. Crie um repositório privado no GitHub para guardar os arquivos durante a configuração.
2. Envie `index.html`, `styles.css`, `app.js`, `config.js`, `admin.html`, `admin.js` e este README.
3. Conecte o repositório a um host de sites estáticos e publique.
4. Configure o domínio/URL do site em Supabase Authentication → URL Configuration se a autenticação exigir redirecionamentos.
5. Teste uma avaliação fictícia e confirme que aparece no painel admin; depois remova os testes, se necessário.

Hospedagem gratuita e limites podem mudar. Um domínio próprio geralmente custa à parte.

## Como funciona

- Visitantes: só podem inserir nota, categoria e comentário; não podem ler a tabela.
- Administrador: depois de entrar com a conta marcada como `admin`, pode consultar até 500 avaliações recentes e ver total, média e quantidade dos últimos 30 dias.
- Os feedbacks não são publicados no site.
- O banco valida nota, categoria e tamanho do texto, mas isso não substitui moderação, limitação de abuso e revisão de privacidade. Antes de divulgar o link, peça ajuda de um adulto de confiança para configurar proteção contra spam.
