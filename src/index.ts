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
    if (element.tagName === "title") {
      if (this.title) return;
      this.title = element.textContent ?? "";
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
}

const CACHE_DURATION = 60 * 60; // 1 hour

export default {
  async fetch(req) {
    const url = new URL(req.url);

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

    return new Response(JSON.stringify(ogp), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}`,
      },
    });
  },
} as ExportedHandler;
