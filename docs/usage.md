# Usage
The entry point when using this repo as a command-line tool is `bin/cli.js`. You can alternatively use `npm start` for convenience. The CLI is setup to allow either environment variables or command line arguments to specify the two source databases and the one target database. Command line arguments take precendence over environment variables.

### Supported environment variables
```sh
DB_URL_VISITOR = 'Database URL for database serving the twine-visitor application. Assumed to be PostgreSQL'
DB_URL_ADMIN   = 'Database URL for database serving the twine-admin application. Assumed to be MySQL'
DB_URL_TARGET  = 'Database URL for database serving the target twine-api application. Assumed to be PostgreSQL'
```

### Supported command line arguments
```sh
visitorUrl = 'Database URL for database serving the twine-visitor application. Assumed to be PostgreSQL'
adminUrl   = 'Database URL for database serving the twine-admin application. Assumed to be MySQL'
targetUrl  = 'Database URL for database serving the target twine-api application. Assumed to be PostgreSQL'
```

## Additional Environment Variables
Some additional environment variables are used because some data-specific transforms are required during the mapping, and this allows them to be omitted from the source code for privacy reasons.

```sh
# A user of the application has created multiple anonymous accounts using the same e-mail
# address. Duplicate e-mail addresses are not permitted in the new data model, so specific
# action must be taken to address this case
ANONYMOUS_USERS_DUPLICATE_EMAIL =
ANONYMOUS_USERS_MASTER_ID =

# There is a duplicate 360 Giving ID in the database, corresponding to duplicate records of
# a single organisaiton. Duplicate 360 Giving IDs are not permitted in the new data model
DUPLICATED_360_GIVING_ID_ORGANISATION_NAME = ...

# Add comma separated list of user emails from the volunteer app that should be added as
# CB_ADMIN
CB_ADMIN_EMAILS= ...

# Add list of matching orgs, separated as key value pairs querystring style
MATCHING_ORGS= one=two&...
```

## Running
From the project root directory, run
```
$ npm run start
```
If passing arguments, run
```
$ npm run start -- <ARGS>
```
