const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

function syncHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

toggle?.addEventListener("click", () => {
  const expanded = header.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(expanded));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    header.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header?.classList.contains("is-open")) {
    header.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.focus();
  }
});

document.querySelectorAll("[data-koncept-viewer]").forEach((viewer) => {
  const stage = viewer.querySelector("[data-koncept-stage]");
  const slider = viewer.querySelector("[data-viewer-rotate]");
  const image = viewer.querySelector("[data-sequence-image]");
  const playButton = viewer.querySelector("[data-sequence-play]");
  const readout = viewer.querySelector("[data-frame-readout]");
  if (!stage || !image) return;
  stage.tabIndex = 0;
  stage.setAttribute("role", "group");
  stage.setAttribute(
    "aria-label",
    "360 degree view. Use left and right arrow keys to rotate.",
  );
  const frameCount = Number(image?.dataset.sequenceCount || 1);
  const sequenceBase = image?.dataset.sequenceBase || "";
  let startX = 0;
  let startValue = Number(slider?.value || 1);
  let currentFrame = startValue;
  let playTimer;
  let isDragging = false;

  function normalizeFrame(value) {
    return (
      ((((Math.round(Number(value)) - 1) % frameCount) + frameCount) %
        frameCount) +
      1
    );
  }

  function setFrame(value) {
    const nextFrame = normalizeFrame(value);
    if (nextFrame === currentFrame) return;
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

  function stopPlayback() {
    window.clearInterval(playTimer);
    playButton?.classList.remove("is-active");
    playButton?.setAttribute("aria-pressed", "false");
  }
  playButton?.setAttribute("aria-pressed", "false");
  stage.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    stopPlayback();
    setFrame(currentFrame + (event.key === "ArrowRight" ? 1 : -1));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPlayback();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) stopPlayback();
    }).observe(stage);
  }

  slider?.addEventListener("input", (event) => {
    stopPlayback();
    setFrame(event.target.value);
  });

  playButton?.addEventListener("click", () => {
    const isPlaying = playButton.classList.toggle("is-active");
    playButton.setAttribute("aria-pressed", String(isPlaying));
    window.clearInterval(playTimer);
    if (isPlaying) {
      playTimer = window.setInterval(() => {
        setFrame(currentFrame === frameCount ? 1 : currentFrame + 1);
      }, 70);
    }
  });

  stage?.addEventListener("pointerdown", (event) => {
    stopPlayback();
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
  stage.addEventListener("pointercancel", () => {
    isDragging = false;
  });

  setFrame(slider?.value || 1);
});

document.querySelectorAll("[data-tabbed-product]").forEach((module) => {
  const tabs = [...module.querySelectorAll("[data-config-tab]")];
  const panels = [...module.querySelectorAll("[data-config-panel]")];

  function activate(id) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.configTab === id;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.configPanel === id;
      panel.classList.toggle("is-active", selected);
      panel.hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    const panel = panels.find(
      (item) => item.dataset.configPanel === tab.dataset.configTab,
    );
    tab.id = `tab-${tab.dataset.configTab}`;
    tab.setAttribute("role", "tab");
    if (panel) {
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
    }
    tab.addEventListener("click", () => activate(tab.dataset.configTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      activate(tabs[next].dataset.configTab);
      tabs[next].focus();
    });
  });
  if (tabs.length) activate(tabs[0].dataset.configTab);
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
    thumbs.forEach((item, itemIndex) =>
      item.classList.toggle("is-active", itemIndex === index),
    );
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
