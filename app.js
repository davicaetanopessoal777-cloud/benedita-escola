
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
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = $("#formStatus");
    const btn = $("#submitBtn");

    if (!status || !btn) {
      console.error("Não encontrei #formStatus ou #submitBtn no HTML.");
      return;
    }

    const showMessage = (type, message) => {
      status.className = `form-status ${type}`;
      status.textContent = message;
    };

    const formData = new FormData(feedbackForm);
    const rating = Number(formData.get("rating"));
    const category = $("#category")?.value;
    const feedback = feedbackInput?.value.trim() || "";
    const confirm = $("#confirm");

    if (!rating || rating < 1 || rating > 5) {
      showMessage("error", "Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    if (!category) {
      showMessage("error", "Selecione uma categoria.");
      return;
    }

    if (feedback.length < 8 || feedback.length > 1200) {
      showMessage(
        "error",
        "O comentário precisa ter entre 8 e 1200 caracteres."
      );
      return;
    }

    if (confirm && !confirm.checked) {
      showMessage("error", "Marque a confirmação antes de enviar.");
      return;
    }

    if (!db) {
      showMessage(
        "error",
        "A conexão com o banco não foi iniciada. Confira o config.js e os scripts do index.html."
      );
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
      const { error } = await db
        .from("school_feedback")
        .insert([{ rating, category, feedback }]);

      if (error) {
        console.error("Erro retornado pelo Supabase:", error);

        if (error.code === "42501") {
          showMessage(
            "error",
            "O banco bloqueou o envio por falta de permissão. É necessário revisar a política de INSERT."
          );
        } else if (error.code === "23514") {
          showMessage(
            "error",
            "O banco rejeitou os dados por uma regra de validação. Confira a categoria e o comentário."
          );
        } else if (error.code === "PGRST204" || error.code === "42703") {
          showMessage(
            "error",
            "O banco informou que uma coluna não corresponde ao formulário. Precisamos conferir os nomes das colunas."
          );
        } else {
          showMessage(
            "error",
            `Falha ao enviar (${error.code || "erro"}): ${error.message || "Confira a conexão e as permissões do banco."}`
          );
        }

        return;
      }

      feedbackForm.reset();

      if (charCount) charCount.textContent = "0";

      showMessage(
        "success",
        "Obrigado! Sua avaliação foi enviada com sucesso."
      );
    } catch (error) {
      console.error("Erro inesperado ao enviar avaliação:", error);
      showMessage(
        "error",
        "Não foi possível conectar ao banco. Verifique sua internet e a configuração do Supabase."
      );
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Enviar avaliação <span>↗</span>';
    }
  });
} else {
  console.error("Não encontrei o formulário #feedbackForm no HTML.");
}
