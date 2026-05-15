const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const scriptPath = document.querySelector('script[src$="script.js"]')?.getAttribute("src") || "script.js";
const assetBase = scriptPath.replace(/script\.js$/, "assets/");
const fallbackImages = [
  "sotkon-legacy-hero.jpg",
  "sotkon-access-container.png",
  "hero.jpg",
  "systems.png",
  "product-wide.png",
  "access.png",
  "workshop.jpg",
].map((image) => `${assetBase}${image}`);

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

document.querySelectorAll("[data-koncept-viewer]").forEach((viewer) => {
  const stage = viewer.querySelector("[data-koncept-stage]");
  const slider = viewer.querySelector("[data-viewer-rotate]");
  const image = viewer.querySelector("[data-sequence-image]");
  const playButton = viewer.querySelector("[data-sequence-play]");
  const readout = viewer.querySelector("[data-frame-readout]");
  const frameCount = Number(image?.dataset.sequenceCount || 1);
  const sequenceBase = image?.dataset.sequenceBase || "";
  let startX = 0;
  let startValue = Number(slider?.value || 1);
  let currentFrame = startValue;
  let playTimer;
  let isDragging = false;

  function normalizeFrame(value) {
    return ((((Math.round(Number(value)) - 1) % frameCount) + frameCount) % frameCount) + 1;
  }

  function setFrame(value) {
    const nextFrame = normalizeFrame(value);
    currentFrame = nextFrame;
    if (image) {
      image.src = `${sequenceBase}${nextFrame}.jpg`;
    }
    if (slider) {
      slider.value = String(nextFrame);
    }
    if (readout) {
      readout.textContent = `${nextFrame} / ${frameCount}`;
    }
  }

  slider?.addEventListener("input", (event) => {
    window.clearInterval(playTimer);
    playButton?.classList.remove("is-active");
    setFrame(event.target.value);
  });

  playButton?.addEventListener("click", () => {
    const isPlaying = playButton.classList.toggle("is-active");
    window.clearInterval(playTimer);
    if (isPlaying) {
      playTimer = window.setInterval(() => {
        setFrame(currentFrame === frameCount ? 1 : currentFrame + 1);
      }, 70);
    }
  });

  stage?.addEventListener("pointerdown", (event) => {
    window.clearInterval(playTimer);
    playButton?.classList.remove("is-active");
    isDragging = true;
    startX = event.clientX;
    startValue = currentFrame;
    stage.setPointerCapture(event.pointerId);
  });

  window.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    setFrame(startValue + (event.clientX - startX) / 7);
  });

  window.addEventListener("pointerup", (event) => {
    isDragging = false;
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  });

  setFrame(slider?.value || 1);
});

document.querySelectorAll("[data-tabbed-product]").forEach((module) => {
  const tabs = [...module.querySelectorAll("[data-config-tab]")];
  const panels = [...module.querySelectorAll("[data-config-panel]")];

  function activate(id) {
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.configTab === id));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.configPanel === id));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.configTab));
  });
});

document.querySelectorAll("[data-config-gallery]").forEach((gallery) => {
  const image = gallery.querySelector("[data-gallery-image]");
  const caption = gallery.querySelector("[data-gallery-caption]");
  const thumbs = [...gallery.querySelectorAll("[data-gallery-thumb]")];
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + thumbs.length) % thumbs.length;
    const thumb = thumbs[index];
    image.src = thumb.dataset.src;
    image.alt = thumb.dataset.caption;
    caption.textContent = thumb.dataset.caption;
    thumbs.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
  }

  thumbs.forEach((thumb, thumbIndex) => {
    thumb.addEventListener("click", () => show(thumbIndex));
  });

  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));
});

document.querySelectorAll("[data-jump-component]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const id = trigger.dataset.jumpComponent;
    const module = document.querySelector("[data-tabbed-product]");
    module?.querySelector(`[data-config-tab="${id}"]`)?.click();
  });
});
