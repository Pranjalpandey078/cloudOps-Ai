import { useState } from "react";

import { askAI } from "../../services/aiService";
import QuickActions from "./QuickActions";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function AIChat() {

    const [question, setQuestion] = useState("");

    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(false);

    async function send() {

        if (!question.trim()) return;

        setLoading(true);

        try {

            const response = await askAI(question);

            setAnswer(response);

        }

        catch (err) {

            console.log(err);

            console.log(err.response);

            setAnswer(

                err.response?.data?.message ||

                err.message ||

                "Unknown Error"

            );

        }

        setLoading(false);

    }

    return (

        <div
            className="
                rounded-3xl
                bg-white/5
                backdrop-blur-xl
                border
                border-cyan-500/20
                p-6
            "
        >

            <h2 className="text-2xl font-bold mb-5">

                AI Operations Center

            </h2>

            <QuickActions
                onSelect={setQuestion}
            />

            <textarea

                value={question}

                onChange={(e) => setQuestion(e.target.value)}

                placeholder="Ask anything about Linux, Docker, Kubernetes, AWS, Incidents..."

                className="
                    w-full
                    h-36
                    rounded-xl
                    bg-slate-900
                    p-4
                    outline-none
                "

            />

            <button

                onClick={send}

                className="
                    mt-4
                    px-6
                    py-3
                    rounded-xl
                    bg-cyan-500
                    hover:bg-cyan-400
                    font-semibold
                "

            >

                {

                    loading

                    ?

                    "Thinking..."

                    :

                    "Ask AI"

                }

            </button>

            <div
    className="
        mt-6
        rounded-xl
        bg-slate-950
        border
        border-cyan-500/20
        p-6
        whitespace-pre-wrap
        font-mono
        text-sm
        leading-7
        overflow-auto
        max-h-96
    "
>

    {answer}

</div>

            <CopyToClipboard text={answer}>

                <button

                    className="
                        mt-4
                        px-5
                        py-2
                        rounded-lg
                        bg-cyan-600
                        hover:bg-cyan-500
                        font-medium
                    "

                >

                    Copy Response

                </button>

            </CopyToClipboard>

        </div>

    );

}