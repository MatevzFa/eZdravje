
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
            ehrId = createEHR('Peter', 'Plešasti', '2004-01-06T08:31')
            // console.log(d.toISOString().substring(0, 16));

            y = 2010;
            m = 5;
            day = 25;
            h = 15;
            min = 21;
            for (var i = 0; i < 6; i++) {
                var rng = Math.floor((Math.random() * 100) + 1);
                // console.log(rng);
                // console.log(y + i, (m + rng)%12 + 1, day, (h+rng*rng)%24, (min+rng)%24);
                d = new Date(y + i, (m + rng)%3 + 3, day, (h+rng*rng)%24, (min+rng)%24);
                // console.log(d.toISOString().substring(0, 16));
                dodajMeritve(ehrId, {
                    merilec : 'Sestra Sonja',
                    datum   : d.toISOString().substring(0, 16),
                    visina   : 80.0 + i * 2.5 * 2.54,
                    teza   : 21 + 3*i,
                    temperatura   : (36.3 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1),
                    kisik   : ((96 + (3+21*i)%4)/100).toFixed(2),
                    sistolicni   : (100+2*i).toFixed(1),
                    diastolicni   : (69+i).toFixed(1)
                });
                // vitalniZnaki.datum = d.toISOString().substring(0, 16);
                // vitalniZnaki.visina = 80.0 + i * 2.5 * 2.54;
                // vitalniZnaki.temperatura = (36.3 + ((213*i)%5)/7*Math.pow(-1,i)).toFixed(1);
                // vitalniZnaki.diastolicni = (69+i).toFixed(1);
                // vitalniZnaki.sistolicni = (100+2*i).toFixed(1);
                // vitalniZnaki.kisik = ((96 + (3+21*i)%4)/100).toFixed(2);
                // vitalniZnaki.teza = 21 + 3*i;

                // dodajMeritve(ehrId, vitalniZnaki);
            }
            break;
        case 2:
            // Bine Blatni
            ehrId = createEHR('Bine', 'Blatni', '1974-05-12T17:34')
            break;
        case 3:
            // Magdalena Morska
            ehrId = createEHR('Magdalena', 'Morska', '1985-11-08T01:55')
            break;

        /**
        * [afe411c3-5b84-42ce-8c10-01b68cfb1ad3] -- Peter Plešasti
        * [3524f79f-eeac-4599-a368-e83561f68ca9] -- Bine Blatni
        * [66f2b856-a779-45f2-9097-cca62c7e6fbe] -- Magdalena Morska
        */
    }


    console.log(ehrId);
    return ehrId;
}

function generiraj() {
    generirajPodatke(1);
    // generirajPodatke(2);
    // generirajPodatke(3);
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function createEHR(ime, priimek, datumRojstva) {
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
                                    console.log("Uspeh. [%s]", ehrId);
                                }
                            },
                            error: function(err) {
                                console.log("Napaka");
                            }
                        });
                    }
    });
    console.log(response);
    return response.responseJSON.ehrId;
}

function dodajMeritve(ehrId, vitalniZnaki) {
    console.log(vitalniZnaki);
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
		        $("#dodajMeritveVitalnihZnakovSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
}
