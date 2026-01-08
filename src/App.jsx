import React, { useState } from "react";
import Navbar from "./component/navbar.jsx";
import Editor from "@monaco-editor/react";
import Select from "react-select";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { RingLoader } from "react-spinners";
import Footer from "./component/Footer.jsx";

const options = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
];

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const App = () => {
  const [selectOption, setSelectOption] = useState(options[0]);
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [fixReport, setFixReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("editor"); // "editor" or "analysis"

  /* =========================
     REVIEW CODE (PRO TABLE)
  ========================== */
  const reviewCode = async () => {
    if (!code.trim()) {
      alert("Please enter code first.");
      return;
    }

    setLoading(true);
    setError("");
    setFixReport("");

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are a PRINCIPAL SOFTWARE ENGINEER reviewing production-ready code.

Language: ${selectOption.label}

STRICT RULES:
- Follow the exact section order below
- Use clear headings
- Use bullet points where appropriate
- Be critical and precise
- No emojis
- No tables
- No motivational or vague language
- If something is not found, explicitly say "Not detected"

--------------------------------
### 1. Overall Code Quality and it should be show as bold text and rating on 1 to 5 stars in using star emojis
- Rate the code as: Better / Good / Normal / Bad
- Explain the rating with concrete reasons
note: it should be between 2 lines only
--------------------------------
### 2. Intended Purpose and it should be show as bold text, also take space
- What the code is supposed to do
- What problem it aims to solve
note: it should be between 2 lines only and take space up and down
--------------------------------
### 3. Actual Behavior and it should be show as bold text, also take space
- How the code executes step by step
- Key variables, functions, and logic flow
note: it should be between 4 lines only and take space up and down
--------------------------------
### 4. Errors and Bugs and it should be show as bold text, also take space
- Syntax errors (if any)
- Runtime errors (if any)
- Logical bugs or incorrect assumptions
- Mention exact lines or statements when possible

--------------------------------
### 5. Improvement Recommendations and it should be show as bold text, also take space
- Specific refactors
- Better patterns or APIs
- Language-specific best practices
note: it should be between 4 lines only and take space up and down
--------------------------------
### 6. Final Verdict and it should be show as bold text, also take space
- Should this code be approved for production? Yes or No
- Short justification
note: it should be between 4 lines only and take space up and down
--------------------------------
CODE TO REVIEW:
${code}
`

      });

      setReview(result.text || "No review generated.");
      setActiveTab("analysis"); // Auto-switch to analysis on mobile
    } catch (err) {
      console.error(err);
      setError("❌ Review failed.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FIX CODE + FIX REPORT
  ========================== */
  const fixCode = async () => {
    if (!code.trim()) {
      alert("Please enter code first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are an expert software engineer.

Language: ${selectOption.label}

TASK 1:
Fix the code and return ONLY the fixed code.
No markdown. No explanation. No backticks.

TASK 2:
After the code, write a short FIX REPORT using this format:

### 🛠 Fix Summary
- What was fixed
- Where it was fixed
- Result after fix

Original Code:
${code}
        `,
      });

      const text = result.text || "";
      const splitIndex = text.indexOf("### 🛠 Fix Summary");

      if (splitIndex !== -1) {
        const fixedCode = text.slice(0, splitIndex).trim();
        const report = text.slice(splitIndex).trim();

        setCode(fixedCode); // ✅ update editor
        setFixReport(report); // ✅ show in review panel
        setActiveTab("analysis"); // Auto-switch to analysis on mobile
      } else {
        setCode(text.trim());
        setFixReport("Fix applied, but no detailed report returned.");
        setActiveTab("analysis");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Fix failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Mobile Tab Navigation - Only visible on mobile */}
      <div className="lg:hidden flex bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "editor"
              ? "text-white bg-zinc-800 border-b-2 border-indigo-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("analysis")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "analysis"
              ? "text-white bg-zinc-800 border-b-2 border-indigo-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Analysis
        </button>
      </div>

      <div className="flex flex-col lg:flex-row w-full bg-zinc-950">
        {/* LEFT PANEL - Editor */}
        <div
          className={`flex flex-col w-full lg:w-1/2 lg:border-r border-zinc-800 ${
            activeTab === "editor" ? "block" : "hidden lg:flex"
          }`}
          style={{ height: "calc(100vh - 90px - 49px)" }}
        >
          {/* Controls */}
          <div className="flex flex-col gap-2 p-3 bg-zinc-900 border-b border-zinc-800">
            <div className="w-full">
              <Select
                value={selectOption}
                onChange={setSelectOption}
                options={options}
                menuPortalTarget={document.body}
                styles={{
                  control: (b) => ({
                    ...b,
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    boxShadow: "none",
                    minHeight: "42px",
                  }),
                  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
                  menu: (b) => ({
                    ...b,
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                  }),
                  option: (b, s) => ({
                    ...b,
                    backgroundColor: s.isFocused ? "#27272a" : "transparent",
                    color: "#f4f4f5",
                    cursor: "pointer",
                  }),
                  singleValue: (b) => ({ ...b, color: "#f4f4f5" }),
                }}
              />
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={reviewCode}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
              >
                {loading ? "Processing..." : "Review Code"}
              </button>
              <button
                onClick={fixCode}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
              >
                {loading ? "Fixing..." : "Fix Code"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={selectOption.value}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                automaticLayout: true,
                scrollbar: {
                  vertical: "auto",
                  horizontal: "auto",
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>

        {/* RIGHT PANEL - Analysis */}
        <div
          className={`flex flex-col w-full lg:w-1/2 bg-zinc-900 ${
            activeTab === "analysis" ? "block" : "hidden lg:flex"
          }`}
          style={{ height: "calc(100vh - 90px - 49px)" }}
        >
          <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-900 sticky top-0 z-10">
            <h2 className="text-white text-base font-bold">AI Analysis</h2>
            {(review || fixReport) && !loading && (
              <button
                onClick={() => {
                  setReview("");
                  setFixReport("");
                  setError("");
                }}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors touch-manipulation"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 pb-6">
            {loading && (
              <div className="flex justify-center items-center h-full">
                <RingLoader color="#6366f1" size={60} />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && (review || fixReport) && (
              <div className="prose prose-invert max-w-none text-sm text-white prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white break-words">
                <Markdown>{fixReport || review}</Markdown>
              </div>
            )}

            {!loading && !error && !review && !fixReport && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <svg
                  className="w-16 h-16 text-zinc-700 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-zinc-500 text-sm">
                  Write or paste code, then click
                  <span className="text-indigo-400 font-medium">
                    {" "}
                    Review Code{" "}
                  </span>
                  or
                  <span className="text-emerald-400 font-medium">
                    {" "}
                    Fix Code{" "}
                  </span>
                  to see AI analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default App;