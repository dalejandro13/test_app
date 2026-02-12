import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validation";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function convertJsonData(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const server = Bun.serve({
  port: 3001,
  routes: {
    "/test": async (request: Request) => {
      console.log("Hello, World!");
      return new Response("Hello, World!", { status: 200, headers: corsHeaders });
    },

    "/data": async (request: Request) => {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
      }

      const data = await request.json();
      console.log("Received data:", data);

      return convertJsonData({ status: "success", received: data });
    },

    "/consult": async (request: Request) => {
      if (request.method !== "GET") {
        return new Response("Error in consult", { status: 400,headers: corsHeaders });
      }
      return convertJsonData({ response: "this is answer for consult with GET" });
    },

    "/update": async (request: Request) => {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
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
              headers: corsHeaders,
            }
          );
        }

        // Si la validación de zod es exitosa, guardar, de lo contrario responder error
        const user = await prisma.user.create({
          data: {
            name: data.nombre,
            lastName: data.apellido,
            age: data.edad,
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
        return convertJsonData(user);
      }
      catch(error: any) {
        console.error("❌ Error en /update:", error);
        return new Response(
          JSON.stringify({
            status: "error",
            message: error?.message ?? "Unknown error",
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    },
  },
});

console.log(`Listening on ${server.url}`);