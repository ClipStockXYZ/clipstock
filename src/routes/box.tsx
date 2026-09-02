import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/box")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
