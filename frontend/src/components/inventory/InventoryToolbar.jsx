import { useState } from "react";
import { FiPlus, FiX, FiRefreshCw } from "react-icons/fi";
import {
    createServer,
    runInfrastructureDiscovery
} from "../../services/inventoryService";

const initialForm = {
    hostname: "",
    ip_address: "",
    environment_id: "1",
    operating_system: "Ubuntu",
    os_version: "24.04",
    cpu_cores: "2",
    memory_gb: "4",
    disk_gb: "50",
    cloud_provider: "AWS",
    region: "ap-south-1",
    availability_zone: "ap-south-1a",
    instance_type: "t3.small"
};

export default function InventoryToolbar({
    onServerCreated,
    onDiscoveryCompleted
}) {

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [discovering, setDiscovering] = useState(false);
    const [discoveryMessage, setDiscoveryMessage] = useState("");

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
            setLoading(true);
            setError("");

            await createServer({
                ...form,
                environment_id: Number(form.environment_id),
                cpu_cores: Number(form.cpu_cores),
                memory_gb: Number(form.memory_gb),
                disk_gb: Number(form.disk_gb)
            });

            setForm(initialForm);
            setOpen(false);

            if (onServerCreated) {
                onServerCreated();
            }

        } catch (err) {

            console.error("Failed to create server:", err);

            setError(
                err.response?.data?.message ||
                "Failed to register server."
            );

        } finally {
            setLoading(false);
        }
    }

    async function handleDiscovery() {

        try {

            setDiscovering(true);
            setDiscoveryMessage("");
            setError("");

            const response =
                await runInfrastructureDiscovery();

            const providers =
                response?.data?.providers || {};

            const linux =
                providers?.linux?.discovered || 0;

            const docker =
                providers?.docker?.discovered || 0;

            const nodes =
                providers?.kubernetes?.nodes_discovered || 0;

            const pods =
                providers?.kubernetes?.pods_discovered || 0;

            setDiscoveryMessage(
                `Discovery completed: ${linux} server, ` +
                `${docker} container, ${nodes} node, ${pods} pods.`
            );

            if (onDiscoveryCompleted) {
                await onDiscoveryCompleted();
            }

        } catch (err) {

            console.error(
                "Infrastructure discovery failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Infrastructure discovery failed."
            );

        } finally {

            setDiscovering(false);

        }
    }


    return (
        <>
            <div className="flex items-center justify-between">

                <div>
                    <h2 className="text-2xl font-bold">
                        Infrastructure Assets
                    </h2>

                    <p className="text-slate-400 mt-1">
                        Register and manage your infrastructure servers.
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={handleDiscovery}
                        disabled={discovering}
                        className="
                            flex
                            items-center
                            gap-2
                            bg-white/5
                            hover:bg-white/10
                            disabled:opacity-50
                            border
                            border-white/10
                            font-bold
                            px-5
                            py-3
                            rounded-xl
                            transition
                        "
                    >
                        <FiRefreshCw
                            className={
                                discovering
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {discovering
                            ? "Discovering..."
                            : "Run Discovery"}
                    </button>

                    <button
                        onClick={() => {
                            setError("");
                            setOpen(true);
                        }}
                        className="
                            flex
                            items-center
                            gap-2
                            bg-cyan-500
                            hover:bg-cyan-400
                            text-slate-950
                            font-bold
                            px-5
                            py-3
                            rounded-xl
                            transition
                        "
                    >
                        <FiPlus />
                        Add Server
                    </button>

                </div>

            </div>

            {discoveryMessage && (
                <div className="
                    bg-green-500/10
                    border
                    border-green-500/30
                    text-green-400
                    px-5
                    py-4
                    rounded-xl
                ">
                    {discoveryMessage}
                </div>
            )}

            {error && !open && (
                <div className="
                    bg-red-500/10
                    border
                    border-red-500/30
                    text-red-400
                    px-5
                    py-4
                    rounded-xl
                ">
                    {error}
                </div>
            )}

            {open && (

                <div className="
                    fixed
                    inset-0
                    z-50
                    bg-black/70
                    backdrop-blur-sm
                    flex
                    items-center
                    justify-center
                    p-6
                ">

                    <div className="
                        w-full
                        max-w-4xl
                        max-h-[90vh]
                        overflow-y-auto
                        rounded-3xl
                        bg-slate-900
                        border
                        border-cyan-500/20
                        shadow-2xl
                        p-8
                    ">

                        <div className="flex justify-between items-start mb-8">

                            <div>
                                <h2 className="text-3xl font-black">
                                    Register Server
                                </h2>

                                <p className="text-slate-400 mt-2">
                                    Add a new infrastructure node to CloudOps AI.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="
                                    p-2
                                    rounded-xl
                                    hover:bg-white/10
                                    text-slate-400
                                    hover:text-white
                                "
                            >
                                <FiX size={24} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-2 gap-6"
                        >

                            <Field
                                label="Hostname"
                                name="hostname"
                                value={form.hostname}
                                onChange={handleChange}
                                placeholder="prod-api-03"
                            />

                            <Field
                                label="IP Address"
                                name="ip_address"
                                value={form.ip_address}
                                onChange={handleChange}
                                placeholder="10.0.1.40"
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
                                min="1"
                                value={form.cpu_cores}
                                onChange={handleChange}
                            />

                            <Field
                                label="Memory (GB)"
                                name="memory_gb"
                                type="number"
                                min="1"
                                value={form.memory_gb}
                                onChange={handleChange}
                            />

                            <Field
                                label="Disk (GB)"
                                name="disk_gb"
                                type="number"
                                min="1"
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
                                    border
                                    border-red-500/30
                                    text-red-400
                                    p-4
                                    rounded-xl
                                ">
                                    {error}
                                </div>
                            )}

                            <div className="
                                col-span-2
                                flex
                                justify-end
                                gap-4
                                pt-4
                            ">

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="
                                        px-6
                                        py-3
                                        rounded-xl
                                        bg-white/5
                                        hover:bg-white/10
                                        border
                                        border-white/10
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        px-6
                                        py-3
                                        rounded-xl
                                        bg-cyan-500
                                        hover:bg-cyan-400
                                        disabled:opacity-50
                                        text-slate-950
                                        font-bold
                                    "
                                >
                                    {loading
                                        ? "Registering..."
                                        : "Register Server"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}
        </>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    min
}) {

    return (
        <label className="space-y-2">

            <span className="text-sm text-slate-300">
                {label}
            </span>

            <input
                required
                type={type}
                min={min}
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className="
                    w-full
                    bg-slate-950
                    border
                    border-slate-700
                    rounded-xl
                    px-4
                    py-3
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
                    w-full
                    bg-slate-950
                    border
                    border-slate-700
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:border-cyan-500
                "
            >
                {children}
            </select>

        </label>
    );
}
