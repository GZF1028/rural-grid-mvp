import { useState } from "react";
import { Layout } from "./components/Layout";
import { PersonList } from "./pages/PersonList";
import { PersonDetail } from "./pages/PersonDetail";
import { PersonForm } from "./pages/PersonForm";
import { MapPage } from "./pages/MapPage";

type View =
  | { name: "list" }
  | { name: "detail"; id: string }
  | { name: "form"; id?: string }
  | { name: "map" };

export default function App() {
  const [view, setView] = useState<View>({ name: "list" });

  return (
    <Layout
      active={view.name === "map" ? "map" : "list"}
      onNavigate={(v) => setView(v === "map" ? { name: "map" } : { name: "list" })}
    >
      {view.name === "list" && (
        <PersonList
          onOpen={(id) => setView({ name: "detail", id })}
          onCreate={() => setView({ name: "form" })}
        />
      )}
      {view.name === "detail" && (
        <PersonDetail
          id={view.id}
          onBack={() => setView({ name: "list" })}
          onEdit={() => setView({ name: "form", id: view.id })}
        />
      )}
      {view.name === "form" && (
        <PersonForm
          id={view.id}
          onDone={() =>
            setView(view.id ? { name: "detail", id: view.id } : { name: "list" })
          }
          onCancel={() =>
            setView(view.id ? { name: "detail", id: view.id } : { name: "list" })
          }
        />
      )}
      {view.name === "map" && <MapPage />}
    </Layout>
  );
}
