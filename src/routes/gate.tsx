import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/gate")({ component: Gate });

function Gate() {
  return <Navigate to="/" />;
}
