"use client"

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import React, { useState } from "react";

export default function Home() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    
    async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault(); // evita recarga del form
        try {
            const payload = { nombre };
            console.log("uno");
            const res = await fetch("http://localhost:3001/deletePage", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log("dos");

            if (!res.ok) {
                console.log("tres");
                const text = await res.text();

                toast("Falló el envío ❌", {
                    description: `Error ${res.status}: ${text}`,
                });
                return;
            }
            console.log("cuatro");

            const json = await res.json();
            console.log("Datos enviados correctamente ✅\n" + JSON.stringify(json));
            toast("Enviado al servidor Bun ✅", {
                description: JSON.stringify(json),
            });
        }
        catch(error:any){
            console.log("FETCH ERROR:", error);
            toast("ha fallado el envío", {
                description: String(error?.message ?? error ?? "Error desconocido"),
            });
        }
    }

    return (
        <main className="min-h-screen flex flex-col gap-8 items-center justify-center bg-black text-white">
            <Label className="text-3xl"> Borrar informacion </Label>
            <form onSubmit={onSubmit} className="flex flex-col items-center gap-6"> 
                <div className="flex flex-row gap-4">
                    <Label className="whitespace-nowrap text-xl"> Ingresa el nombre a borrar: </Label>
                    <Input className="text-white bg-black border-white selection:bg-blue-500 selection:text-white" type="text" id="nombre" onChange={(e) => setNombre(e.target.value)} required/>
                </div>

                <Button type="submit"> borrar informacion </Button>
                <Button type="button" onClick={() => router.back()}> Regresar </Button>
            </form>
        </main>
    );
}