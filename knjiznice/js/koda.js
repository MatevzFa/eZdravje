
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
* Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
* enolične ID številke za dostop do funkcionalnosti
* @return enolični identifikator seje za dostop do funkcionalnosti
*/
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
* Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
* generiranju podatkov je potrebno najprej kreirati novega pacienta z
* določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
* shraniti nekaj podatkov o vitalnih znakih.
* @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
* @return ehrId generiranega pacienta
*/
function generirajPodatke(stPacienta) {
    ehrId = "";
    var d;
    var y;
    var m;
    var day;
    var h;
    var min;
    // TODO: Potrebno implementirati

    switch(stPacienta) {
        case 1:
            // Peter Plešasti, otrok, ki raste.
            ehrId = createEHR('Peter', 'Plešasti', '2004-01-06T08:31', 'MALE');
            y = 2010;
            m = 5;
            day = 25;
            h = 15;
            min = 21;
            for (var i = 0; i < 6; i++) {
                var rng = Math.floor((Math.random() * 100) + 1);
                d = new Date(y + i, (m + rng)%3 + 3, day, (h+rng*rng)%24, (min+rng)%24);
                dodajMeritve(ehrId, {
                    merilec : 'Peter Plešasti',
                    datum   : d.toISOString().substring(0, 16),
                    visina  : 80.0 + i * 2.5 * 2.54,
                    teza    : 21 + 3*i,
                    kisik   : ((96 + (3+21*i)%4)/100).toFixed(2),
                    temperatura : (36.3 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1),
                    sistolicni  : (100+2*i).toFixed(1),
                    diastolicni : (69+i).toFixed(1)
                });
            }
            break;
        case 2:
            // Bine Blatni, zdrav posameznik, ki v februarju vodi evidenco vitalnih znakov vsak drugi dan.
            ehrId = createEHR('Bine', 'Blatni', '1974-05-12T17:34', 'MALE');
            y = 2016;
            m = 2;
            day = 3;
            h = 9;
            min = 15;
            for (var i = 0; i < 10; i++) {
                var rng = Math.floor((Math.random() * 100) + 1);
                d = new Date(y, m, day + 2*i, (h+rng*rng)%24, (min+rng*12345)%60);
                dodajMeritve(ehrId, {
                    merilec : 'Bine Blatni',
                    datum   : d.toISOString().substring(0, 16),
                    visina  : 184 + rng%2,
                    teza    : 80,
                    kisik   : ((96 + (3+21*i)%4)/100).toFixed(2),
                    temperatura   : (36.3 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1),
                    sistolicni    : (118.0 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1),
                    diastolicni   : (70.0 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1)
                });
            }
            break;
        case 3:
            // Magdalena Morska, študentka, ki je v času izpitnega obdobja zaradi stresa zbolela (povišan pritisk in vročina).
            ehrId = createEHR('Magdalena', 'Morska', '1993-11-08T01:55', 'FEMALE')
            y = 2015;
            m = 6;
            day = 11;
            h = 15;
            min = 23;
            for (var i = 0; i < 10; i++) {
                var rng = Math.floor((Math.random() * 100) + 1);
                d = new Date(y, m, day + i, (h+rng*rng)%24, (min+rng*12345)%60);
                dodajMeritve(ehrId, {
                    merilec : 'Magdalena Morska',
                    datum   : d.toISOString().substring(0, 16),
                    visina  : 170,
                    teza    : 57,
                    kisik   : ((96 + (3+21*i)%4)/100).toFixed(2),
                    temperatura : ( i <= 6  ? (36.3 + ((213*i)%5)/7*Math.pow(-1,i)) : (38.6 + ((213*i)%5)/7*Math.pow(-1,i))   ).toFixed(1),
                    sistolicni  : ( i <= 6 ? (118.0 + ((213*i)%5)/7*Math.pow(-1,i)) : (135.0 + ((213*i)%5)/7*Math.pow(-1,i))     ).toFixed(1),
                    diastolicni : ( i <= 6 ? (70.0 + ((213*i)%5)/7*Math.pow(-1,i)) : (85.0 + ((213*i)%5)/7*Math.pow(-1,i))     ).toFixed(1)
                });
            }
            break;

            /**
            *  [ef43c2e0-8316-4215-bd77-83d379359923] - Peter Plešasti
            *  [449bfa6a-6445-4109-8fdf-4545879a51a3] - Bine Blatni
            *  [278559ea-d4d2-4307-aa48-97387d047b0a] - Magdalena Morska
            */
    }


    // console.log(ehrId);
    return ehrId;
}

