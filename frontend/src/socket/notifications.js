import { toast } from "react-toastify";

export function showIncidentToast(incident) {

    toast.error(

        `${incident.severity} - ${incident.title}`,

        {

            position: "top-right",

            autoClose: 5000

        }

    );

}