/** Add verified programs here; the home and About sections render this list. */
export const affiliations = [
  {
    name: "Startup India",
    relationship: "DPIIT-recognized startup",
    logo: "/supporters/startup-india.png",
    logoAlt: "Startup India logo",
    href: "https://www.startupindia.gov.in/",
    className: "affiliation-logo-startup",
  },
  {
    name: "Claude for Startups",
    relationship: "Startup program participant",
    logo: "/supporters/claude.png",
    logoAlt: "Claude logo",
    href: "https://claude.com/programs/startups",
    className: "affiliation-logo-claude",
  },
  {
    name: "Google for Startups Cloud Program",
    relationship: "Cloud program participant",
    logo: "/supporters/google-cloud.svg",
    logoAlt: "Google Cloud logo",
    href: "https://cloud.google.com/startup",
    className: "affiliation-logo-google",
  },
] as const;