function generiraj() {
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function createEHR(ime, priimek, datumRojstva, spol) {
    // console.log(ime, priimek, datumRojstva);
    sessionId = getSessionId();
    $.ajaxSetup({
        headers: {"Ehr-Session" :   sessionId}
    })
    var response = $.ajax({
        url     :   baseUrl + '/ehr',
        async   :   false,
        type    :   'POST',
        success :   function(data) {
                        var ehrId = data.ehrId;
                        var partyData = {
                            firstNames: ime,
                            lastNames: priimek,
                            gender: spol,
                            dateOfBirth: datumRojstva,
                            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
                        };
                        $.ajax({
                            url: baseUrl + "/demographics/party",
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(partyData),
                            success: function (party) {
                                if (party.action == 'CREATE') {
                                    // console.log("Uspeh. [%s]", ehrId);
                                }
                                $('#createMsg').text('Uspešno dodan vnos. Pridobljen Ehr ID za'+ ime + ' ' + priimek + ' ('+ ehrId +') je bil vstavljen v ustrezna polja.');
                                console.log('Uspešno dodan vnos. Pridobljen Ehr ID za'+ ime + ' ' + priimek + ' ('+ ehrId +') je bil vstavljen v ustrezna polja.');
                                // $('#branje_EhrId').val(ehrId);
                                $('#dodajanje_EhrId').val(ehrId);
                                $('#branje_EhrId').val(ehrId);
                            },
                            error: function(err) {
                                $('#createMsg').text('Prišlo je do napake.');
                                console.log("Napaka");
                            }
                        });
                    }
    });
    // console.log(response);
    return response.responseJSON.ehrId;
}

function dodajMeritve(ehrId, vitalniZnaki) {
    // console.log(vitalniZnaki);
    var sessionId = getSessionId();
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": vitalniZnaki.datum,
		    "vital_signs/height_length/any_event/body_height_length": vitalniZnaki.visina,
		    "vital_signs/body_weight/any_event/body_weight": vitalniZnaki.teza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": vitalniZnaki.temperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": vitalniZnaki.sistolicni,
		    "vital_signs/blood_pressure/any_event/diastolic": vitalniZnaki.diastolicni,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": vitalniZnaki.kisik
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: vitalniZnaki.merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $('#addMsg').text('Uspešno dodane meritve. Za branje so na voljo v naslednjem razdelku.');
		    },
		    error: function(err) {
		    	// console.log('Napaka pri dodajanju meritev.\n', err);
                $('#addMsg').text('Vnešeni podatki niso pravilni.');
		    }
		});
}

