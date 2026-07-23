const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { createHmac, timingSafeEqual } = require("node:crypto");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const publicDirectory = path.join(__dirname, "public");
const privateMockupPath = "/studio/social-publisher";
const privateMockupPassword = process.env.SOCIAL_PUBLISHER_PASSWORD;
const privateSessionLifetimeSeconds = 60 * 60 * 12;

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

function isPrivateMockupLoginPath(url) {
  const urlPath = new URL(url, "http://localhost").pathname;
  return urlPath === `${privateMockupPath}/login` || urlPath === `${privateMockupPath}/login/`;
}

function isPrivateMockupSessionPath(url) {
  return new URL(url, "http://localhost").pathname === `${privateMockupPath}/session`;
}

function readCookie(request, name) {
  const entry = (request.headers.cookie || "").split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function signPrivateMockupSession(expiresAt) {
  return createHmac("sha256", privateMockupPassword).update(String(expiresAt)).digest("base64url");
}

function hasPrivateMockupAccess(request) {
  if (!privateMockupPassword) {
    return false;
  }

  const token = readCookie(request, "social_publisher_session");
  const [expiresAt, signature] = token?.split(".") || [];
  const expiresAtNumber = Number.parseInt(expiresAt, 10);
  if (!expiresAt || !signature || !Number.isSafeInteger(expiresAtNumber) || expiresAtNumber < Date.now()) {
    return false;
  }

  const expectedSignature = signPrivateMockupSession(expiresAt);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function readRequestBody(request, maximumLength = 2048) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maximumLength) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sessionCookie(request, expiresAt) {
  const secure = request.headers["x-forwarded-proto"] === "https" || !request.headers.host?.startsWith("localhost");
  const value = `${expiresAt}.${signPrivateMockupSession(expiresAt)}`;
  return `social_publisher_session=${encodeURIComponent(value)}; Path=${privateMockupPath}; Max-Age=${privateSessionLifetimeSeconds}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
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

    if (isPrivateMockupSessionPath(request.url || "/") && request.method === "POST") {
      try {
        const body = await readRequestBody(request);
        const password = new URLSearchParams(body).get("password") || "";
        const passwordBuffer = Buffer.from(password);
        const expectedBuffer = Buffer.from(privateMockupPassword);
        const passwordMatches = passwordBuffer.length === expectedBuffer.length && timingSafeEqual(passwordBuffer, expectedBuffer);

        if (passwordMatches) {
          const expiresAt = Date.now() + privateSessionLifetimeSeconds * 1000;
          response.writeHead(303, {
            ...securityHeaders,
            "Cache-Control": "no-store",
            "Location": `${privateMockupPath}/`,
            "Set-Cookie": sessionCookie(request, expiresAt)
          });
          response.end();
          return;
        }
      } catch {
        // Treat malformed or oversized sign-in attempts as invalid credentials.
      }

      response.writeHead(303, {
        ...securityHeaders,
        "Cache-Control": "no-store",
        "Location": `${privateMockupPath}/login/?error=1`
      });
      response.end();
      return;
    }

    if (!isPrivateMockupLoginPath(request.url || "/") && !hasPrivateMockupAccess(request)) {
      response.writeHead(303, {
        ...securityHeaders,
        "Cache-Control": "no-store",
        "Location": `${privateMockupPath}/login/`
      });
      response.end();
      return;
    }
  }

  const requestedUrl = new URL(request.url || "/", "http://localhost");
  const normalizedPath = requestedUrl.pathname === privateMockupPath || requestedUrl.pathname === `${privateMockupPath}/`
    ? `${privateMockupPath}/index.html`
    : isPrivateMockupLoginPath(request.url || "/")
      ? `${privateMockupPath}/login.html`
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
