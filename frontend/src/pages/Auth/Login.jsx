import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCloud, FiLock, FiUser } from "react-icons/fi";

import {
    login,
    saveAuth
} from "../../services/authService";

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);
        setError("");

        try {

            const data = await login(
                username,
                password
            );

            if (!data.token) {
                throw new Error("Token not returned");
            }

            saveAuth(data);

            navigate("/", {
                replace: true
            });

        } catch (err) {

            console.error("Login failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to login"
            );

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-slate-950
            text-white
            px-6
        ">

            <div className="
                w-full
                max-w-md
                rounded-3xl
                border
                border-cyan-500/20
                bg-slate-900
                p-10
                shadow-2xl
            ">

                <div className="text-center mb-8">

                    <div className="
                        mx-auto
                        w-16
                        h-16
                        rounded-2xl
                        bg-cyan-500/10
                        flex
                        items-center
                        justify-center
                        text-cyan-400
                        text-3xl
                        mb-5
                    ">
                        <FiCloud />
                    </div>

                    <h1 className="text-3xl font-black">
                        CloudOps AI
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Sign in to your operations console
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="text-sm text-slate-300">
                            Username
                        </label>

                        <div className="
                            mt-2
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-950
                            px-4
                        ">

                            <FiUser className="text-slate-400" />

                            <input
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                placeholder="Enter username"
                                autoComplete="username"
                                required
                                className="
                                    w-full
                                    bg-transparent
                                    py-4
                                    outline-none
                                "
                            />

                        </div>

                    </div>

                    <div>

                        <label className="text-sm text-slate-300">
                            Password
                        </label>

                        <div className="
                            mt-2
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-950
                            px-4
                        ">

                            <FiLock className="text-slate-400" />

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter password"
                                autoComplete="current-password"
                                required
                                className="
                                    w-full
                                    bg-transparent
                                    py-4
                                    outline-none
                                "
                            />

                        </div>

                    </div>

                    {error && (

                        <div className="
                            rounded-xl
                            border
                            border-red-500/30
                            bg-red-500/10
                            px-4
                            py-3
                            text-sm
                            text-red-400
                        ">
                            {error}
                        </div>

                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-xl
                            bg-cyan-500
                            py-4
                            font-bold
                            text-slate-950
                            transition
                            hover:bg-cyan-400
                            disabled:opacity-50
                        "
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign In"
                        }

                    </button>

                </form>

            </div>

        </div>

    );
}
