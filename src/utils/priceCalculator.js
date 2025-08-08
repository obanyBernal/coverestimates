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
  return is5x5 ? range.price5x5 * sqft : range.price3x3 * sqft;
}

export function calcularPrecio({
  meshEnabled, meshMeasure, meshCategory,
  solidEnabled, solidMeasure, solidCategory,
  customSqft,
  padding, wall, discount,
  mode // "standard" | "custom"
}) {
  let meshRetail = 0;
  let solidRetail = 0;
  if (meshEnabled || solidEnabled) {
    customSqft = 0;
  }
  if (mode === "standard") {
    if (meshEnabled && meshMeasure && meshCategory) {
      const price = findStandardPrice(meshStandard, meshCategory, meshMeasure);
      if (price) meshRetail = price;
    }
    if (solidEnabled && solidMeasure && solidCategory) {
      const price = findStandardPrice(solidStandard, solidCategory, solidMeasure);
      if (price) solidRetail = price;
    }
  }

  if (mode === "custom") {
    if (meshEnabled && customSqft) {
      meshRetail = findCustomPrice(meshCustom, Number(customSqft), true) || 0;
    }
    if (solidEnabled && customSqft) {
      solidRetail = findCustomPrice(solidCustom, Number(customSqft), true) || 0;
    }
  }

  // Padding multiplicado por 15 solo si el tipo está habilitado y tiene precio
  if (padding) {
    const paddingExtra = (Number(padding) || 0) * 15;
    if (meshEnabled && meshRetail > 0) meshRetail += paddingExtra;
    if (solidEnabled && solidRetail > 0) solidRetail += paddingExtra;
  }

  // Wall multiplicado por 45 solo si el tipo está habilitado y tiene precio
  if (wall) {
    const wallExtra = (Number(wall) || 0) * 45;
    if (meshEnabled && meshRetail > 0) meshRetail += wallExtra;
    if (solidEnabled && solidRetail > 0) solidRetail += wallExtra;
  }

  const discountFactor = discount ? (1 - Number(discount) / 100) : 1;

  return {
    meshRetail,
    solidRetail,
    meshDealer: meshRetail * discountFactor,
    solidDealer: solidRetail * discountFactor
  };
}
