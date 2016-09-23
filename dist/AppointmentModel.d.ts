import { DoctolibPatientModel } from "./DoctolibPatientModel";
export interface AppointmentModel {
    visit_motive_id: string;
    agenda_id: string;
    start_date: string;
    patient_id?: string;
    patient?: DoctolibPatientModel;
}
