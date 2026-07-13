import { SCENES } from '../config.js';
import { NEBULA_DATA, WORMHOLE_DATA } from '../data/phenomena.js';

export function getObjectsForScene(sceneKey, datasets) {
  const { planets, moons, stars, galaxies, sun, exoplanets, extreme, smallBodies } = datasets;
  const list = [];

  switch (sceneKey) {
    case SCENES.EARTH:
      list.push(planets?.planets?.find((p) => p.id === 'earth'));
      break;
    case SCENES.SOLAR_SYSTEM:
      if (sun) list.push({ ...sun, id: 'sun', name: sun.name || 'Sole' });
      list.push(...(planets?.planets || []));
      list.push(...(moons?.moons || []));
      list.push(...(smallBodies?.asteroids || []));
      list.push(...(smallBodies?.comets || []));
      list.push(...(smallBodies?.kuiper || []));
      if (smallBodies?.oort) list.push(smallBodies.oort);
      break;
    case SCENES.MILKY_WAY:
      list.push(...(stars?.stars || []));
      break;
    case SCENES.EXOPLANETS:
      (exoplanets?.systems || []).forEach((system) => {
        (system.planets || []).forEach((p) => {
          list.push({ ...p, name: p.name, id: p.id, type: p.type || 'Esopianeta' });
        });
      });
      break;
    case SCENES.EXTREME:
      list.push(...(extreme?.objects || []));
      break;
    case SCENES.LOCAL_GROUP:
    case SCENES.OBSERVABLE:
      list.push(
        ...(galaxies?.galaxies || []).filter((g) =>
          g.marker?.scenes?.includes(sceneKey === SCENES.LOCAL_GROUP ? 'local_group' : 'observable')
        )
      );
      break;
    case SCENES.NEBULAE:
      list.push(...NEBULA_DATA);
      break;
    case SCENES.WORMHOLE:
      list.push(WORMHOLE_DATA);
      break;
    default:
      break;
  }

  return list.filter(Boolean);
}