function preberiMeritve(ehrId) {
    var sessionId = getSessionId();

    $('#prebraniPodatki tbody').empty();
    $("#ageWarning div.row").remove();
    // Pridobi podatke o uporabnikovi starosti
    $.ajax({
        url :   baseUrl + "/demographics/ehr/" + ehrId +"/party",
        type: "GET",
        headers: {"Ehr-Session": sessionId},
        success: function (response2) {
            // console.log("party\n",response2);
            var date1 = new Date(response2.party.dateOfBirth);
            var date2 = new Date();

            if (     (date2.getTime()- date1.getTime())/(1000*60*60*24*365) < 18     ) {
                $("#ageWarning").prepend('<div class="row text-center" style="background-color: rgba(255,0,0,0.5);padding: 5px 0"><strong>Podatki za osebe mlajše od 18 let niso natančni.</strong></div>')
            }

            $.ajax({
                url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure?" + $.param({limit: 20}),
                type: 'GET',
                headers: {"Ehr-Session": sessionId},
                success: function (response) {
                    if (response.length > 0) {
                        // console.log(response);
                        var TLAK_SLO = {
                            systolic : {}
                        }
                        // Pridobi podatke o pričakovanih ravneh krvnega tlaka.
                        $.ajax({
                            url     :   "http://apps.who.int/gho/athena/data/GHO/BP_06.json?profile=simple&filter=AGEGROUP:*;SEX:*;COUNTRY:*",
                            dataType:   "jsonp",
                            success :   function(data) {
                                            for(var i = 0; i < data.fact.length; i++) {
                                                if (data.fact[i].dim.COUNTRY == "Slovenia" && data.fact[i].dim.YEAR == "2014") {

                                                    TLAK_SLO.systolic[data.fact[i].dim.SEX] = data.fact[i].Value;
                                                }
                                            }

                                            for (var i = 0; i < response.length; i++) {
                                                var gender = (response2.party.gender == 'FEMALE' ? 'Female' : (response2.party.gender == 'MALE' ? 'Male' : 'Both sexes'));
                                                // console.log(gender);
                                                var press = parseInt(TLAK_SLO.systolic[gender].substring(0, 5)) < response[i].systolic;
                                                $('#prebraniPodatki tbody').append(' \
                                                    <tr style="background-color: rgba('+ (press ? '255,0,0' : '255,255,255') +', 0.3)"> \
                                                        <th scope="row">' + (i+1) + '</td> \
                                                        <td>' + response[i].time.substring(0, 16) + '</td> \
                                                        <td>' + response[i].systolic.toFixed(1) + ' / ' + response[i].diastolic.toFixed(1) + (press ? '<span style="margin-left: 10px; color:#999">Povišan krvni tlak</span>' : '') +'</td> \
                                                        <td>'+ (press ? '<a class="twitter-tweet" href="https://twitter.com/intent/tweet">Tweet</a>' : '') +'</td> \
                                                    </tr> \
                                                ');
                                            }

                                        },
                            error   :   function(err) {
                                            $('#readMsg').text('Dostop do WHO ni uspel.');
                                        }
                        });
                    } else {
                        console.log('nothing\n', response);
                    }
                },
            });
        },
        error: function(err) {
            $('#readMsg').text('Vnešeni podatki niso pravilni.');
        }
    })



}

function createEHRClick() {
    $('#addEhrId').val(createEHR($('#createIme').val(), $('#createPriimek').val(), $('#createRojstvo').val(), $('select[name="createSpol"]').val()));

    $('#createIme').val('');
    $('#createPriimek').val('');
    $('#createRojstvo').val('');
}

function dodajMeritveClick() {
    var date = new Date();
    dodajMeritve($('#dodajanje_EhrId').val(), {
        datum       :   date.toISOString(),
        visina      :   $('#addVisina').val(),
        teza        :   $('#addTeza').val(),
        temperatura :   $('#addTemperatura').val(),
        sistolicni  :   $('#addSistolicni').val(),
        diastolicni :   $('#addDiastolicni').val(),
        kisik       :   $('#addKisik').val(),
        merilec     :   'uporabnik'
    });
    $('#addVisina').val('');
    $('#addTeza').val('');
    $('#addTemperatura').val('');
    $('#addSistolicni').val('');
    $('#addDiastolicni').val('');
    $('#addKisik').val('');
}

function preberiMeritveClick() {
    preberiMeritve($('#branje_EhrId').val());
}


$(window).load( function() {
    $("#dodajanje_selectEhrId").change(function() {
        // console.log($('#dodajanje_selectEhrId').val());
        $('#dodajanje_EhrId').val($('#dodajanje_selectEhrId').val());
    });
    $("#branje_selectEhrId").change(function() {
        // console.log($('#branje_selectEhrId').val());
        $('#branje_EhrId').val($('#branje_selectEhrId').val());
    });
});
