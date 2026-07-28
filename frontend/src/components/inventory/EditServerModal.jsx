import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import {
    getServer,
    updateServer
} from "../../services/inventoryService";

const emptyForm = {
    hostname: "",
    ip_address: "",
    environment_id: "1",
    operating_system: "",
    os_version: "",
    cpu_cores: "",
    memory_gb: "",
    disk_gb: "",
    cloud_provider: "AWS",
    region: "",
    availability_zone: "",
    instance_type: ""
};

export default function EditServerModal({
    serverId,
    onClose,
    onUpdated
}) {

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadServer() {

            try {

                setLoading(true);
                setError("");

                const server = await getServer(serverId);

                setForm({
                    hostname: server.hostname || "",
                    ip_address: server.ip_address || "",
                    environment_id: String(server.environment_id || 1),
                    operating_system: server.operating_system || "",
                    os_version: server.os_version || "",
                    cpu_cores: String(server.cpu_cores || ""),
                    memory_gb: String(server.memory_gb || ""),
                    disk_gb: String(server.disk_gb || ""),
                    cloud_provider: server.cloud_provider || "AWS",
                    region: server.region || "",
                    availability_zone: server.availability_zone || "",
                    instance_type: server.instance_type || ""
                });

            } catch (err) {

                console.error("Failed to load server:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load server."
                );

            } finally {

                setLoading(false);

            }
        }

        if (serverId) {
            loadServer();
        }

    }, [serverId]);

    function handleChange(event) {

        const { name, value } = event.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");

            await updateServer(serverId, {
                ...form,
                environment_id: Number(form.environment_id),
                cpu_cores: Number(form.cpu_cores),
                memory_gb: Number(form.memory_gb),
                disk_gb: Number(form.disk_gb)
            });

            if (onUpdated) {
                await onUpdated();
            }

            onClose();

        } catch (err) {

            console.error("Failed to update server:", err);

            setError(
                err.response?.data?.message ||
                "Failed to update server."
            );

        } finally {

            setSaving(false);

        }
    }

    return (
        <div className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center p-6
        ">

            <div className="
                w-full max-w-4xl max-h-[90vh]
                overflow-y-auto
                rounded-3xl
                bg-slate-900
                border border-cyan-500/20
                shadow-2xl
                p-8
            ">

                <div className="flex justify-between items-start mb-8">

                    <div>
                        <h2 className="text-3xl font-black">
                            Edit Server
                        </h2>

                        <p className="text-slate-400 mt-2">
                            Update infrastructure configuration.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            p-2 rounded-xl
                            hover:bg-white/10
                            text-slate-400
                            hover:text-white
                        "
                    >
                        <FiX size={24} />
                    </button>

                </div>

                {loading ? (

                    <div className="py-16 text-center text-slate-400">
                        Loading server...
                    </div>

                ) : (

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-6"
                    >

                        <Field
                            label="Hostname"
                            name="hostname"
                            value={form.hostname}
                            onChange={handleChange}
                        />

                        <Field
                            label="IP Address"
                            name="ip_address"
                            value={form.ip_address}
                            onChange={handleChange}
                        />

                        <SelectField
                            label="Environment"
                            name="environment_id"
                            value={form.environment_id}
                            onChange={handleChange}
                        >
                            <option value="1">Development</option>
                            <option value="2">Testing</option>
                            <option value="3">Staging</option>
                            <option value="4">Production</option>
                        </SelectField>

                        <Field
                            label="Operating System"
                            name="operating_system"
                            value={form.operating_system}
                            onChange={handleChange}
                        />

                        <Field
                            label="OS Version"
                            name="os_version"
                            value={form.os_version}
                            onChange={handleChange}
                        />

                        <Field
                            label="CPU Cores"
                            name="cpu_cores"
                            type="number"
                            value={form.cpu_cores}
                            onChange={handleChange}
                        />

                        <Field
                            label="Memory (GB)"
                            name="memory_gb"
                            type="number"
                            value={form.memory_gb}
                            onChange={handleChange}
                        />

                        <Field
                            label="Disk (GB)"
                            name="disk_gb"
                            type="number"
                            value={form.disk_gb}
                            onChange={handleChange}
                        />

                        <SelectField
                            label="Cloud Provider"
                            name="cloud_provider"
                            value={form.cloud_provider}
                            onChange={handleChange}
                        >
                            <option value="AWS">AWS</option>
                            <option value="AZURE">Azure</option>
                            <option value="GCP">GCP</option>
                            <option value="ON_PREMISE">On Premise</option>
                        </SelectField>

                        <Field
                            label="Region"
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                        />

                        <Field
                            label="Availability Zone"
                            name="availability_zone"
                            value={form.availability_zone}
                            onChange={handleChange}
                        />

                        <Field
                            label="Instance Type"
                            name="instance_type"
                            value={form.instance_type}
                            onChange={handleChange}
                        />

                        {error && (
                            <div className="
                                col-span-2
                                bg-red-500/10
                                border border-red-500/30
                                text-red-400
                                p-4 rounded-xl
                            ">
                                {error}
                            </div>
                        )}

                        <div className="
                            col-span-2
                            flex justify-end gap-4 pt-4
                        ">

                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    px-6 py-3 rounded-xl
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="
                                    px-6 py-3 rounded-xl
                                    bg-cyan-500 hover:bg-cyan-400
                                    disabled:opacity-50
                                    text-slate-950 font-bold
                                "
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text"
}) {

    return (
        <label className="space-y-2">

            <span className="text-sm text-slate-300">
                {label}
            </span>

            <input
                required
                type={type}
                min={type === "number" ? "1" : undefined}
                name={name}
                value={value}
                onChange={onChange}
                className="
                    w-full bg-slate-950
                    border border-slate-700
                    rounded-xl px-4 py-3
                    outline-none
                    focus:border-cyan-500
                "
            />

        </label>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    children
}) {

    return (
        <label className="space-y-2">

            <span className="text-sm text-slate-300">
                {label}
            </span>

            <select
                name={name}
                value={value}
                onChange={onChange}
                className="
                    w-full bg-slate-950
                    border border-slate-700
                    rounded-xl px-4 py-3
                    outline-none
                    focus:border-cyan-500
                "
            >
                {children}
            </select>

        </label>
    );
}
