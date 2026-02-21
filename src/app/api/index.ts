import { prisma } from "@/lib/prisma";
import { userSchema, validateName } from "@/lib/validation";

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://192.168.1.7:3000",
]);

function corsHeadersFor(request: Request): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  const allowOrigin = allowedOrigins.has(origin) ? origin : "http://localhost:3000";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // (opcional) ayuda con algunas redes/proxies
  };
}

function convertJsonData(request: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeadersFor(request), "Content-Type": "application/json" },
  });
}

const server = Bun.serve({
  port: 3001,
  routes: {
    "/test": async (request: Request) => {
      console.log("Hello, World!");
      return new Response("Hello, World!", { status: 200, headers: corsHeadersFor(request) });
    },

    "/data": async (request: Request) => {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeadersFor(request) });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeadersFor(request) });
      }

      const data = await request.json();
      console.log("Received data:", data);

      return convertJsonData(request, { status: "success", received: data });
    },

    "/consult": async (request: Request) => {
      if (request.method !== "GET") {
        return new Response("Error in consult", { status: 400,headers: corsHeadersFor(request) });
      }
      return convertJsonData(request, { response: "this is answer for consult with GET" });
    },

    "/update": async (request: Request) => {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeadersFor(request) });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeadersFor(request) });
      }

      try{
        const data = await request.json();

        //Validación Zod
        const parsed = userSchema.safeParse(data);
        if(!parsed.success) {
          const formattedErrors = parsed.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message,
          }));

          return new Response(
            JSON.stringify({
              status: "validation_error",
              errors: formattedErrors,
            }),
            {
              status: 400,
              headers: corsHeadersFor(request),
            }
          );
        }

        // Si la validación de zod es exitosa, guardar, de lo contrario responder error
        const user = await prisma.user.create({
          data: {
            name: data.nombre,
            lastName: data.apellido,
            age: Number(data.edad),
            email: data.correo,
          },
        });

        console.log("la informacion llego exitosamente");
        console.log("nombre: ", data.nombre);
        console.log("apellido: ", data.apellido);
        console.log("correo: ", data.correo);
        console.log("edad: ", data.edad);
        console.log(user);
        // return convertJsonData({ status: "success", received: data });
        return convertJsonData(request, user);
      }
      catch(error: any) {
        console.error("❌ Error en /update:", error);
        return convertJsonData(request, error?.message ?? "Unknown error", 500);
      }
    },

    "/delete": async (request: Request) => {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeadersFor(request) });
      }

      if (request.method !== "DELETE") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeadersFor(request) });
      }

      const data = await request.json();
      const parsed = validateName.safeParse(data); //Validación Zod

      if(!parsed.success) {
        const errors = parsed.error.issues.map((issue) => ({
          field: String(issue.path?.[0] ?? "unknown"),
          message: issue.message,
        }));
        return convertJsonData(request, {errors, status: "validation_error"}, 400);
      }

      try{
        console.log("el usuario " + data.nombre + " ha sido borrado");
        const deleted = await prisma.user.deleteMany({ where: { name: data.nombre }, });
        if(deleted.count > 0)
        {
          return convertJsonData(request, {status: "deleted", deletedCount: deleted.count});
        }
        return convertJsonData(request, {status: "Error", response: "The user does not exist"});
      }
      catch(error: any){
        return convertJsonData(request, { response: "Error: " + error.message, status:"error"});
      }
    },

  },
});

console.log(`Listening on ${server.url}`);