"use strict";
var request = require('request');
var crypto = require('crypto');
var moment = require('moment');
class DoctolibClient {
    constructor(options) {
        this.url = "https://api.doctolib.fr/";
        this.clientAccessKey = options.clientAccessKey;
        this.secretAccessKey = options.secretAccessKey;
        this.dataFormat = "json";
        if (options.url)
            this.url = options.url;
    }
    setDataFormat(format) {
        if (format === 'json' || format === 'hl7')
            this.dataFormat = format;
    }
    /**
     * To ensure you signed the request correctly.
     * @param cb
     */
    authenticate(cb) {
        this.apiCall("GET", DoctolibClient.authRessource, null, null, cb);
    }
    /**
     * List available agendasGET/agendas
     * @param cb
     */
    getAgenda(cb) {
        this.apiCall("GET", DoctolibClient.agendaRessource, null, null, cb);
    }
    /**
     * List visit motives
     * @param agendaIds required
     * @param cb
     */
    getVisitMotive(agendaIds, cb) {
        if (!agendaIds)
            cb('You must pass the agendaIds parameter, array or a string format.');
        let queryString = this.formatParam("agenda_ids[]", agendaIds);
        this.apiCall("GET", DoctolibClient.motiveRessource, queryString, null, cb);
    }
    /**
     * Find available slots for one or several agendas
     */
    getAvailabilityService(agendaIds, visitMotiveId, startDate, limit, cb) {
        if (!agendaIds)
            cb('You must pass the agendaIds parameter, array or a string format.');
        let queryString = this.formatParam("agenda_ids[]", agendaIds);
        queryString = queryString.concat("&visit_motive_id=", visitMotiveId, "&start_date=", startDate, "&limit=", limit.toString());
        this.apiCall("GET", DoctolibClient.availabilityRessource, queryString, null, cb);
    }
    /**
     * List patient appointments
     * @param patientId required
     * @param cb
     */
    getAppointment(patientId, cb) {
        if (!patientId)
            cb('You must pass the patientId parameter.');
        let queryString = this.formatParam("patient_id", patientId);
        this.apiCall("GET", DoctolibClient.appointmentRessource, queryString, null, cb);
    }
    /**
     * Book an appointment required
     * @param appointment
     * @param cb
     */
    createAppointment(appointment, cb) {
        if (!appointment)
            cb('You must pass the appointment parameter.');
        this.apiCall("POST", DoctolibClient.appointmentRessource, null, appointment, cb);
    }
    /**
     * Cancel an Appointment
     * @param appointmentId required : Doctolib ID of the appointment.
     * @param cb
     */
    deleteAppointment(appointmentId, cb) {
        if (!appointmentId)
            cb('You must pass the id of the appointment.');
        this.apiCall("DELETE", DoctolibClient.appointmentRessource + "/" + appointmentId, null, null, cb);
    }
    getAgendaAsync() {
        return new Promise((resolve, reject) => {
            this.getAgenda(function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    getVisitMotiveAsync(agendaIds) {
        return new Promise((resolve, reject) => {
            this.getVisitMotive(agendaIds, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    getAvailabilityServiceAsync(agendaIds, visitMotiveId, startDate, limit) {
        return new Promise((resolve, reject) => {
            this.getAvailabilityService(agendaIds, visitMotiveId, startDate, limit, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    getAppointmentAsync(patientId) {
        return new Promise((resolve, reject) => {
            this.getAppointment(patientId, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    createAppointmentAsync(appointment) {
        return new Promise((resolve, reject) => {
            this.createAppointment(appointment, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    deleteAppointmentAsync(appointmentId) {
        return new Promise((resolve, reject) => {
            this.deleteAppointment(appointmentId, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
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
    apiCall(action, ressource, params, content, cb) {
        if (!this.clientAccessKey || !this.secretAccessKey) {
            cb('Authenticate before making API calls');
        }
        var now = moment().utc().format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';
        let endPoint = ressource;
        if (params)
            endPoint = endPoint.concat(params);
        let digest;
        if (content) {
            digest = this.getDigest(content);
        }
        let signedUrl = this.getSignedUrl(action, endPoint, now, digest);
        let options;
        if (action === "POST") {
            options = this.getPostHeaders(endPoint, signedUrl, digest, now, content);
        }
        else {
            options = this.getHeaders(endPoint, signedUrl, now, action);
        }
        request(options, function (error, response, body) {
            if (error)
                return cb(body);
            if (response.statusCode === 200) {
                cb(null, body);
            }
            else {
                cb(body);
            }
        });
    }
    getPostHeaders(endPoint, signedUrl, digest, date, content) {
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
    getHeaders(endPoint, signedUrl, date, action) {
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
    getDigest(content) {
        let digest = crypto.createHash('md5').update(JSON.stringify(content)).digest('');
        return new Buffer(digest).toString('base64');
    }
    /**
     * Format query param url
     * @param param
     * @param urlParams
     * @returns {string}
     */
    formatParam(param, ...urlParams) {
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
    getSignedUrl(action, endPoint, date, digest) {
        let stringToSign;
        stringToSign = action + "," + '' + "," + '' + "," + endPoint + "," + date;
        if (action === "POST") {
            stringToSign = action + "," + 'application/json' + "," + digest + "," + endPoint + "," + date;
        }
        let hash = crypto.createHmac('sha1', this.secretAccessKey).update(stringToSign).digest('');
        let signature = new Buffer(hash).toString('base64');
        return "APIAuth" + " " + this.clientAccessKey + ":" + signature;
    }
}
DoctolibClient.authRessource = '/auth';
DoctolibClient.agendaRessource = '/agendas';
DoctolibClient.motiveRessource = '/visit_motives';
DoctolibClient.availabilityRessource = '/availabilities';
DoctolibClient.appointmentRessource = '/appointments';
exports.DoctolibClient = DoctolibClient;

//# sourceMappingURL=DoctolibClient.js.map
