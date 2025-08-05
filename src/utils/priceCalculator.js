// Tablas de ejemplo para Custom - debes reemplazar por los datos reales de tu PDF

const meshCustomPricing = {
    "5x5": [
        { min: 1, max: 49, price: 3.95 },
        { min: 50, max: 99, price: 4.03 },
        { min: 100, max: 199, price: 4.02 },
        { min: 200, max: 299, price: 4.01 },
        { min: 300, max: 349, price: 3.92 },
        { min: 350, max: 399, price: 3.90 },
        { min: 400, max: 449, price: 4.06 },
        { min: 450, max: 499, price: 3.78 },
        { min: 500, max: 599, price: 3.72 },
        { min: 600, max: 649, price: 3.52 },
        { min: 650, max: 699, price: 3.47 },
        { min: 700, max: 799, price: 3.29 },
        { min: 800, max: 899, price: 3.19 },
        { min: 900, max: 999, price: 3.06 },
    ],
    "3x3": [
        { min: 1, max: 49, price: 5.6 },
        { min: 50, max: 99, price: 5.33 },
        { min: 100, max: 199, price: 5.14 },
        { min: 200, max: 299, price: 5.02 },
        { min: 300, max: 349, price: 4.74 },
        { min: 350, max: 399, price: 4.73 },
        { min: 400, max: 449, price: 4.90 },
        { min: 450, max: 499, price: 4.74 },
        { min: 500, max: 599, price: 4.63 },
        { min: 600, max: 649, price: 4.63 },
        { min: 650, max: 699, price: 4.46 },
        { min: 700, max: 799, price: 4.43 },
        { min: 800, max: 899, price: 4.23 },
        { min: 900, max: 999, price: 4.04 },
    ]
};

// Simulación de precios estándar (puedes luego usar tabla real del PDF)
const meshStandardPrice = 3.5; // por pie²
const solidStandardPrice = 4.5;

const wallPricePerFoot = 45;

function parsePoolSize(input) {
    const parts = input.toLowerCase().replace(/\s/g, "").split("x");
    if (parts.length !== 2) return null;
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (isNaN(width) || isNaN(height)) return null;
    return { width: width + 2, height: height + 2 }; // CS = PS + 2
}

function findCustomPrice(area, table) {
    const range = table.find(r => area >= r.min && area <= r.max);
    return range ? range.price : 0;
}

export function calcularPrecio(poolSizeStr, wallFeet, discount, poolType) {
    const cs = parsePoolSize(poolSizeStr);
    if (!cs) return null;

    const area = cs.width * cs.height;
    const wallCharge = wallFeet ? parseFloat(wallFeet) * wallPricePerFoot : 0;
    const discountFactor = discount ? (1 - parseFloat(discount) / 100) : 1;

    const [material, size, type] = poolType.split("-"); // ej. mesh-5x5-custom
    console.log("Material seleccionado:", material); // ahora sí se usa
    let meshRetail = 0;
    let solidRetail = 0;


    if (type === "custom") {
        meshRetail = findCustomPrice(area, meshCustomPricing[size]) * area;
        solidRetail = findCustomPrice(area, meshCustomPricing[size]) * area + 100; // puedes ajustar aquí
    } else {
        meshRetail = meshStandardPrice * area;
        solidRetail = solidStandardPrice * area;
    }

    // Sumar "wall" a ambos
    meshRetail += wallCharge;
    solidRetail += wallCharge;

    return {
        meshRetail,
        solidRetail,
        meshDealer: meshRetail * discountFactor,
        solidDealer: solidRetail * discountFactor,
    };
}
