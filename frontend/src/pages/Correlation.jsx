import { useEffect, useState } from "react";
import { getCorrelationGroups } from "../services/correlationService";

export default function Correlation() {

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const data = await getCorrelationGroups();
            setGroups(data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                Incident Correlation
            </h1>

            {groups.length === 0 ? (

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    No correlation groups found.
                </div>

            ) : (

                <div className="space-y-4">

                    {groups.map(group => (

                        <div
                            key={group.id}
                            className="rounded-xl border border-white/10 bg-white/5 p-6"
                        >

                            <div className="flex justify-between">

                                <div>

                                    <div className="text-xl font-bold">
                                        {group.title}
                                    </div>

                                    <div className="text-slate-400 mt-1">
                                        {group.root_cause || "Unknown Root Cause"}
                                    </div>

                                </div>

                                <div className="text-right">

                                    <div>{group.severity}</div>

                                    <div
                                        className="
                                            mt-2
                                            inline-flex
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-cyan-500/20
                                            text-cyan-300
                                            text-xs
                                            font-semibold
                                        "
                                    >
                                        AI Confidence: {group.confidence_score}%
                                    </div>

                                    <div className="text-slate-400 mt-2">
                                        {group.incident_count} incidents
                                    </div>

                                    <div
                                        className="
                                            grid
                                            grid-cols-3
                                            gap-4
                                            mt-4
                                            text-sm
                                        "
                                    >

                                        <div>
                                            <div className="text-slate-500">
                                                First Seen
                                            </div>
                                            <div className="mt-1">
                                                {new Date(group.first_seen).toLocaleString()}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-slate-500">
                                                Last Seen
                                            </div>
                                            <div className="mt-1">
                                                {new Date(group.last_seen).toLocaleString()}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-slate-500">
                                                Active Duration
                                            </div>
                                            <div className="mt-1">
                                                {group.active_minutes} min
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}
