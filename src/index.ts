class OGPParser {
  title = "";
  description = "";
  imageUrl = "";
  faviconUrl = "";

  element(element: Element) {
    if (element.tagName === "meta") {
      switch (element.getAttribute("property")) {
        case "og:title":
        case "twitter:title":
          if (this.title) break;
          this.title = element.getAttribute("content") ?? "";
          break;
        case "description":
        case "og:description":
        case "twitter:description":
          if (this.description) break;
          this.description = element.getAttribute("content") ?? "";
          break;
        case "og:image":
        case "twitter:image":
          if (this.imageUrl) break;
          this.imageUrl = element.getAttribute("content") ?? "";
          break;
      }
    }
    if (element.tagName === "link") {
      switch (element.getAttribute("rel")) {
        case "icon":
        case "shortcut icon":
          if (this.faviconUrl) break;
          this.faviconUrl = element.getAttribute("href") ?? "";
          break;
      }
    }
  }

  text(text: Text) {
    if (this.title) return;
    this.title = text.text;
  }
}

const CACHE_DURATION = 60 * 10; // 1 hour

export default {
  async fetch(req, _, ctx) {
    const url = new URL(req.url);
    const cacheKey = new Request(url.toString(), req);
    const cache = caches.default;
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) return cachedResponse;

    const paramUrl = url.searchParams.get("url");
    if (paramUrl === null) {
      return new Response("Bad Request", { status: 400 });
    }

    const decodedUrl = decodeURIComponent(paramUrl);

    const siteRes = await fetch(decodedUrl);
    if (!siteRes.ok) {
      return new Response("Not Found", { status: 404 });
    }

    const ogp = new OGPParser();
    const res = new HTMLRewriter()
      .on("title", ogp)
      .on("meta", ogp)
      .on("link", ogp)
      .transform(siteRes);

    // wait the end of the transformation
    await res.text();

    if (ogp.imageUrl.startsWith("/")) {
      ogp.imageUrl = new URL(ogp.imageUrl, decodedUrl).toString();
    }
    if (ogp.faviconUrl.startsWith("/")) {
      ogp.faviconUrl = new URL(ogp.faviconUrl, decodedUrl).toString();
    }

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", `public, max-age=${CACHE_DURATION}`);

    const response = new Response(JSON.stringify(ogp), { headers });

    ctx.waitUntil(cache.put(cacheKey, response));

    return response;
  },
} as ExportedHandler;
