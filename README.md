# OGP Fetch Worker

This is a simple worker that fetches the Open Graph Protocol (OGP) metadata from a given URL.

```bash
curl "https://ogp-fetcher.maximum.vc/?url=https://www.maximum.vc"
```

```json
{
  "title": "Maximum",
  "description": "埼玉大学のプログラミングサークル「Maximum」の公式サイトです。",
  "imageUrl": "https://maximum.vc/images/ogp.webp",
  "faviconUrl": "https://www.maximum.vc/images/favicon.ico"
}
```
