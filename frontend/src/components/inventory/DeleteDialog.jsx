import { useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { deleteServer } from "../../services/inventoryService";

export default function DeleteDialog({
    server,
    onClose,
    onDeleted
}) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {

        try {

            setLoading(true);
            setError("");

            await deleteServer(server.id);

            if (onDeleted) {
                await onDeleted();
            }

            onClose();

        } catch (err) {

            console.error("Failed to delete server:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete server."
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center p-6
        ">

            <div className="
                w-full max-w-md
                rounded-3xl
                bg-slate-900
                border border-red-500/20
                shadow-2xl
                p-8
            ">

                <div className="flex justify-between">

                    <div className="
                        w-12 h-12
                        rounded-xl
                        bg-red-500/10
                        text-red-400
                        flex items-center justify-center
                    ">
                        <FiAlertTriangle size={24} />
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        <FiX size={22} />
                    </button>

                </div>

                <h2 className="text-2xl font-black mt-6">
                    Delete Server?
                </h2>

                <p className="text-slate-400 mt-3">
                    You are about to remove{" "}
                    <span className="text-white font-semibold">
                        {server.hostname}
                    </span>{" "}
                    from the active inventory.
                </p>

                <p className="text-sm text-slate-500 mt-2">
                    CloudOps AI will soft-delete this server record.
                </p>

                {error && (
                    <div className="
                        mt-5 p-3 rounded-xl
                        bg-red-500/10
                        border border-red-500/30
                        text-red-400
                    ">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-5 py-3 rounded-xl
                            bg-white/5 hover:bg-white/10
                            border border-white/10
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleDelete}
                        className="
                            px-5 py-3 rounded-xl
                            bg-red-500 hover:bg-red-400
                            disabled:opacity-50
                            text-white font-bold
                        "
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete Server"}
                    </button>

                </div>

            </div>

        </div>
    );
}
