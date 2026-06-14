import { createFileRoute } from "@tanstack/react-router";
import { FieldServiceApp } from "@/components/FieldServiceApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Field Service Management" },
      { name: "description", content: "Mobile inspection & PDF report generator for marine radio equipment." },
    ],
  }),
  component: () => <FieldServiceApp />,
});
