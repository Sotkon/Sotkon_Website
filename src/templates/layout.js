function header(depth = "../../../") {
  return `<header class="site-header" data-header>
      <div class="header-shell">
        <a class="brand" href="${depth}index.html" aria-label="Sotkon home">
          <span class="brand-mark">sk</span>
          <span class="brand-copy"><span class="brand-word">sotkon</span><span class="brand-line">waste systems</span></span>
        </a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" data-menu-toggle><span></span><span></span><span></span></button>
        <nav class="nav" data-nav>
          <a href="${depth}">Home</a>
          <a href="${depth}en/advantages/">Advantages</a>
          <a href="https://koncept.sotkon.com/">Our Concept</a>
          <div class="nav-item"><button class="nav-trigger" type="button">Products</button><div class="nav-submenu"><a href="${depth}en/waste-systems/">Waste Systems</a><a href="${depth}en/intake-columns/">Intake Columns</a><a href="https://website.sotkis.com/home?lang=en">Sotkis</a><a href="${depth}en/installation/">Installation &amp; Maintenance</a></div></div>
          <div class="nav-item"><a href="${depth}en/news/archive/">Media</a><div class="nav-submenu"><a href="${depth}en/news/archive/">News</a><a href="${depth}en/gallery/">Gallery</a><a href="${depth}en/videos/">Videos</a></div></div>
          <div class="nav-item"><a href="${depth}index.html#contact">Contacts</a><div class="nav-submenu"><a href="${depth}en/sotkon-group-companies/">Sotkon Group Companies</a><a href="${depth}en/find-a-distributor/">Find a Distributor</a></div></div>
          <div class="nav-item"><a href="${depth}en/about-sotkon/">About</a><div class="nav-submenu"><a href="${depth}en/about-sotkon/">About Sotkon</a><a href="${depth}en/ourhistory/">Our History</a></div></div>
        </nav>
        <a class="header-cta" href="${depth}index.html#contact">Start a project</a>
      </div>
    </header>`;
}

function footer() {
  return `<footer class="footer"><div class="container footer-grid"><div><strong>sotkon</strong><span>waste systems</span></div><p>Simple and efficient waste systems.</p></div></footer>`;
}

function pageShell({ title, description, body, depth = "../../../" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${depth}styles.css" />
  </head>
  <body>
    ${header(depth)}
    ${body}
    ${footer()}
    <script src="${depth}script.js"></script>
  </body>
</html>
`;
}

module.exports = { pageShell };
