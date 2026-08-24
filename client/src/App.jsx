import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import AuthorityLayout from "./layouts/AuthorityLayout.jsx";
import AuthorityDashboard from "./pages/AuthorityDashboard.jsx";
import AuthorityMap from "./pages/AuthorityMap.jsx";
import VillageAnalysis from "./pages/VillageAnalysis.jsx";
import RelocationRecommendations from "./pages/RelocationRecommendations.jsx";
import Copilot from "./pages/Copilot.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import PublicHome from "./pages/PublicHome.jsx";
import PublicCheck from "./pages/PublicCheck.jsx";
import PublicVillage from "./pages/PublicVillage.jsx";
import PublicSafety from "./pages/PublicSafety.jsx";
import PublicLocations from "./pages/PublicLocations.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/authority" element={<AuthorityLayout />}>
        <Route index element={<AuthorityDashboard />} />
        <Route path="map" element={<AuthorityMap />} />
        <Route path="village/:id" element={<VillageAnalysis />} />
        <Route path="relocation/:id" element={<RelocationRecommendations />} />
        <Route path="copilot" element={<Copilot />} />
      </Route>

      <Route path="/public" element={<PublicLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="check" element={<PublicCheck />} />
        <Route path="village/:id" element={<PublicVillage />} />
        <Route path="safety" element={<PublicSafety />} />
        <Route path="locations" element={<PublicLocations />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
