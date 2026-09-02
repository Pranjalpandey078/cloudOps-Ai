import {
    FiTerminal,
    FiBox,
    FiCloud,
    FiCopy,
    FiCheck,
    FiShield,
    FiClock,
    FiXCircle,
    FiCheckCircle,
    FiLock,
    FiSend
} from "react-icons/fi";

import { useEffect, useState } from "react";

import {
    requestRemediation,
    getIncidentRemediations,
    approveRemediation,
    rejectRemediation,
    executeRemediation,
    getRemediationVerification
} from "../../services/remediationService";


export default function IncidentRemediation({
    incidentId,
    remediation
}) {

    const [copied, setCopied] = useState("");
    const [executions, setExecutions] = useState([]);
    const [loadingKey, setLoadingKey] = useState("");
    const [error, setError] = useState("");
    const [verifications, setVerifications] = useState({});


    useEffect(() => {

        if (incidentId) {
            loadHistory();
        }

    }, [incidentId]);


    async function loadHistory() {

        try {

            const data = await getIncidentRemediations(
                incidentId
            );

            setExecutions(data);

            const results = await Promise.all(
                data.map(async item => {

                    try {

                        const verification =
                            await getRemediationVerification(
                                item.id
                            );

                        return [
                            item.id,
                            verification
                        ];

                    } catch (err) {

                        console.error(
                            "Verification load failed for execution:",
                            item.id,
                            err
                        );

                        return [
                            item.id,
                            null
                        ];
                    }
                })
            );

            const verificationMap = {};

            results.forEach(
                ([executionId, verification]) => {

                    if (verification) {
                        verificationMap[executionId] =
                            verification;
                    }
                }
            );

            setVerifications(
                verificationMap
            );

        } catch (err) {

            console.error(
                "Failed to load remediation history:",
                err
            );

            setError(
                "Failed to load remediation history."
            );
        }
    }

    async function loadVerification(executionId) {

        try {

            const data =
                await getRemediationVerification(
                    executionId
                );

            setVerifications(prev => ({
                ...prev,
                [executionId]: data
            }));

        } catch (err) {

            console.error(
                "Failed to load remediation verification:",
                err
            );

        }
    }


    if (!remediation) {
        return null;
    }


    function clean(value) {

        if (!value) {
            return "";
        }

        if (typeof value === "object") {

            if (value.remediation) {
                return clean(value.remediation);
            }

            return Object.values(value)
                .map(item => clean(item))
                .filter(Boolean)
                .join("\n");
        }

        return String(value)
            .replace(/\\n/g, "\n")
            .replace(/\*\*/g, "")
            .trim();
    }


    const text = clean(remediation);


    function extractSection(start, nextSections = []) {

        const lower = text.toLowerCase();

        const startIndex = lower.indexOf(
            start.toLowerCase()
        );

        if (startIndex === -1) {
            return "";
        }

        const contentStart =
            startIndex + start.length;

        let endIndex = text.length;

        nextSections.forEach(section => {

            const index = lower.indexOf(
                section.toLowerCase(),
                contentStart
            );

            if (
                index !== -1 &&
                index < endIndex
            ) {
                endIndex = index;
            }

        });

        return text
            .slice(contentStart, endIndex)
            .replace(/^[:\s-]+/, "")
            .trim();
    }


    const sections = [

        {
            key: "linux",
            executionType: "LINUX",
            title: "Linux Diagnostics",
            subtitle: "Host-level investigation",
            icon: <FiTerminal />,
            content: extractSection(
                "Linux Commands",
                [
                    "Docker Commands",
                    "Kubernetes Commands",
                    "AWS Actions"
                ]
            )
        },

        {
            key: "docker",
            executionType: "DOCKER",
            title: "Docker Diagnostics",
            subtitle: "Container investigation",
            icon: <FiBox />,
            content: extractSection(
                "Docker Commands",
                [
                    "Kubernetes Commands",
                    "AWS Actions"
                ]
            )
        },

        {
            key: "kubernetes",
            executionType: "KUBERNETES",
            title: "Kubernetes Diagnostics",
            subtitle: "Cluster and workload checks",
            icon: <FiBox />,
            content: extractSection(
                "Kubernetes Commands",
                [
                    "AWS Actions"
                ]
            )
        },

        {
            key: "aws",
            executionType: "AWS",
            title: "AWS Actions",
            subtitle: "Cloud infrastructure checks",
            icon: <FiCloud />,
            content: extractSection(
                "AWS Actions"
            )
        }

    ];


    function getCommands(content) {

        if (!content) {
            return [];
        }

        const validPrefixes = [
            "uptime",
            "df ",
            "free ",
            "ps ",
            "top ",
            "docker ",
            "kubectl ",
            "aws "
        ];

        return content
            .split("\n")
            .map(line => line.trim())
            .map(line =>
                line
                    .replace(/^[-*]\s*/, "")
                    .replace(/^\d+\.\s*/, "")
                    .replace(/^`+|`+$/g, "")
                    .replace(/^\$\s*/, "")
                    .trim()
            )
            .filter(line => {

                if (!line) {
                    return false;
                }

                if (line.toUpperCase() === "NONE") {
                    return false;
                }

                const normalized =
                    line.toLowerCase();

                return validPrefixes.some(
                    prefix =>
                        normalized === prefix.trim() ||
                        normalized.startsWith(prefix)
                );
            });
    }


    function findExecution(
        executionType,
        command
    ) {

        return executions.find(
            item =>
                item.execution_type === executionType &&
                item.command_text.trim() === command.trim()
        );
    }


    async function copyCommand(key, command) {

        try {

            await navigator.clipboard.writeText(
                command
            );

            setCopied(key);

            setTimeout(() => {
                setCopied("");
            }, 1800);

        } catch (err) {

            console.error(
                "Failed to copy remediation:",
                err
            );

        }
    }


    async function handleRequest(
        section,
        command,
        commandKey
    ) {

        try {

            setLoadingKey(commandKey);
            setError("");

            const response = await requestRemediation(
                incidentId,
                section.executionType,
                command
            );

            const execution =
                response?.data?.execution;

            if (execution) {

                setExecutions(prev => [
                    execution,
                    ...prev.filter(
                        item =>
                            item.id !== execution.id
                    )
                ]);

            } else {

                await loadHistory();

            }

        } catch (err) {

            console.error(
                "Remediation request failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to create remediation request."
            );

        } finally {

            setLoadingKey("");

        }
    }


    async function handleApprove(
        execution,
        commandKey
    ) {

        try {

            setLoadingKey(commandKey);
            setError("");

            const response =
                await approveRemediation(
                    execution.id
                );

            const updated = response?.data;

            if (updated) {

                setExecutions(prev =>
                    prev.map(item =>
                        item.id === updated.id
                            ? updated
                            : item
                    )
                );

            } else {

                await loadHistory();

            }

        } catch (err) {

            console.error(
                "Approval failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to approve remediation."
            );

        } finally {

            setLoadingKey("");

        }
    }


    async function handleExecute(
        execution,
        commandKey
    ) {

        try {

            setLoadingKey(commandKey);
            setError("");

            const response =
                await executeRemediation(
                    execution.id
                );

            const updated = response?.data;

            if (updated) {

                setExecutions(prev =>
                    prev.map(item =>
                        item.id === updated.id
                            ? updated
                            : item
                    )
                );

                if (
                    updated.execution_status ===
                    "SUCCESS"
                ) {
                    await loadVerification(
                        updated.id
                    );
                }

            } else {

                await loadHistory();

            }

        } catch (err) {

            console.error(
                "Execution failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to execute remediation."
            );

            await loadHistory();

        } finally {

            setLoadingKey("");

        }
    }


    async function handleReject(
        execution,
        commandKey
    ) {

        try {

            setLoadingKey(commandKey);
            setError("");

            const response =
                await rejectRemediation(
                    execution.id
                );

            const updated = response?.data;

            if (updated) {

                setExecutions(prev =>
                    prev.map(item =>
                        item.id === updated.id
                            ? updated
                            : item
                    )
                );

            } else {

                await loadHistory();

            }

        } catch (err) {

            console.error(
                "Rejection failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to reject remediation."
            );

        } finally {

            setLoadingKey("");

        }
    }


    function statusConfig(status) {

        switch (status) {

            case "PENDING":
                return {
                    label: "Pending Approval",
                    className:
                        "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
                    icon: <FiClock />
                };

            case "APPROVED":
                return {
                    label: "Approved",
                    className:
                        "text-green-300 bg-green-500/10 border-green-500/20",
                    icon: <FiCheckCircle />
                };

            case "RUNNING":
                return {
                    label: "Running",
                    className:
                        "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
                    icon: <FiClock />
                };

            case "SUCCESS":
                return {
                    label: "Success",
                    className:
                        "text-green-300 bg-green-500/10 border-green-500/20",
                    icon: <FiCheckCircle />
                };

            case "FAILED":
                return {
                    label: "Failed",
                    className:
                        "text-red-300 bg-red-500/10 border-red-500/20",
                    icon: <FiXCircle />
                };

            case "REJECTED":
                return {
                    label: "Rejected",
                    className:
                        "text-slate-300 bg-slate-500/10 border-slate-500/20",
                    icon: <FiXCircle />
                };

            case "BLOCKED":
                return {
                    label: "Blocked by Policy",
                    className:
                        "text-red-300 bg-red-500/10 border-red-500/20",
                    icon: <FiLock />
                };

            default:
                return null;
        }
    }


    function formatDate(value) {

        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }


    return (

        <div
            className="
                rounded-2xl
                border
                border-emerald-500/20
                bg-emerald-500/[0.03]
                p-6
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-5
                    mb-6
                "
            >

                <div className="flex items-start gap-3">

                    <div
                        className="
                            w-11
                            h-11
                            rounded-xl
                            bg-emerald-500/10
                            border
                            border-emerald-500/20
                            flex
                            items-center
                            justify-center
                            text-emerald-400
                            text-xl
                        "
                    >
                        <FiShield />
                    </div>

                    <div>

                        <h4 className="font-bold text-lg">
                            AI Remediation Runbook
                        </h4>

                        <p className="text-sm text-slate-400 mt-1">
                            Safety-validated diagnostic and recovery workflow
                        </p>

                    </div>

                </div>

                <div
                    className="
                        text-xs
                        text-emerald-400
                        bg-emerald-500/10
                        border
                        border-emerald-500/20
                        px-3
                        py-1.5
                        rounded-full
                    "
                >
                    AI Generated
                </div>

            </div>


            {error && (

                <div
                    className="
                        mb-5
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        px-4
                        py-3
                        text-sm
                        text-red-300
                    "
                >
                    {error}
                </div>

            )}


            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-4
                "
            >

                {sections.map(section => {

                    const commands =
                        getCommands(section.content);

                    return (

                        <div
                            key={section.key}
                            className="
                                rounded-xl
                                bg-slate-950/50
                                border
                                border-white/10
                                overflow-hidden
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-4
                                    border-b
                                    border-white/10
                                "
                            >

                                <div className="text-cyan-400 text-lg">
                                    {section.icon}
                                </div>

                                <div>

                                    <p className="font-semibold">
                                        {section.title}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {section.subtitle}
                                    </p>

                                </div>

                            </div>


                            <div className="p-4 space-y-3">

                                {commands.length ? (

                                    commands.map(
                                        (command, index) => {

                                            const commandKey =
                                                `${section.key}-${index}`;

                                            const execution =
                                                findExecution(
                                                    section.executionType,
                                                    command
                                                );

                                            const status =
                                                execution
                                                    ? statusConfig(
                                                          execution.execution_status
                                                      )
                                                    : null;

                                            const busy =
                                                loadingKey === commandKey;

                                            return (

                                                <div
                                                    key={commandKey}
                                                    className="
                                                        rounded-xl
                                                        border
                                                        border-white/10
                                                        bg-black/20
                                                        p-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-start
                                                            justify-between
                                                            gap-4
                                                        "
                                                    >

                                                        <code
                                                            className="
                                                                font-mono
                                                                text-xs
                                                                leading-6
                                                                text-slate-300
                                                                break-all
                                                            "
                                                        >
                                                            $ {command}
                                                        </code>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                copyCommand(
                                                                    commandKey,
                                                                    command
                                                                )
                                                            }
                                                            title="Copy command"
                                                            className="
                                                                shrink-0
                                                                w-8
                                                                h-8
                                                                rounded-lg
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-slate-400
                                                                hover:text-cyan-400
                                                                hover:bg-white/5
                                                                transition
                                                            "
                                                        >

                                                            {copied === commandKey
                                                                ? (
                                                                    <FiCheck className="text-green-400" />
                                                                )
                                                                : (
                                                                    <FiCopy />
                                                                )
                                                            }

                                                        </button>

                                                    </div>


                                                    {execution && (

                                                        <div className="mt-4 space-y-3">

                                                            <div
                                                                className="
                                                                    flex
                                                                    flex-wrap
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        text-xs
                                                                        px-2.5
                                                                        py-1
                                                                        rounded-full
                                                                        border
                                                                        text-emerald-300
                                                                        bg-emerald-500/10
                                                                        border-emerald-500/20
                                                                    "
                                                                >
                                                                    {execution.risk_level} RISK
                                                                </span>

                                                                {status && (

                                                                    <span
                                                                        className={`
                                                                            text-xs
                                                                            px-2.5
                                                                            py-1
                                                                            rounded-full
                                                                            border
                                                                            inline-flex
                                                                            items-center
                                                                            gap-1.5
                                                                            ${status.className}
                                                                        `}
                                                                    >
                                                                        {status.icon}
                                                                        {status.label}
                                                                    </span>

                                                                )}

                                                            </div>


                                                            {execution.execution_status ===
                                                                "APPROVED" &&
                                                                execution.approved_at && (

                                                                <p className="text-xs text-slate-500">
                                                                    Approved{" "}
                                                                    {formatDate(
                                                                        execution.approved_at
                                                                    )}
                                                                </p>

                                                            )}

                                                        </div>

                                                    )}


                                                    <div
                                                        className="
                                                            mt-4
                                                            flex
                                                            flex-wrap
                                                            gap-2
                                                        "
                                                    >

                                                        {!execution && (

                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    handleRequest(
                                                                        section,
                                                                        command,
                                                                        commandKey
                                                                    )
                                                                }
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-2
                                                                    rounded-lg
                                                                    border
                                                                    border-cyan-500/20
                                                                    bg-cyan-500/10
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-semibold
                                                                    text-cyan-300
                                                                    hover:bg-cyan-500/20
                                                                    disabled:opacity-50
                                                                    transition
                                                                "
                                                            >
                                                                <FiSend />

                                                                {busy
                                                                    ? "Validating..."
                                                                    : "Request Approval"
                                                                }
                                                            </button>

                                                        )}


                                                        {execution &&
    ["SUCCESS", "FAILED"].includes(
        execution.execution_status
    ) && (

    <div
        className="
            w-full
            mb-3
            rounded-xl
            border
            border-white/10
            bg-black/40
            overflow-hidden
        "
    >

        <div
            className="
                flex
                items-center
                justify-between
                gap-3
                px-4
                py-3
                border-b
                border-white/10
            "
        >

            <span
                className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-semibold
                    text-slate-300
                "
            >
                <FiTerminal />
                Execution Output
            </span>

            <span
                className="
                    text-xs
                    font-mono
                    text-slate-500
                "
            >
                Exit Code:{" "}
                {execution.exit_code ?? "N/A"}
            </span>

        </div>


        {execution.stdout && (

            <pre
                className="
                    p-4
                    text-xs
                    leading-6
                    font-mono
                    text-green-300
                    whitespace-pre-wrap
                    break-words
                    overflow-x-auto
                    max-h-64
                "
            >
                {execution.stdout}
            </pre>

        )}


        {execution.stderr && (

            <pre
                className="
                    p-4
                    text-xs
                    leading-6
                    font-mono
                    text-red-300
                    whitespace-pre-wrap
                    break-words
                    overflow-x-auto
                    max-h-64
                    border-t
                    border-white/10
                "
            >
                {execution.stderr}
            </pre>

        )}


        {!execution.stdout &&
         !execution.stderr && (

            <p className="p-4 text-xs text-slate-500">
                Command completed without output.
            </p>

        )}


        <div
            className="
                px-4
                py-3
                border-t
                border-white/10
                text-[11px]
                text-slate-500
                space-y-1
            "
        >

            {execution.started_at && (
                <p>
                    Started:{" "}
                    {formatDate(
                        execution.started_at
                    )}
                </p>
            )}

            {execution.completed_at && (
                <p>
                    Completed:{" "}
                    {formatDate(
                        execution.completed_at
                    )}
                </p>
            )}

        </div>

    </div>

)}



                  {execution &&
                      verifications[execution.id] && (
                      <div className="mt-4 w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                          <div className="flex items-center gap-2">
                              <FiCheckCircle className="text-cyan-400" />
                              <span className="text-sm font-semibold text-slate-200">
                                  Recovery Verification
                              </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

                              <div className="rounded-lg bg-slate-950/40 p-3">
                                  <p className="text-[11px] text-slate-500">
                                      Before
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-white">
                                      {verifications[execution.id].before_value ?? "N/A"}%
                                  </p>
                              </div>

                              <div className="rounded-lg bg-slate-950/40 p-3">
                                  <p className="text-[11px] text-slate-500">
                                      After
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-white">
                                      {verifications[execution.id].after_value ?? "N/A"}%
                                  </p>
                              </div>

                              <div className="rounded-lg bg-slate-950/40 p-3">
                                  <p className="text-[11px] text-slate-500">
                                      Threshold
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-white">
                                      {verifications[execution.id].threshold_value ?? "N/A"}%
                                  </p>
                              </div>

                          </div>

                          <div className="mt-3">
                              {verifications[execution.id].verification_status === "RECOVERED" ? (
                                  <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                                      ✓ Recovery Confirmed
                                  </span>
                              ) : (
                                  <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                      ✕ {verifications[execution.id].verification_status}
                                  </span>
                              )}
                          </div>

                          {verifications[execution.id].verification_message && (
                              <p className="mt-2 text-xs text-slate-400">
                                  {verifications[execution.id].verification_message}
                              </p>
                          )}

                      </div>
                  )}

{execution?.execution_status ===
    "APPROVED" &&
    section.executionType === "LINUX" && (

    <button
        type="button"
        disabled={busy}
        onClick={() =>
            handleExecute(
                execution,
                commandKey
            )
        }
        className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-cyan-500/20
            bg-cyan-500/10
            px-3
            py-2
            text-xs
            font-semibold
            text-cyan-300
            hover:bg-cyan-500/20
            disabled:opacity-50
            transition
        "
    >
        <FiTerminal />

        {busy
            ? "Executing..."
            : "Execute"
        }
    </button>

)}


{execution?.execution_status ===
                                                            "PENDING" && (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    disabled={busy}
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            execution,
                                                                            commandKey
                                                                        )
                                                                    }
                                                                    className="
                                                                        inline-flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-lg
                                                                        border
                                                                        border-green-500/20
                                                                        bg-green-500/10
                                                                        px-3
                                                                        py-2
                                                                        text-xs
                                                                        font-semibold
                                                                        text-green-300
                                                                        hover:bg-green-500/20
                                                                        disabled:opacity-50
                                                                        transition
                                                                    "
                                                                >
                                                                    <FiCheckCircle />
                                                                    Approve
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    disabled={busy}
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            execution,
                                                                            commandKey
                                                                        )
                                                                    }
                                                                    className="
                                                                        inline-flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-lg
                                                                        border
                                                                        border-red-500/20
                                                                        bg-red-500/10
                                                                        px-3
                                                                        py-2
                                                                        text-xs
                                                                        font-semibold
                                                                        text-red-300
                                                                        hover:bg-red-500/20
                                                                        disabled:opacity-50
                                                                        transition
                                                                    "
                                                                >
                                                                    <FiXCircle />
                                                                    Reject
                                                                </button>

                                                            </>
                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                                ) : (

                                    <p
                                        className="
                                            text-sm
                                            text-slate-500
                                            py-3
                                        "
                                    >
                                        No action recommended for this layer.
                                    </p>

                                )}

                            </div>

                        </div>

                    );

                })}

            </div>


            <div
                className="
                    mt-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-yellow-500/20
                    bg-yellow-500/5
                    px-4
                    py-3
                "
            >

                <FiShield
                    className="
                        text-yellow-400
                        mt-0.5
                        shrink-0
                    "
                />

                <p className="text-xs leading-5 text-slate-400">
                    Approval does not execute a command. Every AI-generated
                    action is validated by the backend safety policy before
                    approval. Infrastructure execution remains disabled.
                </p>

            </div>

        </div>

    );
}
