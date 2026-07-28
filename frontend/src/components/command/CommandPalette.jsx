import { Command } from "cmdk";
import { useEffect, useState } from "react";

const commands = [

    {
        label: "Dashboard",
        action: () => alert("Dashboard")
    },

    {
        label: "Monitoring",
        action: () => alert("Monitoring")
    },

    {
        label: "Incidents",
        action: () => alert("Incidents")
    },

    {
        label: "Inventory",
        action: () => alert("Inventory")
    },

    {
        label: "AI Center",
        action: () => alert("AI Center")
    }

];

export default function CommandPalette() {

    const [open, setOpen] = useState(false);

    useEffect(() => {

        const down = (e) => {

            if ((e.metaKey || e.ctrlKey) && e.key === "k") {

                e.preventDefault();

                setOpen((prev) => !prev);

            }

        };

        document.addEventListener("keydown", down);

        return () => document.removeEventListener("keydown", down);

    }, []);

    if (!open) return null;

    return (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center pt-32">

            <Command className="w-[700px] rounded-3xl bg-slate-900 border border-cyan-500/20 overflow-hidden shadow-2xl">

                <Command.Input
                    placeholder="Search commands..."
                    className="w-full bg-transparent border-b border-slate-700 p-5 outline-none text-lg"
                />

                <Command.List>

                    {commands.map((command) => (

                        <Command.Item

                            key={command.label}

                            onSelect={command.action}

                            className="p-4 cursor-pointer hover:bg-slate-800"

                        >

                            {command.label}

                        </Command.Item>

                    ))}

                </Command.List>

            </Command>

        </div>

    );

}
