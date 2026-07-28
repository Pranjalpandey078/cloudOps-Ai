import { useState } from "react";
import {
    FiCpu,
    FiSend,
    FiUser,
    FiZap
} from "react-icons/fi";

import {
    chatWithIncident
} from "../../services/incidentService";
import AIResponseRenderer from "./AIResponseRenderer";


export default function IncidentAIChat({
    incident
}) {

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const suggestedQuestions = [
        "What could have caused this incident?",
        "What should I check first?",
        "How can I prevent this from happening again?"
    ];


    async function askAI(customQuestion = null) {

        const finalQuestion =
            customQuestion || question.trim();

        if (!finalQuestion || loading) {
            return;
        }

        setError("");

        const userMessage = {
            role: "user",
            content: finalQuestion
        };

        setMessages(previous => [
            ...previous,
            userMessage
        ]);

        setQuestion("");
        setLoading(true);

        try {

            const result = await chatWithIncident(
                incident.id,
                finalQuestion
            );

            const response =
                result?.response ||
                result?.answer ||
                result?.analysis ||
                "AI completed the request but returned no readable response.";

            const aiMessage = {
                role: "assistant",
                content:
                    typeof response === "string"
                        ? response
                        : JSON.stringify(response, null, 2)
            };

            setMessages(previous => [
                ...previous,
                aiMessage
            ]);

        } catch (err) {

            console.error(
                "Incident AI chat failed:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to contact the AI assistant."
            );

        } finally {

            setLoading(false);

        }
    }


    function handleKeyDown(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();
            askAI();

        }
    }


    return (

        <div
            className="
                rounded-2xl
                border
                border-cyan-500/20
                bg-slate-950/40
                overflow-hidden
            "
        >

            {/* Header */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-6
                    py-5
                    border-b
                    border-white/10
                "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            bg-cyan-500/10
                            text-cyan-400
                        "
                    >
                        <FiCpu size={20} />
                    </div>

                    <div>

                        <h3 className="font-bold text-white">
                            Incident AI Copilot
                        </h3>

                        <p className="text-sm text-slate-400">
                            Ask questions about Incident #{incident.id}
                        </p>

                    </div>

                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-green-400
                    "
                >
                    <span
                        className="
                            w-2
                            h-2
                            rounded-full
                            bg-green-400
                        "
                    />

                    AI Ready
                </div>

            </div>


            <div className="p-6">

                {/* Empty state */}

                {messages.length === 0 && (

                    <div>

                        <div className="mb-5">

                            <p className="text-slate-300">
                                Investigate this incident with the AI assistant.
                                It has access to the incident's metric,
                                severity, threshold and description.
                            </p>

                        </div>


                        <p
                            className="
                                text-xs
                                uppercase
                                tracking-wider
                                text-slate-500
                                font-semibold
                                mb-3
                            "
                        >
                            Suggested questions
                        </p>


                        <div
                            className="
                                flex
                                flex-wrap
                                gap-3
                                mb-6
                            "
                        >

                            {suggestedQuestions.map(item => (

                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => askAI(item)}
                                    disabled={loading}
                                    className="
                                        text-sm
                                        text-slate-300
                                        px-4
                                        py-2.5
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        hover:border-cyan-500/40
                                        hover:text-cyan-300
                                        hover:bg-cyan-500/5
                                        transition
                                        disabled:opacity-50
                                    "
                                >
                                    {item}
                                </button>

                            ))}

                        </div>

                    </div>

                )}


                {/* Conversation */}

                {messages.length > 0 && (

                    <div
                        className="
                            space-y-5
                            mb-6
                            max-h-96
                            overflow-y-auto
                            pr-2
                        "
                    >

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className={
                                    message.role === "user"
                                        ? "flex justify-end"
                                        : "flex justify-start"
                                }
                            >

                                <div
                                    className={`
                                        max-w-[88%]
                                        rounded-2xl
                                        px-4
                                        py-4
                                        ${
                                            message.role === "user"
                                                ? "bg-cyan-500/10 border border-cyan-500/20"
                                                : "bg-white/5 border border-white/10"
                                        }
                                    `}
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            mb-2
                                        "
                                    >

                                        {message.role === "user"
                                            ? (
                                                <FiUser
                                                    className="text-cyan-400"
                                                />
                                            )
                                            : (
                                                <FiZap
                                                    className="text-cyan-400"
                                                />
                                            )
                                        }

                                        <span
                                            className="
                                                text-xs
                                                font-semibold
                                                text-slate-400
                                            "
                                        >
                                            {message.role === "user"
                                                ? "You"
                                                : "AI Copilot"
                                            }
                                        </span>

                                    </div>

                                    {message.role === "assistant"
                                        ? (
                                            <AIResponseRenderer
                                                content={message.content}
                                            />
                                        )
                                        : (
                                            <p
                                                className="
                                                    text-sm
                                                    text-slate-200
                                                    whitespace-pre-wrap
                                                    leading-7
                                                "
                                            >
                                                {message.content}
                                            </p>
                                        )
                                    }

                                </div>

                            </div>

                        ))}


                        {loading && (

                            <div className="flex justify-start">

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        px-4
                                        py-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            text-sm
                                            text-slate-400
                                        "
                                    >

                                        <FiZap
                                            className="
                                                text-cyan-400
                                                animate-pulse
                                            "
                                        />

                                        AI is investigating...

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                )}


                {/* Error */}

                {error && (

                    <div
                        className="
                            mb-4
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/5
                            px-4
                            py-3
                            text-sm
                            text-red-400
                        "
                    >
                        {error}
                    </div>

                )}


                {/* Input */}

                <div
                    className="
                        flex
                        items-end
                        gap-3
                    "
                >

                    <textarea
                        value={question}
                        onChange={
                            event =>
                                setQuestion(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        rows="2"
                        placeholder="Ask about root cause, troubleshooting or prevention..."
                        className="
                            flex-1
                            resize-none
                            rounded-xl
                            border
                            border-white/10
                            bg-slate-950/60
                            px-4
                            py-3
                            text-sm
                            text-white
                            placeholder:text-slate-500
                            outline-none
                            focus:border-cyan-500/50
                            transition
                        "
                    />

                    <button
                        type="button"
                        onClick={() => askAI()}
                        disabled={
                            loading ||
                            !question.trim()
                        }
                        className="
                            h-[50px]
                            px-5
                            rounded-xl
                            bg-cyan-400
                            text-slate-950
                            font-bold
                            flex
                            items-center
                            gap-2
                            hover:bg-cyan-300
                            transition
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                        "
                    >
                        <FiSend />

                        Ask AI
                    </button>

                </div>


                <p
                    className="
                        mt-3
                        text-xs
                        text-slate-500
                    "
                >
                    AI suggestions should be validated before applying
                    changes to production infrastructure.
                </p>

            </div>

        </div>

    );
}
