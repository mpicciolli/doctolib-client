import {AppointmentModel} from "./AppointmentModel";
import {DoctolibClientOptionModel} from "./DoctolibClientOptionModel";

var request = require('request');
var crypto = require('crypto');
var moment = require('moment');

export interface IDoctolibClient {
    authenticate(cb:(err:any, res?:any) => void):void;

    getAgenda(cb:(err:any, res?:any) => void):void;
    getAgendaAsync():Promise<any> ;

    getVisitMotive(agendaIds:string|Array<string>, cb:(err:any, res?:any) => void):void;
    getVisitMotiveAsync(agendaIds:string|Array<string>):Promise<any>;

    getAvailabilityService(agendaIds:string|Array<string>, visitMotiveId:string, startDate:string, limit:number, cb:(err:any, res?:any) => void):void;
    getAvailabilityServiceAsync(agendaIds:string|Array<string>, visitMotiveId:string, startDate:string, limit:number):Promise<any>;

    getAppointment(patientId:string, cb:(err:any, res?:any) => void):void;
    getAppointmentAsync(patientId:string):Promise<any>;

    createAppointment(appointment:AppointmentModel, cb:(err:any, res?:any) => void):void;
    createAppointmentAsync(appointment:AppointmentModel):Promise<any>;

    deleteAppointment(appointmentId:string, cb:(err:any, res?:any) => void):void;
    deleteAppointmentAsync(appointmentId:string):Promise<any>;

    setDataFormat(format:string);
}

export class DoctolibClient implements IDoctolibClient {

    private static authRessource:string = '/auth';
    private static agendaRessource:string = '/agendas';
    private static motiveRessource:string = '/visit_motives';
    private static availabilityRessource:string = '/availabilities';
    private static appointmentRessource:string = '/appointments';


    private clientAccessKey:string;
    private secretAccessKey:string;
    private url:string = "https://api.doctolib.fr/";
    private dataFormat:string;

    constructor(options:DoctolibClientOptionModel) {
        this.clientAccessKey = options.clientAccessKey;
        this.secretAccessKey = options.secretAccessKey;
        this.dataFormat = "json";

        if (options.url)
            this.url = options.url;
    }

    setDataFormat(format:string) {
        if (format === 'json' || format === 'hl7')
            this.dataFormat = format;
    }

    /**
     * To ensure you signed the request correctly.
     * @param cb
     */
    authenticate(cb:any) {
        this.apiCall("GET", DoctolibClient.authRessource, null, null, cb);
    }

    /**
     * List available agendasGET/agendas
     * @param cb
     */
    getAgenda(cb:(err:any, res:any) => void) {
        this.apiCall("GET", DoctolibClient.agendaRessource, null, null, cb);
    }

    /**
     * List visit motives
     * @param agendaIds required
     * @param cb
     */
    getVisitMotive(agendaIds:string|Array<string>, cb:(err:any, res?:any) => void) {
        if (!agendaIds)
            cb('You must pass the agendaIds parameter, array or a string format.');

        let queryString:string = this.formatParam("agenda_ids[]", agendaIds);
        this.apiCall("GET", DoctolibClient.motiveRessource, queryString, null, cb);
    }

    /**
     * Find available slots for one or several agendas
     */
    getAvailabilityService(agendaIds:string|Array<string>, visitMotiveId:string, startDate:string, limit:number, cb:(err:any, res?:any) => void) {
        if (!agendaIds)
            cb('You must pass the agendaIds parameter, array or a string format.');

        let queryString:string = this.formatParam("agenda_ids[]", agendaIds);
        queryString = queryString.concat("&visit_motive_id=", visitMotiveId, "&start_date=", startDate, "&limit=", limit.toString());
        this.apiCall("GET", DoctolibClient.availabilityRessource, queryString, null, cb);
    }

    /**
     * List patient appointments
     * @param patientId required
     * @param cb
     */
    getAppointment(patientId:string, cb:(err:any, res?:any) => void) {
        if (!patientId)
            cb('You must pass the patientId parameter.');

        let queryString:string = this.formatParam("patient_id", patientId);

        this.apiCall("GET", DoctolibClient.appointmentRessource, queryString, null, cb);
    }

    /**
     * Book an appointment required
     * @param appointment
     * @param cb
     */
    createAppointment(appointment:AppointmentModel, cb:(err:any, res?:any) => void) {
        if (!appointment)
            cb('You must pass the appointment parameter.');

        this.apiCall("POST", DoctolibClient.appointmentRessource, null, appointment, cb);
    }

