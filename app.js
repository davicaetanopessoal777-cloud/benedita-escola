const $ = (s) => document.querySelector(s);
$("#year").textContent = new Date().getFullYear();
const menuToggle = $("#menuToggle"), nav = $("#nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded","false"); menuToggle.textContent="☰";
}));
$("#feedback").addEventListener("input", e => $("#charCount").textContent = e.target.value.length);

const configured = Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
const db = configured ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

$("#feedbackForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = $("#formStatus"), btn = $("#submitBtn");
  status.className = "form-status"; status.textContent = "";
  const rating = Number(new FormData(event.currentTarget).get("rating"));
  const category = $("#category").value;
  const feedback = $("#feedback").value.trim();
  if (!rating) { status.className = "form-status error"; status.textContent = "Escolha uma nota de 1 a 5 estrelas."; return; }
  if (feedback.length < 8) { status.className = "form-status error"; status.textContent = "Escreva um comentário com pelo menos 8 caracteres."; return; }
  if (!configured) {
    status.className = "form-status error";
    status.textContent = "O banco de dados ainda não foi conectado. Siga o README para configurar o Supabase antes de receber avaliações.";
    return;
  }
  btn.disabled = true; btn.innerHTML = "Enviando…";
  try {
    const { error } = await db.from("school_feedback").insert([{ rating, category, feedback }]);
    if (error) throw error;
    event.currentTarget.reset(); $("#charCount").textContent = "0";
    status.className = "form-status success"; status.textContent = "Obrigado! Sua avaliação foi enviada com sucesso.";
  } catch (err) {
    console.error("Erro ao enviar avaliação:", err);
    status.className = "form-status error";
    status.textContent = "Não foi possível enviar agora. Confira a configuração do banco ou tente novamente mais tarde.";
  } finally { btn.disabled = false; btn.innerHTML = 'Enviar avaliação <span>↗</span>'; }
});