import React from "react";


function inlineFormat(text) {

    const parts = String(text).split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {

        if (
            part.startsWith("**") &&
            part.endsWith("**")
        ) {
            return (
                <strong
                    key={index}
                    className="font-bold text-white"
                >
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (
            part.startsWith("`") &&
            part.endsWith("`")
        ) {
            return (
                <code
                    key={index}
                    className="
                        rounded
                        bg-cyan-500/10
                        px-1.5
                        py-0.5
                        text-cyan-300
                        font-mono
                        text-xs
                    "
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        return part;
    });
}


export default function AIResponseRenderer({
    content
}) {

    if (!content) {
        return null;
    }

    const text =
        typeof content === "string"
            ? content
            : JSON.stringify(content, null, 2);

    const lines = text
        .replace(/\\n/g, "\n")
        .split("\n");

    const elements = [];

    let codeLines = [];
    let inCodeBlock = false;


    function flushCodeBlock() {

        if (!codeLines.length) {
            return;
        }

        elements.push(
            <pre
                key={`code-${elements.length}`}
                className="
                    my-4
                    overflow-x-auto
                    rounded-xl
                    border
                    border-white/10
                    bg-black/40
                    p-4
                    text-xs
                    leading-6
                    text-cyan-200
                    font-mono
                "
            >
                <code>
                    {codeLines.join("\n")}
                </code>
            </pre>
        );

        codeLines = [];
    }


    lines.forEach((rawLine, index) => {

        const line = rawLine.trim();

        if (line.startsWith("```")) {

            if (inCodeBlock) {
                flushCodeBlock();
            }

            inCodeBlock = !inCodeBlock;

            return;
        }


        if (inCodeBlock) {

            codeLines.push(rawLine);

            return;
        }


        if (!line) {

            elements.push(
                <div
                    key={`space-${index}`}
                    className="h-2"
                />
            );

            return;
        }


        const headingMatch =
            line.match(/^\*\*(.+?)\*\*:?\s*$/);

        if (headingMatch) {

            elements.push(
                <h4
                    key={`heading-${index}`}
                    className="
                        mt-5
                        mb-2
                        text-sm
                        font-bold
                        text-white
                    "
                >
                    {headingMatch[1]}
                </h4>
            );

            return;
        }


        if (line.startsWith("### ")) {

            elements.push(
                <h4
                    key={`heading-${index}`}
                    className="
                        mt-5
                        mb-2
                        font-bold
                        text-white
                    "
                >
                    {line.slice(4)}
                </h4>
            );

            return;
        }


        if (line.startsWith("## ")) {

            elements.push(
                <h3
                    key={`heading-${index}`}
                    className="
                        mt-5
                        mb-2
                        text-lg
                        font-bold
                        text-white
                    "
                >
                    {line.slice(3)}
                </h3>
            );

            return;
        }


        if (line.startsWith("# ")) {

            elements.push(
                <h3
                    key={`heading-${index}`}
                    className="
                        mt-5
                        mb-3
                        text-xl
                        font-bold
                        text-white
                    "
                >
                    {line.slice(2)}
                </h3>
            );

            return;
        }


        const bulletMatch =
            line.match(/^[-*]\s+(.+)/);

        if (bulletMatch) {

            elements.push(
                <div
                    key={`bullet-${index}`}
                    className="
                        flex
                        items-start
                        gap-3
                        pl-1
                        text-sm
                        leading-7
                        text-slate-300
                    "
                >
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                    <span>
                        {inlineFormat(bulletMatch[1])}
                    </span>
                </div>
            );

            return;
        }


        const numberedMatch =
            line.match(/^(\d+)\.\s+(.+)/);

        if (numberedMatch) {

            elements.push(
                <div
                    key={`number-${index}`}
                    className="
                        flex
                        items-start
                        gap-3
                        pl-1
                        text-sm
                        leading-7
                        text-slate-300
                    "
                >
                    <span
                        className="
                            mt-1
                            flex
                            h-5
                            min-w-5
                            items-center
                            justify-center
                            rounded-md
                            bg-cyan-500/10
                            px-1
                            text-[10px]
                            font-bold
                            text-cyan-400
                        "
                    >
                        {numberedMatch[1]}
                    </span>

                    <span>
                        {inlineFormat(numberedMatch[2])}
                    </span>
                </div>
            );

            return;
        }


        elements.push(
            <p
                key={`paragraph-${index}`}
                className="
                    text-sm
                    leading-7
                    text-slate-300
                "
            >
                {inlineFormat(line)}
            </p>
        );

    });


    if (inCodeBlock || codeLines.length) {
        flushCodeBlock();
    }


    return (
        <div className="space-y-1">
            {elements}
        </div>
    );
}
