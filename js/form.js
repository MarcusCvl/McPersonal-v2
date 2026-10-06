const form = document.querySelector(".form");
const botaoEnviar = form.querySelector(".form-button");
const statusEnvio = form.querySelector(".form-status");

// URL do app da web do Apps Script (Implantar > Nova implantação > App da Web)
const SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // se o campo invisível foi preenchido, é robô: finge sucesso e não envia nada
  if (form.website.value !== "") {
    form.reset();
    return;
  }

  // com no-cors o envio "dá certo" mesmo sem destino, então sem a URL não dá para fingir sucesso
  if (!SCRIPT_URL.startsWith("https://")) {
    statusEnvio.textContent =
      "Formulário ainda não configurado. Fale conosco pelo WhatsApp.";
    console.warn("form.js: preencha SCRIPT_URL com a URL do Apps Script.");
    return;
  }

  const textoOriginal = botaoEnviar.textContent;
  botaoEnviar.textContent = "Enviando...";
  botaoEnviar.disabled = true;
  statusEnvio.textContent = "";

  const dados = {
    nome: form.name.value,
    email: form.email.value,
    whatsapp: form.phone.value,
    objetivo: form.goal.value,
    mensagem: form.message.value,
  };

  try {
    // no-cors porque o Apps Script não devolve os cabeçalhos de CORS; a resposta não pode ser lida
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados),
    });

    form.reset();
    statusEnvio.textContent =
      "Recebido! Em breve nossa equipe entra em contato com você.";
  } catch (erro) {
    statusEnvio.textContent =
      "Não foi possível enviar agora. Tente de novo ou fale conosco pelo WhatsApp.";
    console.error(erro);
  } finally {
    botaoEnviar.textContent = textoOriginal;
    botaoEnviar.disabled = false;
  }
});
