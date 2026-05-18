import { useEffect, useState } from "react";

export function Toast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onToast = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      window.setTimeout(() => setMessage(""), 3200);
    };
    window.addEventListener("padap:toast", onToast);
    return () => window.removeEventListener("padap:toast", onToast);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-lg border border-padap-green/30 bg-[#071414] px-4 py-3 text-sm text-white shadow-glow">
      {message}
    </div>
  );
}
