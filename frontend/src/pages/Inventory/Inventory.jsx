import InventoryStats from "../components/inventory/InventoryStats";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import InventoryTable from "../components/inventory/InventoryTable";

export default function Inventory() {

    return (

        <div className="space-y-8">

            <div>

                <h1 className="text-5xl font-black">

                    Server Inventory

                </h1>

                <p className="text-slate-400 mt-3">

                    Manage all infrastructure assets across your organization.

                </p>

            </div>

            <InventoryStats />

            <InventoryToolbar />

            <InventoryTable />

        </div>

    );

}