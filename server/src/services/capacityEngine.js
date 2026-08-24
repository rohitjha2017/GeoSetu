/**
 * capacityEngine.js
 *
 * PROTOTYPE CAPACITY MODEL.
 *
 * A relocation site's "practical" capacity is constrained by whichever
 * major infrastructure factor is weakest (land, water, healthcare, road),
 * after subtracting the population already living at the site. This is a
 * simplified prototype heuristic, not an engineering capacity study.
 */

export function computeSiteCapacity(site) {
  const factors = {
    land: site.landCapacity,
    housing: site.housingCapacity,
    water: site.waterInfraCapacity,
    healthcare: site.healthcareInfraCapacity,
    road: site.roadInfraCapacity
  };

  const weakestFactorName = Object.entries(factors).reduce((min, [name, value]) =>
    value < min.value ? { name, value } : min
  , { name: null, value: Infinity }).name;

  const grossPracticalCapacity = Math.min(...Object.values(factors));
  const netAvailableCapacity = Math.max(0, grossPracticalCapacity - (site.existingPopulation || 0));

  return {
    siteId: site.id,
    factors,
    weakestFactor: weakestFactorName,
    estimatedPracticalCapacity: grossPracticalCapacity,
    existingPopulation: site.existingPopulation || 0,
    netAvailableCapacity,
    note: "Estimated prototype calculation — practical capacity is bounded by the weakest infrastructure factor, then reduced by the site's existing population."
  };
}

export function canAccommodate(site, villagePopulation) {
  const cap = computeSiteCapacity(site);
  return {
    ...cap,
    villagePopulation,
    sufficient: cap.netAvailableCapacity >= villagePopulation,
    shortfall: Math.max(0, villagePopulation - cap.netAvailableCapacity)
  };
}
