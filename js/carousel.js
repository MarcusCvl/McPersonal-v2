const carrossel = document.querySelector(".testimonials-carousel");
const trilho = carrossel.querySelector(".testimonials-cards");
const cardsCarrossel = trilho.querySelectorAll(".testimonials-cards-item");
const botaoAnterior = carrossel.querySelector(".testimonials-controls-prev");
const botaoProximo = carrossel.querySelector(
  ".testimonials-controls-button:not(.testimonials-controls-prev)"
);
const areaBolinhas = carrossel.querySelector(".testimonials-dots");
const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)");

const INTERVALO_AUTOMATICO = 5000;
let timerAutomatico = null;
let pausadoPelaPessoa = false;
let carrosselNaTela = false;

// distância entre o começo de um card e o do próximo (largura + espaço entre eles)
function tamanhoDoPasso() {
  return cardsCarrossel[1].offsetLeft - cardsCarrossel[0].offsetLeft;
}

// quantas posições o carrossel tem: com 3 cards visíveis e 5 no total, são 3 posições
function totalDePosicoes() {
  const visiveis = Math.round(trilho.clientWidth / tamanhoDoPasso());
  return Math.max(1, cardsCarrossel.length - visiveis + 1);
}

function posicaoAtual() {
  return Math.round(trilho.scrollLeft / tamanhoDoPasso());
}

function irPara(posicao) {
  const total = totalDePosicoes();
  // passou do fim volta ao começo, e vice-versa
  const destino = (posicao + total) % total;
  trilho.scrollTo({ left: destino * tamanhoDoPasso() });
}

// navegação pela pessoa: zera a contagem do automático para não pular logo em seguida
function navegarManualmente(posicao) {
  irPara(posicao);
  iniciarAutomatico();
}

function criarBolinhas() {
  areaBolinhas.innerHTML = "";
  for (let i = 0; i < totalDePosicoes(); i++) {
    const bolinha = document.createElement("button");
    bolinha.className = "testimonials-dots-button";
    bolinha.type = "button";
    bolinha.setAttribute("aria-label", `Ir para o depoimento ${i + 1}`);
    bolinha.addEventListener("click", () => navegarManualmente(i));
    areaBolinhas.appendChild(bolinha);
  }
  marcarBolinhaAtiva();
}

function marcarBolinhaAtiva() {
  const atual = posicaoAtual();
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
    () => irPara(posicaoAtual() + 1),
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
  navegarManualmente(posicaoAtual() - 1)
);
botaoProximo.addEventListener("click", () =>
  navegarManualmente(posicaoAtual() + 1)
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

// o scroll dispara várias vezes por segundo; o requestAnimationFrame junta em uma atualização por quadro
let atualizacaoAgendada = false;
trilho.addEventListener(
  "scroll",
  () => {
    if (atualizacaoAgendada) {
      return;
    }
    atualizacaoAgendada = true;
    requestAnimationFrame(() => {
      marcarBolinhaAtiva();
      atualizacaoAgendada = false;
    });
  },
  { passive: true }
);

// ao mudar o tamanho da tela muda quantos cards cabem, então as bolinhas são refeitas
window.addEventListener("resize", criarBolinhas);

// só anda sozinho enquanto a seção de depoimentos estiver visível
const observadorCarrossel = new IntersectionObserver(
  (entradas) => {
    carrosselNaTela = entradas[0].isIntersecting;
    iniciarAutomatico();
  },
  { threshold: 0.3 }
);
observadorCarrossel.observe(carrossel);

criarBolinhas();
