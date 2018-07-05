const { keys, union } = require('ramda');
const uuid = require('uuid/v4');
const EntityFns = require('./entity_matchers');


const FKName = (from, to) => `fk_${from}_to_${to}`;
const getFK = (o, { from, to }) => o[FKName(from, to)];


module.exports = (primary, secondary) => {
  const entities = union(keys(primary), keys(secondary));

  entities.forEach((entity) => {

    if (!EntityFns.hasOwnProperty(entity)) {
      console.log(`No "merge" functions found for ${entity}`);
      return;
    }

    if (primary.hasOwnProperty(entity)) {

      for (let ii = 0; ii < (secondary[entity] || []).length; ii++) {
        const eS = secondary[entity][ii];
        let isMerged = false;

        for (let jj = 0; jj < (primary[entity] || []).length; jj++) {
          const eP = primary[entity][jj];

          if (EntityFns[entity].doMatch(eP, eS)) {
            const newPK = uuid();
            const oldPrimaryPK = eP[`${entity}_id`];
            const oldSecondaryPK = eS[`${entity}_id`];

            eP[`${entity}_id`] = newPK;
            eS[`${entity}_id`] = newPK;

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

            Object.assign(eP, eS);
            isMerged = true;
            // break;
          }
        }

        if (!isMerged) {
          primary[entity].push(eS);
        }
      }

    } else if (secondary.hasOwnProperty(entity)) {

      primary[entity] = [...secondary[entity]];

    }
  });

  return primary;
};
