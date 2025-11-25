import { Particles } from "./attractor.js";

const g_attractor_consts = {
    halvorsen: {
        consts: [1.89],
        speed: 1 / 80,
        angles: [0.57828, 5.8058, 0.],
        scale: 3.,
        camera: [0, -0.5, 0],
        ortho: 4.
    },
    lorenz: {
        consts: [10., 28., 8. / 3.],
        speed: 1 / 100,
        angles: [0.0, 0.0, 0.0],
        scale: 4.0,
        camera: [0.0, 5.0, 25.0],
        ortho: 4.25
    },
    thomas: {
        consts: [0.1998],
        speed: 1 / 100,
        angles: [2.23, -2.97, 0.],
        scale: 4,
        camera: [0, 0, 0],
        ortho: 4
    },
    sprott: {
        consts: [2.07, 1.79],
        speed: 1 / 10,
        angles: [1.75, 1., 0.45],
        scale: .65,
        camera: [1, -0.5, -0.5],
        ortho: 2.5
    },
    dadras: {
        consts: [3, 2.7, 1.7, 2, 9],
        speed: 1 / 35,
        angles: [2.69, -3.06, 0.],
        scale: 1.,
        camera: [1.5, -0.25, 0],
        ortho: 5.5
    }
};

let simulation = null;

function load_attractor(options = {}) {
    options = Object.assign({
        attractor: "halvorsen",
        canvasID: "attractor-canvas",
        particleCount: 1e5
    }, options);

    const attributes = g_attractor_consts[options.attractor];

    const simulatorOptions = Object.assign({
        num_particles: options.particleCount
    }, attributes);

    // Eski simülasyonu tamamen durdur
    if (simulation && simulation.destroy) {
        simulation.destroy();
    }


    if (simulation && typeof simulation.destroy === "function") {
    simulation.destroy();   // eski simülasyonu durdur
    }

    // Yeni sim başlat
    simulation = new Particles(
        document.getElementById(options.canvasID),
        simulatorOptions
    );

    // API
    return {
        destroy() {
            simulation?.destroy?.();
        },
        reset() {
            simulation?.destroy?.();
            simulation = new Particles(
                document.getElementById(options.canvasID),
                simulatorOptions
            );
        },
        setScale(v) {
            if (simulation) simulation.m_scale = parseFloat(v);
        }
    };
}

export { load_attractor, g_attractor_consts, simulation };
