This directory is supposed to have the following structure for the data to be read by the scripts:
Only thing that matters is the csvs in the data folders.
```

.
├── lunar
│   ├── test
│   │   └── data
│   │       ├── S12_GradeB
│   │       │   ├── xa.s12.00.mhz.1969-12-16HR00_evid00006.csv
│   │       │   └── xa.s12.00.mhz.1977-09-13HR00_evid01012.mseed
│   │       ├── S15_GradeA
│   │       │   ├── xa.s15.00.mhz.1973-04-04HR00_evid00098.csv
│   │       │   └── xa.s15.00.mhz.1975-06-22HR00_evid00194.mseed
│   │       ├── S15_GradeB
│   │       │   ├── xa.s15.00.mhz.1974-02-06HR00_evid00497.csv
│   │       │   ├── xa.s15.00.mhz.1974-02-06HR00_evid00497.mseed
│   │       ├── S16_GradeA
│   │       │   ├── xa.s16.00.mhz.1972-09-10HR00_evid00075.csv
│   │       │   ├── xa.s16.00.mhz.1972-09-10HR00_evid00075.mseed
│   │       └── S16_GradeB
│   │           ├── xa.s16.00.mhz.1973-08-25HR00_evid00443.csv
│   │           └── xa.s16.00.mhz.1974-11-14HR00_evid00587.mseed
│   └── training
│       ├── catalogs
│       │   └── apollo12_catalog_GradeA_final.csv
│       ├── data
│       │   └── S12_GradeA
│       │       ├── xa.s12.00.mhz.1970-01-19HR00_evid00002.csv
│       │       ├── xa.s12.00.mhz.1975-06-26HR00_evid00198.csv
│       │       └── xa.s12.00.mhz.1975-06-26HR00_evid00198.mseed
│       └── plots
│           ├── xa.s12.00.mhz.1970-01-19HR00_evid00002.png
│           ├── xa.s12.00.mhz.1975-05-04HR00_evid00192.png
│           ├── xa.s12.00.mhz.1975-06-24HR00_evid00196.png
│           └── xa.s12.00.mhz.1975-06-26HR00_evid00198.png
├── mars
│   ├── test
│   │   └── data
│   │       ├── XB.ELYSE.02.BHV.2019-05-23HR02_evid0041.csv
│   │       └── XB.ELYSE.02.BHV.2022-05-04HR23_evid0001.mseed
│   └── training
│       ├── catalogs
│       │   ├── Mars_InSight_training_catalog.csv
│       │   └── Mars_InSight_training_catalog_final.csv
│       ├── data
│       │   ├── XB.ELYSE.02.BHV.2022-01-02HR04_evid0006.csv
│       │   └── XB.ELYSE.02.BHV.2022-02-03HR08_evid0005.mseed
│       └── plots
│           ├── evid_0005.png
│           └── evid_0006.png
