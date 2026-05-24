import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Setup } from "@/pages/Setup";
import { Grade } from "@/pages/Grade";
import { Results } from "@/pages/Results";
import { Evaluate } from "@/pages/Evaluate";
import { EssayDetail } from "@/pages/EssayDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="setup" element={<Setup />} />
        <Route path="grade" element={<Grade />} />
        <Route path="results" element={<Results />} />
        <Route path="evaluate" element={<Evaluate />} />
        <Route path="essays/:essayId" element={<EssayDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
