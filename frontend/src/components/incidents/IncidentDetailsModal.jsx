import { useState } from "react";

import {
    FiX,
    FiAlertTriangle,
    FiServer,
    FiCpu,
    FiActivity,
    FiClock,
    FiCheckCircle,
    FiZap
} from "react-icons/fi";

import {
    analyzeIncident,
    resolveIncident
} from "../../services/incidentService";

import IncidentAIChat from "./IncidentAIChat";
import IncidentRemediation from "./IncidentRemediation";
import AIResponseRenderer from "./AIResponseRenderer";


function normalizeAIAnalysis(value) {

    if (!value) {
        return null;
    }

    let data = value;

    // Saved DB analysis may be JSON stored as a string.
    if (typeof data === "string") {

        try {
            data = JSON.parse(data);
        } catch {
            return {
                analysis: data,
                remediation: ""
            };
        }

    }

    // Handle nested API responses if present.
    if (
        data &&
        typeof data === "object" &&
        data.data
    ) {
        data = data.data;
    }

    if (typeof data === "string") {
        return {
            analysis: data,
            remediation: ""
        };
    }

    if (!data || typeof data !== "object") {
        return {
            analysis: String(data || ""),
            remediation: ""
        };
    }

    return {
        analysis:
            data.analysis ||
            data.ai_analysis ||
            data.message ||
            "",

        remediation:
            data.remediation ||
            data.recommendation ||
            data.recommendations ||
            ""
    };
}


function cleanAIText(value) {

    if (!value) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.join("\n");
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([key, item]) => `${key}: ${item}`)
            .join("\n");
    }

    return String(value)
        .replace(/\\n/g, "\n")
        .trim();
}



