import { z } from 'zod';

const entitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
}).passthrough();

export const planetDatasetSchema = z.object({
  planets: z.array(entitySchema),
});

export const moonDatasetSchema = z.object({
  moons: z.array(entitySchema),
});

export const starDatasetSchema = z.object({
  stars: z.array(entitySchema),
});

export const galaxyDatasetSchema = z.object({
  galaxies: z.array(entitySchema),
  catalog: z
    .object({
      clusters: z
        .record(
          z.string(),
          z
            .object({
              label: z.string(),
              radius: z.number(),
              center: z.tuple([z.number(), z.number(), z.number()]).optional(),
              labelOffset: z.number().optional(),
            })
            .passthrough()
        )
        .optional(),
    })
    .passthrough()
    .optional(),
}).passthrough();

export const sunDatasetSchema = entitySchema;

export const nasaDatasetSchema = z.object({
  missions: z
    .array(
      z.object({
        name: z.string(),
        launch: z.string(),
        status: z.string(),
      }).passthrough()
    )
    .optional(),
  phenomena: z
    .array(
      z.object({
        name: z.string(),
      }).passthrough()
    )
    .optional(),
});

const exoplanetPlanetSchema = entitySchema.extend({
  classification: z.string().optional(),
}).passthrough();

export const exoplanetDatasetSchema = z.object({
  systems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      planets: z.array(exoplanetPlanetSchema),
    }).passthrough()
  ),
}).passthrough();

export const extremeObjectDatasetSchema = z.object({
  objects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
    }).passthrough()
  ),
}).passthrough();

export const smallBodiesDatasetSchema = z.object({
  asteroids: z.array(entitySchema).optional(),
  comets: z.array(entitySchema).optional(),
  kuiper: z.array(entitySchema).optional(),
  oort: entitySchema.optional(),
}).passthrough();

const validators: Record<string, z.ZodTypeAny> = {
  '/data/planets.json': planetDatasetSchema,
  '/data/moons.json': moonDatasetSchema,
  '/data/stars.json': starDatasetSchema,
  '/data/galaxies.json': galaxyDatasetSchema,
  '/data/sun.json': sunDatasetSchema,
  '/data/nasa.json': nasaDatasetSchema,
  '/data/exoplanets.json': exoplanetDatasetSchema,
  '/data/extreme-objects.json': extremeObjectDatasetSchema,
  '/data/small-bodies.json': smallBodiesDatasetSchema,
};

/**
 * Valida un dataset JSON caricato; in caso di errore logga e restituisce i dati grezzi.
 */
export function validateCatalog<T>(url: string, data: unknown): T {
  const schema = validators[url];
  if (!schema) return data as T;

  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(`Validazione catalogo ${url}:`, result.error.flatten());
    return data as T;
  }
  return result.data as T;
}
