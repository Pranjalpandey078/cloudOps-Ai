import { useState, useEffect } from "react";

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
    resolveIncident,
    retryIncidentAI,
    getIncidentTimeline,
    getRelatedIncidents
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
    const [retryingAI, setRetryingAI] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [error, setError] = useState("");

    const [timeline, setTimeline] = useState([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const [relatedIncidents, setRelatedIncidents] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);


    const [elapsedTime, setElapsedTime] = useState("");



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


    async function handleRetryAI() {

        try {

            setRetryingAI(true);
            setError("");

            await retryIncidentAI(
                incident.id
            );

            if (onUpdated) {
                await onUpdated();
            }

            onClose();

        } catch (err) {

            console.error(
                "AI retry failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to retry AI analysis."
            );

        } finally {

            setRetryingAI(false);

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



    useEffect(() => {


        async function loadRelatedIncidents() {

            try {

                setRelatedLoading(true);

                const items =
                    await getRelatedIncidents(
                        incident.id
                    );

                setRelatedIncidents(items);

            } catch (error) {

                console.error(
                    "Related incidents failed:",
                    error
                );

            } finally {

                setRelatedLoading(false);

            }

        }

        async function loadTimeline() {

            try {

                setTimelineLoading(true);

                const events =
                    await getIncidentTimeline(
                        incident.id
                    );

                setTimeline(events);

            } catch (error) {

                console.error(
                    "Timeline load failed:",
                    error
                );

            } finally {

                setTimelineLoading(false);

            }

        }

        if (incident?.id) {
            loadTimeline();
            loadRelatedIncidents();
        }

    }, [incident]);



    useEffect(() => {

        function updateTimer() {

            const start = new Date(incident.created_at);

            const diff =
                Math.max(
                    0,
                    Date.now() - start.getTime()
                );

            const hours =
                String(
                    Math.floor(diff / 3600000)
                ).padStart(2,"0");

            const minutes =
                String(
                    Math.floor(diff % 3600000 / 60000)
                ).padStart(2,"0");

            const seconds =
                String(
                    Math.floor(diff % 60000 / 1000)
                ).padStart(2,"0");

            setElapsedTime(
                `${hours}h ${minutes}m ${seconds}s`
            );

        }

        updateTimer();

        const timer =
            setInterval(updateTimer,1000);

        return () => clearInterval(timer);

    }, [incident.created_at]);

    const resolved = incident.status === "RESOLVED";

    const aiStatus =
        incident.ai_status || "PENDING";

    const aiPending =
        aiStatus === "PENDING";

    const aiProcessing =
        aiStatus === "PROCESSING";

    const aiFailed =
        aiStatus === "FAILED";

    const aiCompleted =
        aiStatus === "COMPLETED";

    const healthScore =
        incident.severity === "CRITICAL"
            ? 20
            : incident.severity === "HIGH"
            ? 45
            : incident.severity === "MEDIUM"
            ? 70
            : 95;


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


                    {/* Enterprise Impact */}

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

                            <FiServer className="text-cyan-400" />

                            <h3 className="font-bold">
                                Affected Resources
                            </h3>

                        </div>

                        <div className="grid md:grid-cols-3 gap-5">

                            <div>

                                <div className="text-xs text-slate-500">
                                    Server
                                </div>

                                <div className="font-semibold mt-1">
                                    {incident.server_hostname || "Unknown"}
                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-slate-500">
                                    Metric
                                </div>

                                <div className="font-semibold mt-1">
                                    {incident.metric_name}
                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-slate-500">
                                    Severity
                                </div>

                                <div className="font-semibold text-red-400 mt-1">
                                    {incident.severity}
                                </div>

                            </div>

                        </div>

                        <div
                            className="
                                mt-6
                                rounded-xl
                                border
                                border-white/10
                                bg-black/20
                                p-5
                            "
                        >

                            <div className="text-xs text-slate-500">
                                Infrastructure Health
                            </div>

                            <div
                                className={
                                    healthScore >= 90
                                        ? "mt-2 text-4xl font-bold text-green-400"
                                        : healthScore >= 70
                                        ? "mt-2 text-4xl font-bold text-yellow-400"
                                        : "mt-2 text-4xl font-bold text-red-400"
                                }
                            >
                                {healthScore}%
                            </div>

                            <div className="mt-2 text-sm text-slate-400">
                                {healthScore >= 90
                                    ? "Infrastructure operating normally."
                                    : healthScore >= 70
                                    ? "Minor degradation detected."
                                    : "Immediate attention recommended."}
                            </div>

                        </div>

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

                        {timelineLoading ? (

                            <div className="text-center py-8 text-slate-400">
                                Loading timeline...
                            </div>

                        ) : timeline.length === 0 ? (

                            <div className="text-center py-8 text-slate-500">
                                No timeline events available.
                            </div>

                        ) : (

                            <div className="space-y-6">

                                {timeline.map((event, index) => (

                                    <div
                                        key={event.id}
                                        className="flex gap-4"
                                    >

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                items-center
                                            "
                                        >

                                            <div
                                                className="
                                                    w-3
                                                    h-3
                                                    rounded-full
                                                    bg-cyan-400
                                                "
                                            />

                                            {index !== timeline.length - 1 && (

                                                <div
                                                    className="
                                                        w-px
                                                        flex-1
                                                        bg-white/10
                                                        mt-2
                                                    "
                                                />

                                            )}

                                        </div>

                                        <div className="flex-1 pb-5">

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <h4
                                                    className="
                                                        font-semibold
                                                        text-white
                                                    "
                                                >
                                                    {event.title}
                                                </h4>

                                                <span
                                                    className="
                                                        text-xs
                                                        text-slate-500
                                                    "
                                                >
                                                    {formatDate(event.created_at)}
                                                </span>

                                            </div>

                                            <div
                                                className="
                                                    text-xs
                                                    uppercase
                                                    tracking-wider
                                                    text-cyan-400
                                                    mt-1
                                                "
                                            >
                                                {event.event_type}
                                            </div>

                                            {event.description && (

                                                <p
                                                    className="
                                                        mt-2
                                                        text-sm
                                                        text-slate-400
                                                    "
                                                >
                                                    {event.description}
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>


                    {/* Related Incidents */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-6
                            mb-6
                        "
                    >

                        <div className="flex items-center justify-between mb-5">

                            <h3 className="text-lg font-bold">
                                Related Incidents
                            </h3>

                            <span className="text-xs text-slate-500">
                                {relatedIncidents.length} found
                            </span>

                        </div>

                        {relatedLoading ? (

                            <p className="text-slate-400">
                                Loading related incidents...
                            </p>

                        ) : relatedIncidents.length === 0 ? (

                            <p className="text-slate-500">
                                No related incidents found.
                            </p>

                        ) : (

                            <div className="space-y-3">

                                {relatedIncidents.map(item => (

                                    <div
                                        key={item.id}
                                        className="
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-black/20
                                            p-4
                                        "
                                    >

                                        <div className="flex justify-between">

                                            <div>

                                                <div className="font-semibold">
                                                    {item.title}
                                                </div>

                                                <div className="
                                                    text-sm
                                                    text-slate-400
                                                    mt-1
                                                ">
                                                    {item.metric_name}
                                                </div>

                                            </div>

                                            <span className="
                                                text-xs
                                                font-bold
                                                text-cyan-400
                                            ">
                                                {item.severity}
                                            </span>

                                        </div>

                                        <div className="
                                            mt-2
                                            text-xs
                                            text-slate-500
                                        ">
                                            {formatDate(item.created_at)}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

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

                            {aiFailed ? (

                                <button
                                    type="button"
                                    onClick={handleRetryAI}
                                    disabled={retryingAI}
                                    className="
                                        px-5
                                        py-3
                                        rounded-xl
                                        bg-red-500
                                        text-white
                                        font-bold
                                        hover:bg-red-400
                                        disabled:opacity-50
                                        transition
                                    "
                                >
                                    {retryingAI
                                        ? "Retrying..."
                                        : "Retry AI Analysis"}
                                </button>

                            ) : aiPending ? (

                                <span className="
                                    text-sm
                                    font-semibold
                                    text-yellow-400
                                ">
                                    AI analysis pending
                                </span>

                            ) : aiProcessing ? (

                                <span className="
                                    text-sm
                                    font-semibold
                                    text-cyan-400
                                ">
                                    AI analysis processing...
                                </span>

                            ) : (

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
                                        : aiCompleted
                                            ? "Re-analyze"
                                            : "Analyze with AI"}
                                </button>

                            )}

                        </div>

                        <div
                            className="
                                mb-5
                                rounded-2xl
                                border
                                border-cyan-500/20
                                bg-cyan-500/5
                                p-5
                            "
                        >

                            <div
                                className="
                                    grid
                                    md:grid-cols-4
                                    gap-4
                                "
                            >

                                <div>

                                    <div className="text-xs text-slate-500">
                                        AI Status
                                    </div>

                                    <div className="mt-1 font-bold text-cyan-400">
                                        {incident.ai_status || "PENDING"}
                                    </div>

                                </div>

                                <div>

                                    <div className="text-xs text-slate-500">
                                        Confidence
                                    </div>

                                    <div className="mt-1 font-bold">
                                        {analysis?.analysis?.confidence
                                            ? `${Math.round(
                                                analysis.analysis.confidence * 100
                                            )}%`
                                            : "N/A"}
                                    </div>

                                </div>

                                <div>

                                    <div className="text-xs text-slate-500">
                                        Retry Count
                                    </div>

                                    <div className="mt-1 font-bold">
                                        {incident.ai_retry_count ?? 0}
                                    </div>

                                </div>

                                <div>

                                    <div className="text-xs text-slate-500">
                                        Recommendation
                                    </div>

                                    <div
                                        className={
                                            analysis?.analysis?.confidence >= 0.9
                                                ? "mt-1 font-bold text-green-400"
                                                : analysis?.analysis?.confidence >= 0.7
                                                ? "mt-1 font-bold text-yellow-400"
                                                : "mt-1 font-bold text-red-400"
                                        }
                                    >
                                        {
                                            analysis?.analysis?.confidence >= 0.9
                                                ? "Trusted Result"
                                                : analysis?.analysis?.confidence >= 0.7
                                                ? "Review Recommended"
                                                : "Manual Investigation"
                                        }
                                    </div>

                                </div>

                            </div>

                        </div>


                        {aiFailed && (

                            <div
                                className="
                                    mb-5
                                    rounded-xl
                                    border
                                    border-red-500/20
                                    bg-red-500/10
                                    p-4
                                "
                            >
                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    text-red-400
                                    font-bold
                                ">
                                    <FiAlertTriangle />
                                    AI processing failed
                                </div>

                                <p className="
                                    text-sm
                                    text-slate-400
                                    mt-2
                                ">
                                    {incident.ai_error ||
                                        "The AI provider could not complete the analysis."}
                                </p>

                                <p className="
                                    text-xs
                                    text-slate-500
                                    mt-2
                                ">
                                    Attempts: {incident.ai_retry_count ?? 0}
                                </p>

                            </div>

                        )}

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
