import { Suspense } from "react";
import CreateProfile2Client from "./CreateProfile2Client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4 py-12">Cargando...</div>}>
      <CreateProfile2Client />
    </Suspense>
  );
}