const linksMenu = document.querySelectorAll(".nav-link");
const secoesMenu = [...linksMenu].map((link) =>
  document.querySelector(link.getAttribute("href"))
);

// a seção "atual" é a última do menu cujo topo já passou de 40% da tela;
// assim Sobre e Depoimentos, que não estão no menu, mantêm marcado o link anterior
function marcarLinkAtivo() {
  const linhaDeCorte = window.innerHeight * 0.4;
  let indiceAtivo = 0;

  secoesMenu.forEach((secao, indice) => {
    if (secao.getBoundingClientRect().top <= linhaDeCorte) {
      indiceAtivo = indice;
    }
  });

  linksMenu.forEach((link, indice) => {
    link.classList.toggle("ativo", indice === indiceAtivo);
  });
}

// o scroll dispara dezenas de vezes por segundo; o requestAnimationFrame
// junta tudo em no máximo um cálculo por quadro da tela
let calculoAgendado = false;

function agendarCalculo() {
  if (calculoAgendado) {
    return;
  }
  calculoAgendado = true;
  requestAnimationFrame(() => {
    marcarLinkAtivo();
    calculoAgendado = false;
  });
}

window.addEventListener("scroll", agendarCalculo, { passive: true });
window.addEventListener("resize", agendarCalculo);
marcarLinkAtivo();
