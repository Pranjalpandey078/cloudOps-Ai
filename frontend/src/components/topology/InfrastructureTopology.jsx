import ReactFlow, {
    Background,
    Controls,
    MiniMap
} from "reactflow";

import "reactflow/dist/style.css";

const nodes = [

{
    id: "internet",
    position: { x: 300, y: 0 },
    data: { label: "☁ Internet" }
},

{
    id: "lb",
    position: { x: 300, y: 120 },
    data: { label: "🔵 Load Balancer" }
},

{
    id: "app1",
    position: { x: 120, y: 260 },
    data: { label: "🟢 App-01" }
},

{
    id: "app2",
    position: { x: 480, y: 260 },
    data: { label: "🟢 App-02" }
},

{
    id: "mysql",
    position: { x: 300, y: 430 },
    data: { label: "🟣 MySQL" }
},

{
    id: "redis",
    position: { x: 300, y: 570 },
    data: { label: "🟠 Redis" }
}

];

const edges = [

{
    id:"1",
    source:"internet",
    target:"lb",
    animated:true
},

{
    id:"2",
    source:"lb",
    target:"app1",
    animated:true
},

{
    id:"3",
    source:"lb",
    target:"app2",
    animated:true
},

{
    id:"4",
    source:"app1",
    target:"mysql",
    animated:true
},

{
    id:"5",
    source:"app2",
    target:"mysql",
    animated:true
},

{
    id:"6",
    source:"mysql",
    target:"redis",
    animated:true
}

];

export default function InfrastructureTopology() {

    return (

        <div

            className="

                h-[650px]

                rounded-3xl

                overflow-hidden

                border

                border-cyan-500/20

                bg-slate-900

            "

        >

            <ReactFlow

                nodes={nodes}

                edges={edges}

                fitView

            >

                <MiniMap/>

                <Controls/>

                <Background/>

            </ReactFlow>

        </div>

    );

}