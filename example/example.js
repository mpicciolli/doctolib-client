var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var DoctolibClient = require('../dist/DoctolibClient').DoctolibClient;


// Create an API client
var options = {
    clientAccessKey: process.env.clientAccessKey,
    secretAccessKey: process.env.secretAccessKey,
    url: "https://api-interf.doctolib.net"//SandBox
};

var client = new DoctolibClient(options);

app.get('/agenda', function (req, res) {
    client.getAgenda(function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get('/visitMotive', function (req, res) {
    var agendaId = req.query.agendaId;

    client.getVisitMotive(agendaId, function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get('/availabilityService', function (req, res) {
    var agendaId = req.query.agendaId;
    var visitMotiveId = req.query.visitMotiveId;
    var date = req.query.date;

    client.getAvailabilityService(agendaId, visitMotiveId, date, 7, function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.post('/appointment', function (req, res) {
    client.createAppointment(req.body, function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get('/appointment', function (req, res) {
    var patientId = req.query.patientId;

    client.getAppointment(patientId, function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.delete('/appointment', function (req, res) {
    var appointmentId = req.query.appointmentId;

    client.deleteAppointment(appointmentId, function (err, data) {
        if (err) {
            res.send(err);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.listen(3000);

