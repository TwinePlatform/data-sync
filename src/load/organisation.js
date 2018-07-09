/*
 * Load organisation data into target DB
 *
 * Populates the following tables:
 * - organisation
 * - community_business
 */
const {
  map, head, filter, compose, pickAll,
} = require('ramda');
const { sanitiseEntity, mapKeys } = require('../shared/util');

const isFloat = (n) => n && !Number.isNaN(Number.parseFloat(n));

const latLngToCoordinates = ({ lat, lng, ...o }) =>
  ({
    ...o,
    coordinates: (lat && lng && isFloat(lat) && isFloat(lng)) ? { lng, lat } : null,
  });

const sanitiseOrg = compose(
  latLngToCoordinates,
  sanitiseEntity('organisation'),
);

const getOrg = compose(
  mapKeys((k) => ({ '360_giving_id': '_360_giving_id', name: 'organisation_name' }[k] || k)),
  pickAll(['name', '360_giving_id', 'created_at', 'modified_at', 'deleted_at']),
);

const getCommunityBusiness = pickAll([
  'address_1',
  'address_2',
  'town_city',
  'post_code',
  'coordinates',
  'turnover_band',
  'created_at',
  'modified_at',
  'deleted_at',
]);

const findOrgById = (id, orgs) => compose(
  filter((s) => typeof s !== 'undefined'), // remove keys with undefined values
  getOrg, // form org record from row
  head, // strip organisation out of array
  map(sanitiseOrg), // sanitise the fields
  filter((o) => o.organisation_id === id), // choose the right organisation
)(orgs);


const main = (primary, trx) =>
  Promise.all(primary.organisation
    .map(sanitiseOrg)
    .map(async (o) => {
      const organisation = getOrg(o);
      const { coordinates, ...community_business } = getCommunityBusiness(o);

      const res = await trx('organisation')
        .insert(organisation)
        .returning('organisation_id');

      return trx('community_business')
        .insert({
          ...community_business,
          coordinates: coordinates ? trx.raw(`ST_GeogFromText('SRID=4326;POINT(${coordinates.lng} ${coordinates.lat})')`) : null,
          community_business_region_id: trx('community_business_region').select('community_business_region_id').where({ region_name: o.region }),
          community_business_sector_id: trx('community_business_sector').select('community_business_sector_id').where({ sector_name: o.sector }),
          organisation_id: res[0],
        });
    }));

module.exports = {
  findOrgById,
  main,
};
