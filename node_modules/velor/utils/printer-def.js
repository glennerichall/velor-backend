export function getSchema() {
    return {
        bedType: {
            value: ["Circular", "Rectangular"],
            name: 'Bed type',
            onChange: (value, controllers, printer) => {
                if (value === 'Circular') {
                    controllers.bedSize.replace({
                        diameter: 100,
                        z: printer.bedSize.z
                    });
                } else {
                    controllers.bedSize.replace({
                        x: 200,
                        y: 200,
                        z: printer.bedSize.z
                    });
                }
            }
        },
        gcodeFlavor: {
            value: ["Marlin", "Teacup", "Mach3"],
            name: 'Gcode flavor'
        },
        extruders: {
            value: [1, 2, 3, 4, 5, 6, 7, 8],
            name: 'Number of extruders'
        },
        model: 'Model name',
        bedSize: 'Bed size',
        originAtCenter: 'Origin at center of bed',
        heatedBed: 'Heated bed',
        nozzle: 'Nozzle diameter (mm)',
        filament: 'Filament diameter (mm)'
    };
}

export function getPrinter() {
    return {
        model: 'Ender 3',
        name: 'Hello World',
        bedType: "Rectangular",

        bedSize: {
            x: 100,
            y: 100,
            z: 100
        },

        originAtCenter: false,
        heatedBed: true,
        gcodeFlavor: 'Marlin',
        extruders: 1,
        nozzle: 4,
        filament: 1.75
    };
}
