const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { timingSafeEqual } = require("node:crypto");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const publicDirectory = path.join(__dirname, "public");
const privateMockupPath = "/studio/social-publisher";
const privateMockupPassword = process.env.SOCIAL_PUBLISHER_PASSWORD;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webp": "image/webp"
};

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff"
};

function resolvePublicFile(urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const decodedPath = decodeURIComponent(requestedPath.split("?")[0]);
  const filePath = path.resolve(publicDirectory, `.${decodedPath}`);

  if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    return null;
  }

  return filePath;
}

function isPrivateMockupRequest(url) {
  const urlPath = new URL(url, "http://localhost").pathname;
  return urlPath === privateMockupPath || urlPath.startsWith(`${privateMockupPath}/`);
}

function hasPrivateMockupAccess(request) {
  if (!privateMockupPassword) {
    return false;
  }

  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  try {
    const provided = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const expected = `josh:${privateMockupPassword}`;
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

const server = http.createServer(async (request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (isPrivateMockupRequest(request.url || "/")) {
    if (!privateMockupPassword) {
      response.writeHead(503, {
        ...securityHeaders,
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end("Private mockup access is not configured.");
      return;
    }

    if (!hasPrivateMockupAccess(request)) {
      response.writeHead(401, {
        ...securityHeaders,
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": 'Basic realm="Josh Social Publisher", charset="UTF-8"'
      });
      response.end("Authentication required.");
      return;
    }
  }

  const requestedUrl = new URL(request.url || "/", "http://localhost");
  const normalizedPath = requestedUrl.pathname === privateMockupPath || requestedUrl.pathname === `${privateMockupPath}/`
    ? `${privateMockupPath}/index.html`
    : request.url || "/";
  const filePath = resolvePublicFile(normalizedPath);

  if (!filePath) {
    response.writeHead(400, {
      ...securityHeaders,
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Bad request");
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    const cacheControl = isPrivateMockupRequest(request.url || "/")
      ? "no-store"
      : filePath.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=86400, stale-while-revalidate=604800"
      : "no-cache";
    response.writeHead(200, {
      ...securityHeaders,
      "Cache-Control": cacheControl,
      "Content-Type": contentType
    });
    response.end(body);
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        const notFoundPage = await readFile(path.join(publicDirectory, "404.html"));
        response.writeHead(404, {
          ...securityHeaders,
          "Cache-Control": "no-cache",
          "Content-Type": "text/html; charset=utf-8"
        });
        response.end(notFoundPage);
      } catch {
        response.writeHead(404, {
          ...securityHeaders,
          "Content-Type": "text/plain; charset=utf-8"
        });
        response.end("Not found");
      }
      return;
    }

    console.error(error);
    response.writeHead(500, {
      ...securityHeaders,
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Internal server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Furious Facades is listening on port ${port}`);
});
