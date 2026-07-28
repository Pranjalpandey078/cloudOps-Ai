const actions = [

    {
        title: "🐧 Linux",
        prompt: "Generate Linux troubleshooting commands for high CPU usage."
    },

    {
        title: "🐳 Docker",
        prompt: "Generate Docker troubleshooting commands."
    },

    {
        title: "☸ Kubernetes",
        prompt: "Generate Kubernetes troubleshooting commands."
    },

    {
        title: "☁ AWS",
        prompt: "Generate AWS CLI commands to investigate a CPU issue."
    },

    {
        title: "📄 Incident Report",
        prompt: "Generate a professional incident report."
    },

    {
        title: "📈 Capacity Planning",
        prompt: "Suggest infrastructure scaling recommendations."
    }

];

export default function QuickActions({

    onSelect

}) {

    return (

        <div className="grid grid-cols-3 gap-4">

            {

                actions.map(action => (

                    <button

                        key={action.title}

                        onClick={() => onSelect(action.prompt)}

                        className="

                            rounded-2xl

                            border

                            border-cyan-500/20

                            bg-white/5

                            p-5

                            hover:bg-cyan-500/10

                            transition-all

                        "

                    >

                        {action.title}

                    </button>

                ))

            }

        </div>

    );

}