const carrossel = document.querySelector(".testimonials-carousel");
const trilho = carrossel.querySelector(".testimonials-cards");
const cardsReais = [...trilho.querySelectorAll(".testimonials-cards-item")];
const botaoAnterior = carrossel.querySelector(".testimonials-controls-prev");
const botaoProximo = carrossel.querySelector(".testimonials-controls-next");
const areaBolinhas = carrossel.querySelector(".testimonials-dots");
const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)");

const INTERVALO_AUTOMATICO = 5000;
const totalDeCards = cardsReais.length;
// cópias em cada ponta: o máximo de cards visíveis ao mesmo tempo (3 no desktop)
const totalDeCopias = Math.min(3, totalDeCards);
let timerAutomatico = null;
let pausadoPelaPessoa = false;
let carrosselNaTela = false;
// guardado ao fim de cada rolagem: no resize a largura muda e o cálculo pelo scroll erraria
let cardAtual = 0;

// carrossel infinito: cópias dos últimos cards vão para o começo e dos primeiros para o fim;
// quando o carrossel para numa cópia, ele pula sem animação para o card real equivalente
function criarCopias() {
  const copiaDoCard = (card) => {
    const copia = card.cloneNode(true);
    copia.classList.remove("reveal");
    copia.classList.add("copia");
    // a cópia é só visual: o leitor de tela lê cada depoimento uma vez
    copia.setAttribute("aria-hidden", "true");
    return copia;
  };
  // cada cópia entra logo antes do primeiro card real, então a ordem se mantém
  cardsReais.slice(-totalDeCopias).forEach((card) => {
    trilho.insertBefore(copiaDoCard(card), cardsReais[0]);
  });
  cardsReais.slice(0, totalDeCopias).forEach((card) => {
    trilho.appendChild(copiaDoCard(card));
  });
}

// distância entre o começo de um card e o do próximo (largura + espaço entre eles)
function tamanhoDoPasso() {
  return cardsReais[1].offsetLeft - cardsReais[0].offsetLeft;
}

// índice do card que está na primeira posição visível; pode ser -1 ou passar do total nas cópias
function indiceAtual() {
  return Math.round(trilho.scrollLeft / tamanhoDoPasso()) - totalDeCopias;
}

// converte qualquer índice (inclusive o das cópias) para o card real de 0 a total - 1
function indiceReal(indice) {
  return ((indice % totalDeCards) + totalDeCards) % totalDeCards;
}

function rolarPara(indice, comAnimacao) {
  trilho.style.scrollBehavior = comAnimacao ? "smooth" : "auto";
  trilho.scrollLeft = (indice + totalDeCopias) * tamanhoDoPasso();
}

function irPara(indice) {
  rolarPara(indice, true);
}

// navegação pela pessoa: zera a contagem do automático para não pular logo em seguida
function navegarManualmente(indice) {
  irPara(indice);
  iniciarAutomatico();
}

// parou numa cópia: troca pelo card real sem animação, a pessoa não percebe o pulo
function corrigirSeEstiverNaCopia() {
  const atual = indiceAtual();
  if (atual < 0 || atual >= totalDeCards) {
    rolarPara(indiceReal(atual), false);
  }
  cardAtual = indiceReal(atual);
  marcarBolinhaAtiva();
}

function criarBolinhas() {
  areaBolinhas.innerHTML = "";
  cardsReais.forEach((card, i) => {
    const bolinha = document.createElement("button");
    bolinha.className = "testimonials-dots-button";
    bolinha.type = "button";
    bolinha.setAttribute("aria-label", `Ir para o depoimento ${i + 1}`);
    bolinha.addEventListener("click", () => navegarManualmente(i));
    areaBolinhas.appendChild(bolinha);
  });
  marcarBolinhaAtiva();
}

function marcarBolinhaAtiva() {
  const atual = indiceReal(indiceAtual());
  const bolinhas = areaBolinhas.querySelectorAll(".testimonials-dots-button");
  bolinhas.forEach((bolinha, i) => {
    bolinha.classList.toggle("ativo", i === atual);
    bolinha.setAttribute("aria-current", i === atual ? "true" : "false");
  });
}

function iniciarAutomatico() {
  pararAutomatico();
  // só avança sozinho com o carrossel na tela, sem a pessoa interagindo e se ela não desativou animações
  if (pausadoPelaPessoa || !carrosselNaTela || semAnimacao.matches) {
    return;
  }
  timerAutomatico = setInterval(
    () => irPara(indiceAtual() + 1),
    INTERVALO_AUTOMATICO
  );
}

function pararAutomatico() {
  clearInterval(timerAutomatico);
}

function pausar() {
  pausadoPelaPessoa = true;
  pararAutomatico();
}

function retomar() {
  pausadoPelaPessoa = false;
  iniciarAutomatico();
}

botaoAnterior.addEventListener("click", () =>
  navegarManualmente(indiceAtual() - 1)
);
botaoProximo.addEventListener("click", () =>
  navegarManualmente(indiceAtual() + 1)
);

// mouse em cima ou foco do teclado: o carrossel para para a pessoa conseguir ler
carrossel.addEventListener("mouseenter", pausar);
carrossel.addEventListener("mouseleave", retomar);
carrossel.addEventListener("focusin", pausar);
carrossel.addEventListener("focusout", retomar);

// no celular não existe mouseleave: depois de arrastar, volta a andar sozinho após um tempo
carrossel.addEventListener("touchstart", pausar, { passive: true });
carrossel.addEventListener(
  "touchend",
  () => setTimeout(retomar, INTERVALO_AUTOMATICO),
  { passive: true }
);

// fim da rolagem: o scrollend ainda não existe em todo navegador, então o
// scroll também agenda a correção para quando parar de rolar
let timerFimDaRolagem = null;
trilho.addEventListener(
  "scroll",
  () => {
    clearTimeout(timerFimDaRolagem);
    timerFimDaRolagem = setTimeout(corrigirSeEstiverNaCopia, 150);
  },
  { passive: true }
);

// ao mudar o tamanho da tela muda a largura dos cards: recoloca o trilho no card atual
window.addEventListener("resize", () => {
  rolarPara(cardAtual, false);
});

// só anda sozinho enquanto a seção de depoimentos estiver visível
const observadorCarrossel = new IntersectionObserver(
  (entradas) => {
    carrosselNaTela = entradas[0].isIntersecting;
    iniciarAutomatico();
  },
  { threshold: 0.3 }
);
observadorCarrossel.observe(carrossel);

criarCopias();
rolarPara(0, false);
criarBolinhas();
