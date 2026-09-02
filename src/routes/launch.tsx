import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/launch")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
