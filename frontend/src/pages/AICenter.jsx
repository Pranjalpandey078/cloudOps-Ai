import { useState } from "react";
import {
    FiCpu,
    FiSend,
    FiRefreshCw,
    FiActivity,
    FiShield,
    FiServer,
    FiZap
} from "react-icons/fi";

import { askAI } from "../services/aiService";

export default function AICenter() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const suggestions = [
        "Analyze the current system health",
        "What should I check when CPU usage is very high?",
        "How can I troubleshoot a Docker container?",
        "How can I troubleshoot Kubernetes pods?",
        "Give me a safe DevOps diagnostic checklist",
        "Explain how to investigate a production incident"
    ];

    async function sendQuestion(customQuestion = "") {
        const finalQuestion = (
            customQuestion || question
        ).trim();

        if (!finalQuestion || loading) {
            return;
        }

        setError("");
        setQuestion("");

        setMessages((current) => [
            ...current,
            {
                role: "user",
                content: finalQuestion
            }
        ]);

        setLoading(true);

        try {
            const answer = await askAI(finalQuestion);

            setMessages((current) => [
                ...current,
                {
                    role: "assistant",
                    content:
                        typeof answer === "string"
                            ? answer
                            : JSON.stringify(answer, null, 2)
                }
            ]);
        } catch (err) {
            console.error("AI Center request failed:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to connect to CloudOps AI."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendQuestion();
        }
    }

    function clearConversation() {
        if (loading) {
            return;
        }

        setMessages([]);
        setError("");
    }

    return (
        <div className="p-6 text-white md:p-8">

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiCpu size={24} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            AI Operations Center
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Intelligent assistance for incidents and infrastructure
                        </p>
                    </div>

                </div>

                <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    AI Ready
                </div>

            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                <FeatureCard
                    icon={<FiActivity size={20} />}
                    title="Incident Analysis"
                    description="Analyze operational incidents and investigate possible causes."
                />

                <FeatureCard
                    icon={<FiShield size={20} />}
                    title="Safe Diagnostics"
                    description="Get practical read-only troubleshooting guidance."
                />

                <FeatureCard
                    icon={<FiServer size={20} />}
                    title="Infrastructure"
                    description="Ask about Linux, Docker, Kubernetes and AWS."
                />

                <FeatureCard
                    icon={<FiZap size={20} />}
                    title="DevOps Guidance"
                    description="Get clear recommendations for operational problems."
                />

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">

                <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">

                    <div className="flex items-center gap-3">

                        <FiCpu className="text-cyan-400" />

                        <div>
                            <h2 className="font-semibold">
                                CloudOps AI Assistant
                            </h2>

                            <p className="text-xs text-slate-500">
                                Ask a question about your infrastructure
                            </p>
                        </div>

                    </div>

                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={clearConversation}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-40"
                        >
                            <FiRefreshCw size={14} />
                            Clear
                        </button>
                    )}

                </div>

                <div className="min-h-[430px] max-h-[620px] overflow-y-auto p-5">

                    {messages.length === 0 && (
                        <div className="mx-auto max-w-3xl py-10">

                            <div className="mb-8 text-center">

                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600">
                                    <FiCpu size={30} />
                                </div>

                                <h3 className="text-2xl font-semibold">
                                    How can I help?
                                </h3>

                                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
                                    Ask CloudOps AI about incidents, servers,
                                    containers, Kubernetes, AWS or DevOps troubleshooting.
                                </p>

                            </div>

                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Suggested questions
                            </p>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                                {suggestions.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => sendQuestion(item)}
                                        disabled={loading}
                                        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-slate-300 hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-40"
                                    >
                                        {item}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                    {messages.length > 0 && (
                        <div className="mx-auto max-w-4xl space-y-5">

                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={
                                        message.role === "user"
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                    }
                                >

                                    <div
                                        className={
                                            message.role === "user"
                                                ? "max-w-[90%] rounded-2xl bg-cyan-900 px-5 py-4"
                                                : "max-w-[90%] rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4"
                                        }
                                    >

                                        <div className="mb-2 text-xs font-semibold text-slate-500">
                                            {message.role === "user"
                                                ? "You"
                                                : "CloudOps AI"}
                                        </div>

                                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                                            {message.content}
                                        </p>

                                    </div>

                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-slate-400">
                                        AI is analyzing...
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {error && (
                    <div className="mx-5 mb-4 rounded-xl border border-red-500 bg-red-950 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="border-t border-slate-700 bg-slate-900 p-4">

                    <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3">

                        <textarea
                            value={question}
                            onChange={(event) => {
                                setQuestion(event.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            rows={2}
                            placeholder="Ask CloudOps AI a question..."
                            className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none"
                        />

                        <button
                            type="button"
                            onClick={() => sendQuestion()}
                            disabled={loading || !question.trim()}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
                            title="Send"
                        >
                            <FiSend size={18} />
                        </button>

                    </div>

                    <p className="mt-2 text-center text-xs text-slate-600">
                        Enter to send. Shift + Enter for a new line.
                    </p>

                </div>

            </div>

        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
                {icon}
            </div>

            <h3 className="font-semibold text-white">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}
