class OGPParser {
  title?: string;
  description?: string;
  imageUrl?: string;
  faviconUrl?: string;

  element(element: Element) {
    if (element.tagName === "meta") {
      switch (element.getAttribute("property")) {
        case "og:title":
          this.title ||= element.getAttribute("content") ?? "";
          break;
        case "twitter:title":
          this.title ||= element.getAttribute("content") ?? "";
          break;
        case "description":
          this.description ||= element.getAttribute("content") ?? "";
          break;
        case "og:description":
          this.description ||= element.getAttribute("content") ?? "";
          break;
        case "twitter:description":
          this.description ||= element.getAttribute("content") ?? "";
          break;
        case "og:image":
          this.imageUrl ||= element.getAttribute("content") ?? "";
          break;
        case "twitter:image":
          this.imageUrl ||= element.getAttribute("content") ?? "";
          break;
      }
    }
    if (element.tagName === "title") {
      this.title ||= element.textContent ?? "";
    }
    if (element.tagName === "link") {
      if (element.getAttribute("rel") === "icon") {
        this.faviconUrl ||= element.getAttribute("href") ?? "";
      }
    }
  }
}

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

    ogp.faviconUrl = new URL(ogp.faviconUrl ?? "", decodedUrl).toString();
    ogp.imageUrl = new URL(ogp.imageUrl ?? "", decodedUrl).toString();

    return new Response(JSON.stringify(ogp), {
      headers: { "Content-Type": "application/json" },
    });
  },
} as ExportedHandler;