export default function IncidentDetailsModal({
    incident,
    onClose,
    onUpdated
}) {

    const [analysis, setAnalysis] = useState(
        () => normalizeAIAnalysis(incident?.ai_analysis)
    );

    const [analyzing, setAnalyzing] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [error, setError] = useState("");

    if (!incident) {
        return null;
    }


    function formatDate(value) {

        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }


    function metric(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "N/A";
        }

        return `${Number(value).toFixed(2)}%`;
    }


    async function handleAnalyze() {

        try {

            setAnalyzing(true);
            setError("");

            const result = await analyzeIncident(incident);

            const output = normalizeAIAnalysis(result);

            setAnalysis(output);

        } catch (err) {

            console.error("AI analysis failed:", err);

            setError(
                err.response?.data?.message ||
                "AI analysis failed."
            );

        } finally {

            setAnalyzing(false);

        }
    }


    async function handleResolve() {

        try {

            setResolving(true);
            setError("");

            await resolveIncident(incident.id);

            if (onUpdated) {
                await onUpdated();
            }

            onClose();

        } catch (err) {

            console.error("Resolve incident failed:", err);

            setError(
                err.response?.data?.message ||
                "Failed to resolve incident."
            );

        } finally {

            setResolving(false);

        }
    }


    const resolved = incident.status === "RESOLVED";

    return (

        <div
            className="
                fixed inset-0 z-50
                bg-black/70
                backdrop-blur-md
                flex
                items-center
                justify-center
                p-6
            "
        >

            <div
                className="
                    w-full
                    max-w-4xl
                    max-h-[92vh]
                    overflow-y-auto
                    rounded-3xl
                    bg-slate-950
                    border
                    border-cyan-500/20
                    shadow-2xl
                "
            >

                {/* Header */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-8
                        py-6
                        border-b
                        border-white/10
                    "
                >

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                w-12 h-12
                                rounded-xl
                                bg-red-500/10
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <FiAlertTriangle
                                className="text-red-400 text-2xl"
                            />
                        </div>

                        <div>

                            <div className="flex items-center gap-3">

                                <h2 className="text-2xl font-bold">
                                    Incident #{incident.id}
                                </h2>

                                <span
                                    className="
                                        px-3 py-1
                                        rounded-full
                                        bg-red-500/10
                                        border
                                        border-red-500/20
                                        text-red-400
                                        text-xs
                                        font-bold
                                    "
                                >
                                    {incident.severity}
                                </span>

                            </div>

                            <p className="text-slate-400 text-sm mt-1">
                                Infrastructure incident investigation
                            </p>

                        </div>

                    </div>

                    
                {/* AI INCIDENT COPILOT */}

                <div className="mt-6">

                    <IncidentAIChat
                        incident={incident}
                    />

                </div>


<button
                        type="button"
                        onClick={onClose}
                        className="
                            p-2
                            text-slate-400
                            hover:text-white
                            hover:bg-white/5
                            rounded-lg
                            transition
                        "
                    >
                        <FiX className="text-xl" />
                    </button>

                </div>


                <div className="p-8 space-y-7">

                    {/* Incident summary */}

                    <div
                        className="
                            rounded-2xl
                            bg-white/5
                            border
                            border-white/10
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                justify-between
                                gap-6
                                items-start
                            "
                        >

                            <div>

                                <h3 className="text-2xl font-bold">
                                    {incident.title || "Infrastructure Incident"}
                                </h3>

                                <p className="text-slate-400 mt-2">
                                    {incident.description ||
                                     "No incident description available."}
                                </p>

                            </div>

                            <span
                                className={
                                    resolved
                                        ? "text-green-400 font-bold"
                                        : "text-red-400 font-bold"
                                }
                            >
                                ● {incident.status}
                            </span>

                        </div>

                    </div>


                    {/* Server + metric */}

                    <div className="grid md:grid-cols-2 gap-4">

                        <InfoCard
                            icon={<FiServer />}
                            label="Affected Server"
                            value={
                                incident.server_hostname ||
                                `Server #${incident.server_id}`
                            }
                            subvalue={incident.server_ip}
                        />

                        <InfoCard
                            icon={<FiCpu />}
                            label="Metric"
                            value={incident.metric_name || "N/A"}
                            subvalue={`Source: ${incident.source || "Monitoring"}`}
                        />

                    </div>


                    {/* Observed / threshold */}

                    <div className="grid md:grid-cols-2 gap-4">

                        <MetricCard
                            icon={<FiActivity />}
                            label="Observed Value"
                            value={metric(incident.metric_value)}
                            dangerous
                        />

                        <MetricCard
                            icon={<FiZap />}
                            label="Configured Threshold"
                            value={metric(incident.threshold_value)}
                        />

                    </div>


                    {/* Timeline */}

                    <div
                        className="
                            rounded-2xl
                            bg-white/5
                            border
                            border-white/10
                            p-6
                        "
                    >

                        <div className="flex items-center gap-2 mb-5">

                            <FiClock className="text-cyan-400" />

                            <h3 className="font-bold">
                                Incident Timeline
                            </h3>

                        </div>

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>

                                <p className="text-xs text-slate-500">
                                    Detected
                                </p>

                                <p className="font-semibold mt-1">
                                    {formatDate(incident.created_at)}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-slate-500">
                                    Resolved
                                </p>

                                <p className="font-semibold mt-1">
                                    {formatDate(incident.resolved_at)}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* AI analysis */}

                    <div
                        className="
                            rounded-2xl
                            bg-cyan-500/5
                            border
                            border-cyan-500/20
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                mb-5
                            "
                        >

                            <div>

                                <h3 className="text-lg font-bold">
                                    AI Incident Analysis
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Root-cause and remediation assistance
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="
                                    px-5
                                    py-3
                                    rounded-xl
                                    bg-cyan-400
                                    text-slate-950
                                    font-bold
                                    hover:bg-cyan-300
                                    disabled:opacity-50
                                    transition
                                "
                            >
                                {analyzing
                                    ? "Analyzing..."
                                    : "Analyze with AI"}
                            </button>

                        </div>

                        {analysis ? (

                            <div className="space-y-4">

                                {analysis.analysis && (

                                    <div
                                        className="
                                            rounded-xl
                                            bg-black/20
                                            border
                                            border-white/5
                                            p-5
                                        "
                                    >

                                        <div className="flex items-center gap-2 mb-3">

                                            <FiActivity className="text-cyan-400" />

                                            <h4 className="font-bold">
                                                Root Cause & Impact
                                            </h4>

                                        </div>

                                        <AIResponseRenderer
                                            content={cleanAIText(
                                                analysis.analysis
                                            )}
                                        />

                                    </div>

                                )}


                                {analysis.remediation && (

                                    <IncidentRemediation
                                        incidentId={incident.id}
                                        remediation={analysis.remediation}
                                    />

                                )}


                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-xs
                                        text-green-400
                                        pt-1
                                    "
                                >
                                    <FiCheckCircle />

                                    AI analysis complete
                                </div>

                            </div>

                        ) : (

                            <div
                                className="
                                    text-center
                                    py-7
                                    text-slate-500
                                "
                            >
                                Run AI analysis to investigate this incident.
                            </div>

                        )}

                    </div>


                    {error && (

                        <div
                            className="
                                rounded-xl
                                bg-red-500/10
                                border
                                border-red-500/20
                                text-red-400
                                px-5
                                py-4
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* Actions */}

                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                            pt-2
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-6
                                py-3
                                rounded-xl
                                bg-white/5
                                border
                                border-white/10
                                hover:bg-white/10
                                transition
                            "
                        >
                            Close
                        </button>

                        {!resolved && (

                            <button
                                type="button"
                                onClick={handleResolve}
                                disabled={resolving}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-6
                                    py-3
                                    rounded-xl
                                    bg-green-500
                                    text-slate-950
                                    font-bold
                                    hover:bg-green-400
                                    disabled:opacity-50
                                    transition
                                "
                            >

                                <FiCheckCircle />

                                {resolving
                                    ? "Resolving..."
                                    : "Resolve Incident"}

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}


function InfoCard({
    icon,
    label,
    value,
    subvalue
}) {

    return (

        <div
            className="
                rounded-2xl
                bg-white/5
                border
                border-white/10
                p-5
            "
        >

            <div className="flex gap-4">

                <div
                    className="
                        text-cyan-400
                        text-xl
                        mt-1
                    "
                >
                    {icon}
                </div>

                <div>

                    <p className="text-xs text-slate-500">
                        {label}
                    </p>

                    <p className="font-bold mt-1">
                        {value || "N/A"}
                    </p>

                    {subvalue && (

                        <p className="text-xs text-slate-500 mt-1">
                            {subvalue}
                        </p>

                    )}

                </div>

            </div>

        </div>
    );
}


function MetricCard({
    icon,
    label,
    value,
    dangerous = false
}) {

    return (

        <div
            className="
                rounded-2xl
                bg-white/5
                border
                border-white/10
                p-5
            "
        >

            <div className="flex items-center gap-3">

                <div
                    className={
                        dangerous
                            ? "text-red-400 text-xl"
                            : "text-cyan-400 text-xl"
                    }
                >
                    {icon}
                </div>

                <div>

                    <p className="text-xs text-slate-500">
                        {label}
                    </p>

                    <p
                        className={
                            dangerous
                                ? "text-3xl font-black text-red-400 mt-1"
                                : "text-3xl font-black mt-1"
                        }
                    >
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}
