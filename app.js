
const $ = (s) => document.querySelector(s);

// Ano do rodapé
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

// Menu para celular
const menuToggle = $("#menuToggle");
const nav = $("#nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

// Contador de caracteres
const feedbackInput = $("#feedback");
const charCount = $("#charCount");

if (feedbackInput && charCount) {
  feedbackInput.addEventListener("input", () => {
    charCount.textContent = feedbackInput.value.length;
  });
}

// Conexão com Supabase
let db = null;

try {
  if (
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {
    db = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.error("Erro ao iniciar o Supabase:", error);
}

// Formulário de avaliação
const feedbackForm = $("#feedbackForm");

if (feedbackForm) {
  const status = $("#formStatus");
  const btn = $("#submitBtn");

  const showMessage = (type, message) => {
    if (!status) {
      alert(message);
      console.error("Elemento #formStatus não encontrado.");
      return;
    }

    status.className = `form-status ${type}`;
    status.textContent = message;
    status.hidden = false;
    status.style.display = "block";
  };

  // Impede o recarregamento e valida os dados
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!status || !btn) {
      console.error("Não encontrei #formStatus ou #submitBtn no HTML.");
      alert("Não foi possível verificar o formulário. Atualize a página.");
      return;
    }

    const formData = new FormData(feedbackForm);
    const rating = Number(formData.get("rating"));
    const category = $("#category")?.value;
    const feedback = feedbackInput?.value.trim() || "";
    const confirm = $("#confirm");

    // Valida a nota
    if (!rating || rating < 1 || rating > 5) {
      showMessage("error", "Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    // Valida a categoria
    if (!category) {
      showMessage("error", "Selecione uma categoria.");
      return;
    }

    // Valida o tamanho do comentário
    if (feedback.length < 8) {
      showMessage(
        "error",
        `Escreva pelo menos 8 caracteres. Você digitou ${feedback.length}.`
      );
      feedbackInput?.focus();
      return;
    }

    if (feedback.length > 1200) {
      showMessage(
        "error",
        "O comentário pode ter no máximo 1200 caracteres."
      );
      feedbackInput?.focus();
      return;
    }

    // Confirmação do usuário
    if (confirm && !confirm.checked) {
      showMessage("error", "Marque a confirmação antes de enviar.");
      return;
    }

    // Verifica a conexão
    if (!db) {
      showMessage(
        "error",
        "A conexão com o banco não foi iniciada. Confira a configuração do site."
      );
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    status.textContent = "";

    try {
      const { error } = await db
        .from("school_feedback")
        .insert([{ rating, category, feedback }]);

      if (error) {
        console.error("Erro retornado pelo Supabase:", error);

        if (error.code === "42501") {
          showMessage(
            "error",
            "O banco bloqueou o envio. É necessário revisar as permissões."
          );
        } else if (error.code === "23514") {
          showMessage(
            "error",
            "O banco rejeitou os dados. Confira a categoria e o comentário."
          );
        } else if (
          error.code === "PGRST204" ||
          error.code === "42703"
        ) {
          showMessage(
            "error",
            "Há uma divergência nos nomes das colunas do banco."
          );
        } else {
          showMessage(
            "error",
            `Falha ao enviar (${error.code || "erro"}): ${
              error.message || "Confira a conexão e as permissões."
            }`
          );
        }

        return;
      }

      // Limpa o formulário após o envio bem-sucedido
      feedbackForm.reset();

      if (charCount) {
        charCount.textContent = "0";
      }

      showMessage(
        "success",
        "Obrigado! Sua avaliação foi enviada com sucesso."
      );
    } catch (error) {
      console.error("Erro inesperado ao enviar avaliação:", error);

      showMessage(
        "error",
        "Não foi possível conectar ao banco. Verifique sua internet e tente novamente."
      );
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Enviar avaliação <span>↗</span>';
    }
  });

  // Atualiza o aviso imediatamente ao digitar
  if (feedbackInput) {
    feedbackInput.addEventListener("input", () => {
      if (status && status.classList.contains("error")) {
        status.textContent = "";
        status.style.display = "none";
      }
    });
  }
} else {
  console.error("Não encontrei o formulário #feedbackForm no HTML.");
}