    /**
     * Cancel an Appointment
     * @param appointmentId required : Doctolib ID of the appointment.
     * @param cb
     */
    deleteAppointment(appointmentId:string, cb:(err:any, res?:any) => void) {
        if (!appointmentId)
            cb('You must pass the id of the appointment.');

        this.apiCall("DELETE", DoctolibClient.appointmentRessource + "/" + appointmentId, null, null, cb);
    }


    getAgendaAsync():Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAgenda(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    getVisitMotiveAsync(agendaIds:string|Array<string>):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getVisitMotive(agendaIds, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    getAvailabilityServiceAsync(agendaIds:string|Array<string>, visitMotiveId:string, startDate:string, limit:number):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAvailabilityService(agendaIds, visitMotiveId, startDate, limit, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    getAppointmentAsync(patientId:string):Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAppointment(patientId, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    createAppointmentAsync(appointment:AppointmentModel):Promise<any> {
        return new Promise((resolve, reject) => {
            this.createAppointment(appointment, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    deleteAppointmentAsync(appointmentId:string):Promise<any> {
        return new Promise((resolve, reject) => {
            this.deleteAppointment(appointmentId, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }


    /**
     * API Base Methods
     * @param action
     * @param ressource
     * @param params
     * @param cb
     */
    private apiCall(action:string, ressource:string, params:string, content:any, cb:any) {

        if (!this.clientAccessKey || !this.secretAccessKey) {
            cb('Authenticate before making API calls');
        }

        var now = moment().utc().format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';

        let endPoint:string = ressource;
        if (params)
            endPoint = endPoint.concat(params);

        let digest:string;
        if (content) {
            digest = this.getDigest(content);
        }

        let signedUrl = this.getSignedUrl(action, endPoint, now, digest);

        let options:any;
        if (action === "POST") {
            options = this.getPostHeaders(endPoint, signedUrl, digest, now, content);
        }
        else {
            options = this.getHeaders(endPoint, signedUrl, now, action);
        }

        request(options, function (error, response, body) {
            if(error)
                return cb(body);

            if (response.statusCode === 200) {
                cb(null, body);
            }
            else {
                cb(body);
            }
        });
    }

    private getPostHeaders(endPoint:string, signedUrl:string, digest:string, date:string, content:any):any {
        return {
            url: this.url + endPoint,
            headers: {
                'Accept': 'application/vnd.doctolib.v1+' + this.dataFormat,
                'Authorization': signedUrl,
                'Date': date,
                'Content-Md5': digest,
                'Content-Type': 'application/json'
            },
            method: "POST",

            body: JSON.stringify(content)
        };
    }

    private getHeaders(endPoint:string, signedUrl:string, date:string, action:string):any {
        return {
            url: this.url + endPoint,
            headers: {
                'Accept': 'application/vnd.doctolib.v1+' + this.dataFormat,
                'Authorization': signedUrl,
                'Date': date
            },
            method: action
        };
    }

    private getDigest(content) {
        let digest:string = crypto.createHash('md5').update(JSON.stringify(content)).digest('');
        return new Buffer(digest).toString('base64');
    }

    /**
     * Format query param url
     * @param param
     * @param urlParams
     * @returns {string}
     */
    private formatParam(param:string, ...urlParams):string {
        var queryString = '';
        var sep = '?';
        if (urlParams) {
            queryString += sep + param + "=" + urlParams.filter((s) => typeof s === 'string').map((s) => encodeURIComponent(s));
            var query = urlParams.filter((s) => typeof s !== 'string');
            if (query.length) {
                queryString = '';
                query.forEach((obj) => {
                    for (var p in obj) {
                        if (!obj.hasOwnProperty(p)) {
                            continue;
                        }
                        if (obj[p]) {
                            queryString = queryString.concat(sep, param, '=', encodeURIComponent(obj[p]));
                            sep = '&';
                        }
                    }
                });
            }
            return queryString;
        }
        else {
            return queryString;
        }
    }

    /**
     * Signed API call
     * @param action
     * @param endPoint
     * @returns {string}
     */
    private getSignedUrl(action:string, endPoint:string, date:string, digest?:any):string {

        let stringToSign:string;

        stringToSign = action + "," + '' + "," + '' + "," + endPoint + "," + date;

        if (action === "POST") {
            stringToSign = action + "," + 'application/json' + "," + digest + "," + endPoint + "," + date;
        }

        let hash:string = crypto.createHmac('sha1', this.secretAccessKey).update(stringToSign).digest('');
        let signature:string = new Buffer(hash).toString('base64');
        return "APIAuth" + " " + this.clientAccessKey + ":" + signature
    }
}