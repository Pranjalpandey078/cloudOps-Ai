import { useEffect, useState } from "react";
import socket from "../../socket/socket";

export default function ConnectionBadge() {

    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {

        socket.on("connect", () => setConnected(true));

        socket.on("disconnect", () => setConnected(false));

        return () => {

            socket.off("connect");

            socket.off("disconnect");

        };

    }, []);

    return (

        <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                connected
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
            }`}
        >
            {connected ? "🟢 Live" : "🔴 Offline"}
        </div>

    );

}
<div className="flex justify-between items-center">

    <div>

        <h1 className="text-5xl font-black">

            Live Monitoring

        </h1>

        <p className="text-slate-400">

            Real-time infrastructure monitoring

        </p>

    </div>

    <ConnectionBadge/>

</div>