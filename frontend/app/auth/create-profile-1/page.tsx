import { Suspense } from "react";
import CreateProfile1Client from "./CreateProfile1Client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Cargando...</div>}>
      <CreateProfile1Client />
    </Suspense>
  );
}