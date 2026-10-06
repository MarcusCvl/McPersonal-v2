const elementosReveal = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observer.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);

elementosReveal.forEach((elemento) => observer.observe(elemento));
