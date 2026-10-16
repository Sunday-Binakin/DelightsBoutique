import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_API_URL;

export const server = setupServer(
  http.get(`${API}/api/products`, () =>
    HttpResponse.json({ data: [], page: 1, limit: 20, total: 0 }),
  ),
);

export { API };
