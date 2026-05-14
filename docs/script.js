const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const fallbackImages = [
  "./assets/hero.jpg",
  "./assets/systems.png",
  "./assets/product-wide.png",
  "./assets/access.png",
  "./assets/workshop.jpg",
];

function syncHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

toggle.addEventListener("click", () => {
  header.classList.toggle("is-open");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    header.classList.remove("is-open");
  }
});

document.querySelectorAll("img").forEach((image, index) => {
  image.addEventListener("error", () => {
    const nextImage = fallbackImages[index % fallbackImages.length];
    if (image.getAttribute("src") !== nextImage) {
      image.src = nextImage;
    }
  });
});
