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
  },
});

console.log(`Listening on ${server.url}`);