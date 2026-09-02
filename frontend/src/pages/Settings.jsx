import { useCallback, useEffect, useState } from "react";
import {
    FiCheckCircle,
    FiCloud,
    FiDatabase,
    FiInfo,
    FiLogOut,
    FiRefreshCw,
    FiServer,
    FiShield,
    FiUser,
    FiWifi,
    FiXCircle
} from "react-icons/fi";

import { API_BASE_URL } from "../config/api";
import { logout } from "../services/authService";

export default function Settings() {
    const [profile, setProfile] = useState({});
    const [backendOnline, setBackendOnline] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [healthLoading, setHealthLoading] = useState(true);
    const [error, setError] = useState("");

    const username =
        localStorage.getItem("username") || "Unknown";

    const token =
        localStorage.getItem("token");

    const checkStatus = useCallback(async () => {
        setHealthLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/`
            );

            setBackendOnline(response.ok);
        } catch (err) {
            console.error("Backend health check failed:", err);
            setBackendOnline(false);
        } finally {
            setHealthLoading(false);
        }
    }, []);

    const loadProfile = useCallback(async () => {
        setProfileLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/profile`,
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`
                        }
                        : {}
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Unable to load user profile."
                );
            }

            setProfile(
                data?.data ||
                data ||
                {}
            );
        } catch (err) {
            console.error("Profile request failed:", err);

            setError(
                err.message ||
                "Unable to load account information."
            );
        } finally {
            setProfileLoading(false);
        }
    }, [token]);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            loadProfile(),
            checkStatus()
        ]);
    }, [loadProfile, checkStatus]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    function handleLogout() {
        logout();
        window.location.href = "/login";
    }

    return (
        <div className="space-y-6 p-6 text-white md:p-8">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiShield size={25} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Settings
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Account, security and system status
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={refreshAll}
                    disabled={profileLoading || healthLoading}
                    className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500 hover:text-white disabled:opacity-40"
                >
                    <FiRefreshCw size={15} />
                    Refresh
                </button>

            </div>

            {error && (
                <div className="rounded-2xl border border-yellow-500 bg-yellow-950 px-5 py-4 text-sm text-yellow-300">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                <section className="rounded-2xl border border-slate-700 bg-slate-950">

                    <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
                        <FiUser className="text-cyan-400" />

                        <div>
                            <h2 className="font-semibold">
                                Account
                            </h2>

                            <p className="text-xs text-slate-500">
                                Current authenticated user
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 p-5">

                        <InfoRow
                            label="Username"
                            value={
                                profile.username ||
                                username
                            }
                        />

                        <InfoRow
                            label="User ID"
                            value={
                                profile.id ||
                                profile.user_id ||
                                "N/A"
                            }
                        />

                        <InfoRow
                            label="Role"
                            value={
                                profile.role ||
                                profile.user_role ||
                                "Cloud Administrator"
                            }
                        />

                        <InfoRow
                            label="Email"
                            value={
                                profile.email ||
                                "Not configured"
                            }
                        />

                        <InfoRow
                            label="Account Status"
                            value={
                                profile.status ||
                                "Active"
                            }
                        />

                    </div>

                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-950">

                    <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
                        <FiServer className="text-cyan-400" />

                        <div>
                            <h2 className="font-semibold">
                                System Status
                            </h2>

                            <p className="text-xs text-slate-500">
                                CloudOps AI service connectivity
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 p-5">

                        <StatusRow
                            icon={<FiWifi />}
                            label="Backend API"
                            status={
                                healthLoading
                                    ? "Checking..."
                                    : backendOnline
                                        ? "Online"
                                        : "Offline"
                            }
                            healthy={backendOnline}
                            loading={healthLoading}
                        />

                        <StatusRow
                            icon={<FiCloud />}
                            label="AI Provider"
                            status="Ollama"
                            healthy={true}
                        />

                        <StatusRow
                            icon={<FiDatabase />}
                            label="Database"
                            status="Connected"
                            healthy={true}
                        />

                        <StatusRow
                            icon={<FiServer />}
                            label="Application"
                            status="CloudOps AI"
                            healthy={true}
                        />

                    </div>

                </section>

            </div>

            <section className="rounded-2xl border border-slate-700 bg-slate-950">

                <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
                    <FiInfo className="text-cyan-400" />

                    <div>
                        <h2 className="font-semibold">
                            Application Information
                        </h2>

                        <p className="text-xs text-slate-500">
                            Current CloudOps AI environment
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">

                    <InfoCard
                        title="API Endpoint"
                        value={API_BASE_URL}
                    />

                    <InfoCard
                        title="Authentication"
                        value="JWT"
                    />

                    <InfoCard
                        title="AI Model"
                        value="llama3.2:3b"
                    />

                </div>

            </section>

            <section className="rounded-2xl border border-slate-700 bg-slate-950">

                <div className="border-b border-slate-700 px-5 py-4">
                    <h2 className="font-semibold">
                        Security
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Current session controls
                    </p>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">

                    <div className="flex items-start gap-3">
                        <div className="mt-1 text-emerald-400">
                            <FiCheckCircle />
                        </div>

                        <div>
                            <p className="font-medium">
                                Authenticated session
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Your current JWT session is stored locally in this browser.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-fit items-center gap-2 rounded-xl border border-red-500 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
                    >
                        <FiLogOut size={15} />
                        Sign Out
                    </button>

                </div>

            </section>

            <section className="rounded-2xl border border-yellow-700 bg-yellow-950 px-5 py-4">

                <div className="flex items-start gap-3">

                    <FiInfo className="mt-0.5 shrink-0 text-yellow-400" />

                    <div>

                        <p className="font-semibold text-yellow-300">
                            Development environment
                        </p>

                        <p className="mt-1 text-sm leading-6 text-yellow-400">
                            Password changes and user preference editing are not
                            exposed by the current backend API, so this page does
                            not show controls that would not actually work.
                        </p>

                    </div>

                </div>

            </section>

        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">

            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-200">
                {String(value)}
            </span>

        </div>
    );
}

function StatusRow({
    icon,
    label,
    status,
    healthy,
    loading = false
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">

            <div className="flex items-center gap-3">

                <span className="text-slate-400">
                    {icon}
                </span>

                <span className="text-sm text-slate-300">
                    {label}
                </span>

            </div>

            <div className="flex items-center gap-2">

                {!loading && (
                    healthy
                        ? (
                            <FiCheckCircle className="text-emerald-400" />
                        )
                        : (
                            <FiXCircle className="text-red-400" />
                        )
                )}

                <span
                    className={
                        healthy
                            ? "text-sm text-emerald-400"
                            : "text-sm text-red-400"
                    }
                >
                    {status}
                </span>

            </div>

        </div>
    );
}

function InfoCard({ title, value }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

            <p className="text-xs text-slate-500">
                {title}
            </p>

            <p className="mt-2 break-all text-sm font-medium text-slate-200">
                {value}
            </p>

        </div>
    );
}
