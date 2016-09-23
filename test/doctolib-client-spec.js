var expect = require('chai').expect;

var DoctolibClient = require('../dist/DoctolibClient').DoctolibClient;

describe('Doctolib API Client:', function () {

    var client;

    before(function (done) {

        var options = {
            clientAccessKey: process.env.clientAccessKey,
            secretAccessKey: process.env.secretAccessKey,
            url: "https://api-interf.doctolib.net"//SandBox
        };

        client = new DoctolibClient(options);
        done();
    });

    describe('Authentication functionality:', function () {
        it('Should Authenticated', function (done) {
            client.authenticate(function (err, data) {
                expect(err).to.eq(null);
                expect(data).to.not.equal(null);
                done();
            });
        });
    });

    describe('Get agendas', function(){
        it('Should get Agendas', function(done){
            client.getAgenda(function (err, data) {
                expect(err).to.eq(null);
                expect(data).to.not.equal(null);
                done();
            });
        });
    });
});