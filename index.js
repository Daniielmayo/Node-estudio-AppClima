require("dotenv").config();

const {
    leerInput,
    inquirerMenu,
    pausa,
    listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    const busquedas = new Busquedas();

    let opt;

    do {
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                //?Mostrar mesaje
                const terminoDeBusqueda = await leerInput("cuidad: ");

                //Buscar los lugares
                const lugares = await busquedas.ciudad(terminoDeBusqueda);

                //?seleccionar el lugar
                const idSeleccionado = await listarLugares(lugares);
                if (idSeleccionado === "0") continue;

                const lugarSelec = lugares.find((l) => l.id === idSeleccionado);
                // console.log(lugarSelec);

                //? Guardar en DB
                busquedas.agregarHistorial(lugarSelec.nombre);

                //?Datos del clima
                const clima = await busquedas.climaLugar(
                    lugarSelec.lat,
                    lugarSelec.lng
                );

                //Mostrar resultados
                console.clear();
                console.log("\n Informacion de la cuidad\n".green);
                console.log("Cuidad: ", lugarSelec.nombre.green);
                console.log("Lat:", lugarSelec.lat);
                console.log("Lng:", lugarSelec.lng);
                console.log("Temperatura:", clima.temp);
                console.log("Mínima:", clima.min);
                console.log("Maxima:", clima.max);
                console.log("Como esta el clima:", clima.desc.green);

                break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });
                break;
        }
        if (opt !== 0) await pausa();
    } while (opt !== 0);
};

main();
