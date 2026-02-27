import fs from "fs";
import http from "http";
import path from "path";
import { URL } from "url";
import interviews from "../data/interviews.json";
import {
  composeInterviewPrompt,
  createSession,
  InterviewConfig,
  listSessions,
  updateSessionScore,
} from "../engine";

type Level = "junior" | "middle" | "senior";

type GeneratePayload = {
  templateId: string;
  level: Level;
  stack?: string[];
  focusBoost?: string[];
  extraContext?: string;
  simulation?: boolean;
  english?: boolean;
  timeboxedMinutes?: number;
  persistSession?: boolean;
};

type EvaluatePayload = {
  sessionId: string;
  score: number;
  notes?: string;
};

const START_PORT = Number(process.env.PORT ?? 4174);
const config = interviews as InterviewConfig;
const distRoot = path.resolve(process.cwd(), "web-ui/dist");
const devOrigin = process.env.WEB_DEV_ORIGIN ?? "http://localhost:5173";

function sendJson(res: http.ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendText(res: http.ServerResponse, status: number, text: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
}

function parseBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({} as T);
        return;
      }

      try {
        resolve(JSON.parse(raw) as T);
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function isLevel(value: string): value is Level {
  return value === "junior" || value === "middle" || value === "senior";
}

function assertTemplateSupportsLevel(templateId: string, level: Level) {
  const template = config.templates.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  if (!template.levels.includes(level)) {
    throw new Error(`Template "${templateId}" does not support level "${level}"`);
  }
}

function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
  const origin = req.headers.origin;
  if (origin && origin === devOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

function contentTypeFromFile(filePath: string) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

function sanitizePublicPath(urlPath: string) {
  const normalized = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(distRoot, normalized);
}

function serveStaticFile(res: http.ServerResponse, filePath: string) {
  if (!filePath.startsWith(distRoot)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    sendText(res, 404, "Not found");
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", contentTypeFromFile(filePath));
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  parsedUrl: URL,
) {
  if (req.method === "GET" && parsedUrl.pathname === "/api/templates") {
    sendJson(res, 200, {
      defaults: config.defaults,
      templates: config.templates.map((template) => ({
        id: template.id,
        title: template.title,
        levels: template.levels,
        focus: template.focus,
      })),
    });
    return true;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/api/sessions") {
    sendJson(res, 200, { sessions: listSessions() });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/generate") {
    const payload = await parseBody<GeneratePayload>(req);

    if (!payload.templateId || !payload.level || !isLevel(payload.level)) {
      throw new Error("templateId and valid level are required");
    }
    assertTemplateSupportsLevel(payload.templateId, payload.level);

    const prompt = composeInterviewPrompt(config, {
      templateId: payload.templateId,
      level: payload.level,
      stack: payload.stack,
      focusBoost: payload.focusBoost,
      extraContext: payload.extraContext,
      mode: {
        simulation: payload.simulation,
        english: payload.english,
        timeboxedMinutes: payload.timeboxedMinutes,
      },
    });

    const shouldPersist = payload.persistSession ?? true;
    const session = shouldPersist ? createSession(payload.templateId, payload.level) : null;

    sendJson(res, 200, {
      prompt,
      sessionId: session?.id ?? null,
      createdAt: session?.date ?? null,
    });
    return true;
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/evaluate") {
    const payload = await parseBody<EvaluatePayload>(req);
    if (!payload.sessionId) {
      throw new Error("sessionId is required");
    }
    if (!Number.isFinite(payload.score) || payload.score < 0 || payload.score > 10) {
      throw new Error("score must be a number between 0 and 10");
    }

    updateSessionScore(payload.sessionId, payload.score, payload.notes);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    setCorsHeaders(req, res);
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const handledApi = await handleApi(req, res, parsedUrl);
    if (handledApi) return;

    if (req.method !== "GET") {
      sendText(res, 405, "Method Not Allowed");
      return;
    }

    if (!fs.existsSync(distRoot)) {
      sendText(
        res,
        404,
        'Web build not found. Run "npm run web:build" and open http://localhost:4174 again.',
      );
      return;
    }

    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/index.html") {
      serveStaticFile(res, path.join(distRoot, "index.html"));
      return;
    }

    const staticPath = sanitizePublicPath(parsedUrl.pathname);
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      serveStaticFile(res, staticPath);
      return;
    }

    serveStaticFile(res, path.join(distRoot, "index.html"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    sendJson(res, 400, { error: message });
  }
});

function startServer(port: number) {
  server
    .once("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
        const nextPort = port + 1;
        // eslint-disable-next-line no-console
        console.warn(`Port ${port} is in use, retrying on ${nextPort}...`);
        startServer(nextPort);
        return;
      }
      throw error;
    })
    .listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API server running at http://localhost:${port}`);
    });
}

startServer(START_PORT);
