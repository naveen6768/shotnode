/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import DeleteAccount from "./components/DeleteAccount";
import RemixShareLanding from "./pages/RemixShareLanding";
import TemplateShareLanding from "./pages/TemplateShareLanding";

export default function App() {
  return (
    <Routes>
      <Route path="/r/:packageId" element={<RemixShareLanding />} />
      <Route path="/t/:templateId" element={<TemplateShareLanding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Route>
    </Routes>
  );
}
