import app from "@/backend/hono";

export function GET(req: Request) {
  return app.fetch(req);
}

export function POST(req: Request) {
  return app.fetch(req);
}
