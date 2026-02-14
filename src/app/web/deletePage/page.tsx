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
            const res = await fetch("http://localhost:3001/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                toast("Falló el envío", {
                    description: `Error ${res.status}: ${text}`,
                });
                return;
            }

            const json = await res.json();
            console.log("Datos enviados correctamente ✅\n" + JSON.stringify(json));
            toast("Enviado por el servidor Bun", {
                description: JSON.stringify(json),
            });
        }
        catch(error:any){
            console.error("FETCH ERROR FULL:", error);
            let message = "Error desconocido";
            if (error instanceof TypeError) {
                message = "No se pudo conectar con el servidor. ¿Está corriendo en el puerto 3001?";
            }

            if (error?.message) {
                message = error.message;
            }

            toast.error("Error al enviar la solicitud ❌", {
                description: message,
                duration: 6000,
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