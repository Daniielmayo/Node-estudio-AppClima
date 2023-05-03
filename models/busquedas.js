const fs = require("fs");
const axios = require("axios");

class Busquedas {
    historial = [];
    dbPath = "./db/database.json";
    constructor() {
        //TODO: lEER DB SI EXISTE
        this.leerDB();
    }

    get historialCapitalizado() {
        //todo Capitalizado cada palabra

        return this.historial.map((lugar) => {
            let palabras = lugar.split(" ");
            palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

            return palabras.join(" ");
        });
    }

    get paramsMapbox() {
        return {
            access_token: process.env.MAPBOX_KEY,
            limit: 4,
            language: "es",
        };
    }

    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: "metric",
            lang: "es",
        };
    }

    async ciudad(lugar = "") {
        try {
            //Peticion http
            // console.log("cuidad", lugar);

            const interce = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox,
            });

            const resp = await interce.get();

            return resp.data.features.map((lugar) => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));
        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat, lon) {
        try {
            //intance axios.create()
            //resp
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon },
            });
            const resp = await instance.get();
            const { weather, main } = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            };
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial(lugar = "") {
        //todo prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        //todo limite de historial
        this.historial = this.historial.splice(0, 5);

        //todo grabar duplicados
        this.historial.unshift(lugar.toLocaleLowerCase());

        //todo garbar en base de datos
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial,
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {
        if (!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}

module.exports = Busquedas;
