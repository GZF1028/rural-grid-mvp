/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#3E7C4F", dark: "#2F6B3A" },
        accent: { DEFAULT: "#C9A227" },
        paper: "#FAF7F0",
        ink: { DEFAULT: "#1F2A24", secondary: "#5C6B63" },
        line: "#E3DDD0",
        risk: { high: "#C0392B", mid: "#D98A2B", low: "#3E7C4F" },
      },
      borderRadius: {
        card: "12px",
        control: "8px",
        tag: "6px",
      },
      fontSize: {
        "page-title": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "card-title": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "22px" }],
        caption: ["12px", { lineHeight: "18px" }],
      },
    },
  },
  plugins: [],
};
