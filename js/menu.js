const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const telaDesktop = window.matchMedia("(min-width: 1024px)");

function menuEstaAberto() {
  return navigation.classList.contains("aberto");
}

function abrirMenu() {
  navigation.classList.add("aberto");
  document.body.classList.add("menu-aberto");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu");
}

function fecharMenu() {
  navigation.classList.remove("aberto");
  document.body.classList.remove("menu-aberto");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  if (menuEstaAberto()) {
    fecharMenu();
  } else {
    abrirMenu();
  }
});

// com o menu cobrindo a tela, ele precisa fechar ao escolher um link
navigation.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", fecharMenu);
});

document.addEventListener("click", (event) => {
  const cliqueForaDoMenu = !navigation.contains(event.target);
  if (menuEstaAberto() && cliqueForaDoMenu) {
    fecharMenu();
  }
});

// Esc fecha e devolve o foco ao botão, para quem navega pelo teclado não se perder
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuEstaAberto()) {
    fecharMenu();
    menuToggle.focus();
  }
});

// se a tela crescer até o desktop com o menu aberto, ele fecha e a página volta a rolar
telaDesktop.addEventListener("change", (event) => {
  if (event.matches) {
    fecharMenu();
  }
});
