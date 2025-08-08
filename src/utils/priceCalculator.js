import {
  meshStandard,
  solidStandard,
  meshCustom,
  solidCustom
} from "../components/PoolInputs";

// Buscar precio en arrays Standard
function findStandardPrice(array, group, poolSize) {
  const grp = array.find(g => g.group === group);
  if (!grp) return null;
  const item = grp.items.find(i => i.poolSize === poolSize);
  return item ? item.price : null;
}

// Buscar precio en arrays Custom por rango
function findCustomPrice(array, sqft, is5x5 = true) {
  const range = array.find(r => sqft >= r.min && sqft <= r.max);
  if (!range) return null;
  return (is5x5 ? range.price5x5 : range.price3x3) * sqft;
}

export function calcularPrecio({
  // === STANDARD (UI) ===
  meshEnabled, meshMeasure, meshCategory,
  solidEnabled, solidMeasure, solidCategory,

  // === CUSTOM (UI) ===
  customMeshEnabled, customSolidEnabled,
  customSqft,
  customGrid, // "5x5" | "3x3"

  // === CONTROLES GLOBALES ===
  padding, // *15
  wall,    // *45
  discount,

  // === MODO ===
  mode // "standard" | "custom"
}) {
  let meshRetail = 0;
  let solidRetail = 0;

  // === STANDARD ===
  if (mode === "standard") {
    // Mesh
    if (meshEnabled && meshMeasure && meshCategory) {
      const price = findStandardPrice(meshStandard, meshCategory, meshMeasure);
      if (price) meshRetail = price;
    }
    // Solid
    if (solidEnabled && solidMeasure && solidCategory) {
      const price = findStandardPrice(solidStandard, solidCategory, solidMeasure);
      if (price) solidRetail = price;
    }
  }

  // === CUSTOM ===
  if (mode === "custom") {
    const sqft = Number(customSqft) || 0;
    const is5x5 = (customGrid || "5x5") === "5x5";

    if (customMeshEnabled && sqft > 0) {
      meshRetail = findCustomPrice(meshCustom, sqft, is5x5) || 0;
    }
    if (customSolidEnabled && sqft > 0) {
      solidRetail = findCustomPrice(solidCustom, sqft, is5x5) || 0;
    }
  }

  // === PADDING (x15) y WALL (x45) ===
  const paddingExtra = (Number(padding) || 0) * 15;
  const wallExtra = (Number(wall) || 0) * 45;

  if (mode === "standard") {
    if (meshEnabled && meshRetail > 0) meshRetail += paddingExtra + wallExtra;
    if (solidEnabled && solidRetail > 0) solidRetail += paddingExtra + wallExtra;
  } else {
    if (customMeshEnabled && meshRetail > 0) meshRetail += paddingExtra + wallExtra;
    if (customSolidEnabled && solidRetail > 0) solidRetail += paddingExtra + wallExtra;
  }

  // === DESCUENTO DEALER ===
  const discountFactor = discount ? (1 - Number(discount) / 100) : 1;

  return {
    meshRetail,
    solidRetail,
    meshDealer: meshRetail * discountFactor,
    solidDealer: solidRetail * discountFactor
  };
}
