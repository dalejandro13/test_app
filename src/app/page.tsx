"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation";

export default function Home() {

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [edad, setEdad] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const router = useRouter(); //Inicializa el router

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault(); // evita recarga del form
    setLoading(true);

    try {
      // alert(`Enviando: ${nombre} ${apellido}, edad ${edad}`);
      const payload = { nombre, apellido, correo, edad };

      const res = await fetch("http://localhost:3001/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // mode: "cors",
      });

      if (!res.ok) {
        const text = await res.text();

        setServerMessage(`Error ${res.status}: ${text}`);

        toast("Falló el envío ❌", {
          description: `Error ${res.status}: ${text}`,
        });
        return;
      }

      const json = await res.json();

      setServerMessage("Datos enviados correctamente ✅\n" + JSON.stringify(json));

      toast("Enviado al servidor Bun ✅", {
        description: JSON.stringify(json),
      });

      // opcional: limpiar form
      setNombre("");
      setApellido("");
      setCorreo("")
      setEdad("");
    } 
    catch (err: any) {
      console.log("FETCH ERROR:", err);
      setServerMessage("FETCH ERROR:" + err);
      toast("ha fallado el envío", {
        description: String(err?.message ?? err ?? "Error desconocido"),
      });
    } 
    finally {
      setLoading(false);
    }
  }

  function handleClick() {
    // alert("Botón presionado!");
    toast("un evento ha sido creado", {
      description: "Botón presionado",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    })
  };

  return (
    <main className="min-h-screen flex flex-col gap-8 items-center justify-center bg-black">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 items-center w-full max-w-md">
        <div className="gap-4 flex flex-row items-center">
          <label className="text-xl text-white">Ingresa tu nombre:</label>
          <input className="pl-2 text-white border border-white rounded-md bg-transparent outline-none" type="text" placeholder="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required/>
        </div>

        <div className="gap-4 flex flex-row items-center">
          <label className="text-xl text-white">Ingresa tu apellido:</label>
          <input className="pl-2 text-white border border-white rounded-md bg-transparent outline-none" type="text" placeholder="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required/>
        </div>

        <div className="gap-4 flex flex-row items-center">
          <label className="text-xl text-white">Ingresa tu correo:</label>
          <input className="pl-2 text-white border border-white rounded-md bg-transparent outline-none" type="text" placeholder="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required/>
        </div>

        <div className="gap-4 flex flex-row items-center">
          <label className="text-xl text-white">Ingresa tu edad:</label>
          <input className="pl-2 text-white border border-white rounded-md bg-transparent outline-none" type="number" placeholder="edad" min="0" value={edad} onChange={(e) => setEdad(e.target.value === "" ? "" : Number(e.target.value))} required/>
        </div>

        <div className="flex flex-row gap-4 items-center">
          <Button type="submit" disabled={loading}> {loading ? "Enviando..." : "Enviar"} </Button>
          <Button type="button" onClick={() => router.push("/web/deletePage")}> Siguiente pagina </Button>
        </div>
      </form>

      <label className={`text-xl ${ serverMessage?.includes("Error") ? "text-red-500" : "text-green-500" }`} >
        {serverMessage ?? ""}
      </label>

    </main>
  );
}
