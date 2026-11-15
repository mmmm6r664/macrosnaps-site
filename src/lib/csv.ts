/** CSV cell, quoted, with spreadsheet formula injection blocked. */
export const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;
export const csv = (head: string[], rows: unknown[][]) => [head.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n");
export const csvResponse = (body: string, name: string) =>
  new Response("﻿" + body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" } });
