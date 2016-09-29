import { AppointmentModel } from "./AppointmentModel";
import { DoctolibClientOptionModel } from "./DoctolibClientOptionModel";
export interface IDoctolibClient {
    authenticate(cb: (err: any, res?: any) => void): void;
    getAgenda(cb: (err: any, res?: any) => void): void;
    getAgendaAsync(): Promise<any>;
    getVisitMotive(agendaIds: string | Array<string>, cb: (err: any, res?: any) => void): void;
    getVisitMotiveAsync(agendaIds: string | Array<string>): Promise<any>;
    getAvailabilityService(agendaIds: string | Array<string>, visitMotiveId: string, startDate: string, limit: number, cb: (err: any, res?: any) => void): void;
    getAvailabilityServiceAsync(agendaIds: string | Array<string>, visitMotiveId: string, startDate: string, limit: number): Promise<any>;
    getAppointment(patientId: string, cb: (err: any, res?: any) => void): void;
    getAppointmentAsync(patientId: string): Promise<any>;
    createAppointment(appointment: AppointmentModel, cb: (err: any, res?: any) => void): void;
    createAppointmentAsync(appointment: AppointmentModel): Promise<any>;
    deleteAppointment(appointmentId: string, cb: (err: any, res?: any) => void): void;
    deleteAppointmentAsync(appointmentId: string): Promise<any>;
    setDataFormat(format: string): any;
}
export declare class DoctolibClient implements IDoctolibClient {
    private static authRessource;
    private static agendaRessource;
    private static motiveRessource;
    private static availabilityRessource;
    private static appointmentRessource;
    private clientAccessKey;
    private secretAccessKey;
    private url;
    private dataFormat;
    constructor(options: DoctolibClientOptionModel);
    setDataFormat(format: string): void;
    /**
     * To ensure you signed the request correctly.
     * @param cb
     */
    authenticate(cb: any): void;
    /**
     * List available agendasGET/agendas
     * @param cb
     */
    getAgenda(cb: (err: any, res: any) => void): void;
    /**
     * List visit motives
     * @param agendaIds required
     * @param cb
     */
    getVisitMotive(agendaIds: string | Array<string>, cb: (err: any, res?: any) => void): void;
    /**
     * Find available slots for one or several agendas
     */
    getAvailabilityService(agendaIds: string | Array<string>, visitMotiveId: string, startDate: string, limit: number, cb: (err: any, res?: any) => void): void;
    /**
     * List patient appointments
     * @param patientId required
     * @param cb
     */
    getAppointment(patientId: string, cb: (err: any, res?: any) => void): void;
    /**
     * Book an appointment required
     * @param appointment
     * @param cb
     */
    createAppointment(appointment: AppointmentModel, cb: (err: any, res?: any) => void): void;
    /**
     * Cancel an Appointment
     * @param appointmentId required : Doctolib ID of the appointment.
     * @param cb
     */
    deleteAppointment(appointmentId: string, cb: (err: any, res?: any) => void): void;
    getAgendaAsync(): Promise<any>;
    getVisitMotiveAsync(agendaIds: string | Array<string>): Promise<any>;
    getAvailabilityServiceAsync(agendaIds: string | Array<string>, visitMotiveId: string, startDate: string, limit: number): Promise<any>;
    getAppointmentAsync(patientId: string): Promise<any>;
    createAppointmentAsync(appointment: AppointmentModel): Promise<any>;
    deleteAppointmentAsync(appointmentId: string): Promise<any>;
    /**
     * API Base Methods
     * @param action
     * @param ressource
     * @param params
     * @param cb
     */
    private apiCall(action, ressource, params, content, cb);
    private getPostHeaders(endPoint, signedUrl, digest, date, content);
    private getHeaders(endPoint, signedUrl, date, action);
    private getDigest(content);
    /**
     * Format query param url
     * @param param
     * @param urlParams
     * @returns {string}
     */
    private formatParam(param, ...urlParams);
    /**
     * Signed API call
     * @param action
     * @param endPoint
     * @returns {string}
     */
    private getSignedUrl(action, endPoint, date, digest?);
}
