import MonitoringChart from "./MonitoringChart";
import AIAssistant from "./AIAssistant";
import InfrastructureTopology from "../topology/InfrastructureTopology";
import LiveIncidentFeed from "../incidents/LiveIncidentFeed";
import AIChat from "./AIChat";

export default function OperationsCenter() {

    return (

        <div className="space-y-8">

            <div className="grid grid-cols-2 gap-8">

                <MonitoringChart />

                <AIChat />

            </div>

            <div className="grid grid-cols-2 gap-8">

                <InfrastructureTopology />

                <LiveIncidentFeed />

            </div>

        </div>

    );

}