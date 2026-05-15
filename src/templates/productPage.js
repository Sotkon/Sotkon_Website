const { pageShell } = require("./layout");

const asset = (name) => `../../../assets/${name}`;
const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function gallery(component) {
  const [firstImage, firstCaption] = component.images[0];
  const thumbs = component.images.map(([image, caption], index) => (
    `<button type="button" class="${index === 0 ? "is-active" : ""}" data-gallery-thumb data-src="${asset(image)}" data-caption="${esc(caption)}" aria-label="Show ${esc(caption)}"><img src="${asset(image)}" alt="" /></button>`
  )).join("");

  return `<div class="config-gallery" data-config-gallery>
  <div class="config-gallery-frame"><img src="${asset(firstImage)}" alt="${esc(firstCaption)}" data-gallery-image /><span data-gallery-caption>${firstCaption}</span></div>
  <div class="config-gallery-controls"><button type="button" data-gallery-prev aria-label="Previous image">&lt;</button><div class="config-thumbs">${thumbs}</div><button type="button" data-gallery-next aria-label="Next image">&gt;</button></div>
</div>`;
}

function componentPanel(component, index) {
  return `<article class="config-panel ${index === 0 ? "is-active" : ""}" id="component-${component.id}" data-config-panel="${component.id}">
  <div class="config-copy"><span>${component.eyebrow}</span><h3>${component.title}</h3>${component.text.map((paragraph) => `<p>${paragraph}</p>`).join("")}<div class="config-pills">${component.pills.map((pill) => `<em>${pill}</em>`).join("")}</div></div>
  ${gallery(component)}
</article>`;
}

function renderProductPage(product) {
  const body = `<main class="page-main koncept-page ${product.slug}-page">
      <section class="koncept-hero ${product.slug}-hero">
        <img src="${asset(product.heroImage)}" alt="${esc(product.heroAlt)}" />
        <div class="container">
          <nav class="breadcrumb-line" aria-label="Breadcrumb"><a href="../">Waste Systems</a><span>/</span><strong>${product.name}</strong></nav>
          <span class="page-kicker">Underground Waste Systems</span>
          <h1>${product.name}</h1>
          <p>${product.heroText}</p>
        </div>
      </section>

      <section class="section koncept-overview" id="overview">
        <div class="container koncept-overview-grid">
          <div class="koncept-viewer" data-koncept-viewer>
            <div class="koncept-viewer-stage" data-koncept-stage>
              <div class="koncept-viewer-shadow"></div>
              <img class="koncept-sequence-image" src="${asset(`${product.sequencePath}/1.jpg`)}" alt="${esc(product.sequenceAlt)}" data-sequence-image data-sequence-base="${asset(`${product.sequencePath}/`)}" data-sequence-count="${product.sequenceCount}" />
              <div class="koncept-drag-hint" aria-hidden="true">Drag to rotate</div>
            </div>
            <div class="koncept-viewer-controls" aria-label="${esc(product.name)} interactive controls"><button type="button" data-sequence-play>Auto rotate</button></div>
          </div>
          <div class="koncept-overview-copy">
            <p class="eyebrow">Product overview</p>
            <h2>${product.overviewTitle}</h2>
            ${product.overview.map((paragraph) => `<p>${paragraph}</p>`).join("")}
            <div class="component-pills">${product.overviewPills.map((pill) => `<span>${pill}</span>`).join("")}</div>
          </div>
        </div>
      </section>

      <section class="section loading-options" id="loading-options"><div class="container"><div class="section-heading"><p class="eyebrow">Collection methods</p><h2>${product.loadingTitle}</h2></div><div class="loading-grid compact-loading">${product.loading.map((item) => `<article><img src="${asset(item.image)}" alt="${esc(item.alt)}" /><div><span>${item.kicker}</span><h3>${item.title}</h3><p>${item.text}</p></div></article>`).join("")}</div></div></section>

      <section class="section configurator-section" id="components" data-tabbed-product><div class="container"><div class="section-heading"><p class="eyebrow">System components</p><h2>Explore the complete ${product.name} system without the long scroll.</h2></div><div class="config-tabs" role="tablist" aria-label="${esc(product.name)} components">${product.components.map((component, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-config-tab="${component.id}">${component.label}</button>`).join("")}</div><div class="config-panels">${product.components.map(componentPanel).join("")}</div></div></section>

      <section class="section specs-drawer" id="specs"><div class="container"><div class="specs-heading"><p class="eyebrow">Technical dimensions</p><h2>Approximate installation dimensions.</h2><p>${product.specsNote}</p></div><div class="technical-grid compact-specs"><div><div class="tech-table-wrap"><table><thead><tr>${product.specs.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${product.specs.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="technical-note">Units in mm, approximate values. These measures do not apply for construction purposes.</p></div><div class="technical-image"><img src="${asset(product.specsImage)}" alt="${esc(product.specsAlt)}" /></div></div></div></section>

      <section class="section final-product-actions" id="media"><div class="container"><a href="${asset(product.brochure)}" target="_blank" rel="noopener">Download brochure</a><a href="../../../en/gallery/">View gallery</a><a href="../../../en/videos/">Watch videos</a><a href="../../../en/find-a-distributor/">Request proposal</a></div></section>
    </main>`;

  return pageShell({
    title: `Sotkon - ${product.name} Underground Waste System`,
    description: product.description,
    body,
  });
}

module.exports = { renderProductPage };
