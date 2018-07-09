# Getting Started
Data-sync is intended for use as a command line utility to ingest and transform data from two data sources using the schema currently used by the visitor app and the admin dashboard app.

## Configuration
Before running the utility, it can be configured either using command line arguments or environment variables. The latter is reccommended.

To setup the requisite database connections, the following environment variables must be provided:
```
DB_URL_TARGET
DB_URL_ADMIN
DB_URL_VISITOR
```
Alternatively, each of these may be provided via command line arguments `visitorUrl`, `adminUrl` and `targetUrl`. Command line arguments will override environment variables.

In addition, the following environment variables are used so as to not keep user data in source control.
```
ANONYMOUS_USERS_DUPLICATE_EMAIL=The email used across multiple "anonymous" users by a single CB
ANONYMOUS_USERS_MASTER_ID=The (presumed) main account corresponding to the above email
DUPLICATED_360_GIVING_ID_ORGANISATION_NAME=Name of the organisation that has a duplicate 360 giving id. This organisation is itself a duplicate and should eventually be deleted.
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
