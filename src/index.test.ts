import { SELF } from "cloudflare:test";

describe("OGP Fetch Worker", () => {
  it("should return 400 when url is not provided", async () => {
    const response = await SELF.fetch("http://localhost");
    expect(response.status).toBe(400);
  });

  it("should return 200 when url is provided", async () => {
    const response = await SELF.fetch(
      "http://localhost?url=https://maximum.vc"
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toEqual({
      title: "Maximum",
      description:
        "埼玉大学のプログラミングサークル「Maximum」の公式サイトです。",
      imageUrl: "https://maximum.vc/images/ogp.webp",
      faviconUrl: "https://maximum.vc/images/favicon.ico",
    });
  });
});
