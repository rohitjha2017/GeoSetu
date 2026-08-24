import { useState, useRef, useEffect } from "react";
import { askCopilot } from "../services/api.js";

const SUGGESTIONS = [
  "Why is this village classified as high risk?",
  "Why should this village be relocated?",
  "Which relocation site is best?",
  "How many people can the top site accommodate?",
  "What problems could residents face after relocation?"
];

export default function CopilotChat({ villageId, siteId, waterLevelM }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: villageId
        ? "I have this village's current data loaded. Ask me why it's classified this way, or about relocation options."
        : "Select a village first, or ask a general question about current scenario risk levels."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askCopilot({ message: question, villageId, siteId, waterLevelM });
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, the Copilot couldn't be reached. Please check the server connection and try again." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">AI Relocation Copilot</p>
        <p className="text-xs text-slate-400">Answers are grounded in this application's actual data.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">Thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-100 px-4 py-2">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Copilot a question…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
        <p className="mt-2 text-[11px] text-slate-400">
          AI-generated explanations are decision-support only and should not replace official disaster-management instructions.
        </p>
      </div>
    </div>
  );
}
