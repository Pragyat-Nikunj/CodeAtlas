import React from "react";

export default function Footer() {
  return (
    <footer className=" py-6 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-6 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} CodeAtlas AI
        </p>
      </div>
    </footer>
  );
}