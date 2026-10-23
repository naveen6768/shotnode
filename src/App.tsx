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
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";
import BlogTaxonomy from "./pages/blog/BlogTaxonomy";
import BlogAuthor from "./pages/blog/BlogAuthor";
import NotFoundPage from "./pages/NotFoundPage";

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
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/category/:slug" element={<BlogTaxonomy kind="category" />} />
        <Route path="/blog/tag/:slug" element={<BlogTaxonomy kind="tag" />} />
        <Route path="/blog/author/:slug" element={<BlogAuthor />} />
        <Route path="/blog/preview/:token" element={<BlogPost preview />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
