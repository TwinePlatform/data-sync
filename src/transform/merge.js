/*
 * Merge algorithm for DB entities
 *
 * Broadly follows these steps:
 *   1. Get list of entity types (e.g. organisation, user, visit_event, etc.)
 *   2. For each entity type
 *     i. if `primary` doesn't have that entity type, attach all the entities
 *        of that type from `secondary`
 *     ii. if `primary` does have that entity type
 *       a. for each entity of that type in `secondary`, check if it matches
 *          any entity in `primary`
 *       b. if it matches, merge the two, generating a new primary key, replacing
 *          the old foriegn keys in `primary` and `secondary`
 *       c. if no matches are found, push the entity from `secondary` into the
 *          `primary` data structure
 */
const { keys, union } = require('ramda');
const uuid = require('uuid/v4');
const EntityFns = require('./entity_matchers');


const FKName = (from, to) => `fk_${from}_to_${to}`;
const getFK = (o, { from, to }) => o[FKName(from, to)];


module.exports = (primary, secondary) => {
  // Step 1.
  const entities = union(keys(primary), keys(secondary));

  // Step 2.
  entities.forEach((entity) => {

    if (!EntityFns.hasOwnProperty(entity)) {
      console.log(`No "merge" functions found for ${entity}`);
      return;
    }

    // Step 2.ii
    if (primary.hasOwnProperty(entity)) {

      for (let ii = 0; ii < (secondary[entity] || []).length; ii++) {
        const eS = secondary[entity][ii];
        let isMerged = false;

        for (let jj = 0; jj < (primary[entity] || []).length; jj++) {
          const eP = primary[entity][jj];

          // Step 2.ii.a
          if (EntityFns[entity].doMatch(eP, eS)) {
            // Step 2.ii.b

            // Generate new primary keys
            const newPK = uuid();
            const oldPrimaryPK = eP[`${entity}_id`];
            const oldSecondaryPK = eS[`${entity}_id`];

            eP[`${entity}_id`] = newPK;
            eS[`${entity}_id`] = newPK;

            // Replace foreign key references in primary
            for (let kk = 0; kk < entities.length; kk++) {
              if (entities[kk] === entity || entities[kk] === 'organisation') {
                continue;
              }

              const element = primary[entities[kk]];

              if (element && Array.isArray(element)) {
                for (let ll = 0; ll < element.length; ll++) {
                  const inner = element[ll];

                  if (getFK(inner, { from: entities[kk], to: entity }) === oldPrimaryPK) {
                    inner[`fk_${entities[kk]}_to_${entity}`] = newPK;
                  }
                }
              }
            }

            // Replace foreign key references in secondary
            for (let kk = 0; kk < entities.length; kk++) {
              if (entities[kk] === entity) {
                continue;
              }

              const element = secondary[entities[kk]];

              if (element && Array.isArray(element)) {
                for (let ll = 0; ll < element.length; ll++) {
                  const inner = element[ll];

                  if (getFK(inner, { from: entities[kk], to: entity }) === oldSecondaryPK) {
                    inner[`fk_${entities[kk]}_to_${entity}`] = newPK;
                  }
                }
              }
            }

            // Merge
            Object.assign(eP, eS);
            isMerged = true;
          }
        }

        // Step 2.ii.c
        if (!isMerged) {
          primary[entity].push(eS);
        }
      }

    // Step 2.i
    } else if (secondary.hasOwnProperty(entity)) {

      primary[entity] = [...secondary[entity]];

    }
  });

  return primary;
};
