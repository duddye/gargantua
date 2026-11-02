// =========================================================
// UNA COSTELLAZIONE PER OGNI SEZIONE (sfondo)
// Coordinate reali J2000, proiezione stereografica centrata sulla
// costellazione, nord in alto ed est a sinistra (come Orione).
// Valori in un riquadro 0–100; r ≈ luminosità (magnitudine).
// Generato da coordinate di catalogo: non modificare a mano le x/y.
// =========================================================

export const COSTELLAZIONI = {
  "/bacheca": {
    "nome": "Orsa Maggiore",
    "latino": "Ursa Major",
    "stelle": [
      {
        "nome": "Dubhe",
        "x": 85.76,
        "y": 29.85,
        "r": 1.82
      },
      {
        "nome": "Merak",
        "x": 92.0,
        "y": 47.16,
        "r": 1.59
      },
      {
        "nome": "Phecda",
        "x": 69.02,
        "y": 61.21,
        "r": 1.59
      },
      {
        "nome": "Megrez",
        "x": 57.84,
        "y": 50.64,
        "r": 1.25
      },
      {
        "nome": "Alioth",
        "x": 39.65,
        "y": 53.57,
        "r": 1.82
      },
      {
        "nome": "Mizar",
        "x": 24.86,
        "y": 54.69,
        "r": 1.66
      },
      {
        "nome": "Alkaid",
        "x": 8.0,
        "y": 70.15,
        "r": 1.78
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        0
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        5,
        6
      ]
    ]
  },
  "/welcome": {
    "nome": "Cigno",
    "latino": "Cygnus",
    "stelle": [
      {
        "nome": "Deneb",
        "x": 37.32,
        "y": 18.22,
        "r": 2.02
      },
      {
        "nome": "Sadr",
        "x": 49.75,
        "y": 37.66,
        "r": 1.66
      },
      {
        "nome": "Eta Cygni",
        "x": 69.34,
        "y": 56.67,
        "r": 1.02
      },
      {
        "nome": "Albireo",
        "x": 92.0,
        "y": 81.78,
        "r": 1.32
      },
      {
        "nome": "Fawaris",
        "x": 74.77,
        "y": 18.41,
        "r": 1.4
      },
      {
        "nome": "Gienah",
        "x": 30.75,
        "y": 60.39,
        "r": 1.55
      },
      {
        "nome": "Zeta Cygni",
        "x": 8.0,
        "y": 72.18,
        "r": 1.28
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        4,
        1
      ],
      [
        1,
        5
      ],
      [
        5,
        6
      ]
    ],
    "speciale": {
      "nome": "Cygnus X-1 · buco nero",
      "x": 67.74,
      "y": 56.31
    }
  },
  "/telemetria": {
    "nome": "Lira",
    "latino": "Lyra",
    "stelle": [
      {
        "nome": "Vega",
        "x": 76.9,
        "y": 18.31,
        "r": 2.49
      },
      {
        "nome": "Epsilon Lyrae",
        "x": 59.37,
        "y": 8.0,
        "r": 0.9
      },
      {
        "nome": "Zeta Lyrae",
        "x": 58.59,
        "y": 32.92,
        "r": 0.9
      },
      {
        "nome": "Delta Lyrae",
        "x": 35.17,
        "y": 41.38,
        "r": 0.9
      },
      {
        "nome": "Sulafat",
        "x": 23.1,
        "y": 92.0,
        "r": 1.26
      },
      {
        "nome": "Sheliak",
        "x": 45.68,
        "y": 84.2,
        "r": 1.17
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        5,
        2
      ]
    ]
  },
  "/pensieri": {
    "nome": "Andromeda",
    "latino": "Andromeda",
    "stelle": [
      {
        "nome": "Alpheratz",
        "x": 92.0,
        "y": 75.54,
        "r": 1.72
      },
      {
        "nome": "Delta Andromedae",
        "x": 66.89,
        "y": 70.86,
        "r": 1.26
      },
      {
        "nome": "Mirach",
        "x": 43.61,
        "y": 53.4,
        "r": 1.72
      },
      {
        "nome": "Almach",
        "x": 8.0,
        "y": 24.46,
        "r": 1.7
      },
      {
        "nome": "Mu Andromedae",
        "x": 53.33,
        "y": 43.09,
        "r": 1.03
      },
      {
        "nome": "Nu Andromedae",
        "x": 58.18,
        "y": 33.63,
        "r": 0.9
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        2,
        4
      ],
      [
        4,
        5
      ]
    ],
    "speciale": {
      "nome": "M31 · galassia di Andromeda",
      "x": 63.05,
      "y": 32.82
    }
  },
  "/missioni": {
    "nome": "Pegaso",
    "latino": "Pegasus",
    "stelle": [
      {
        "nome": "Markab",
        "x": 46.13,
        "y": 57.2,
        "r": 1.56
      },
      {
        "nome": "Scheat",
        "x": 46.96,
        "y": 27.67,
        "r": 1.58
      },
      {
        "nome": "Alpheratz",
        "x": 14.25,
        "y": 23.1,
        "r": 1.72
      },
      {
        "nome": "Algenib",
        "x": 8.0,
        "y": 55.23,
        "r": 1.42
      },
      {
        "nome": "Homam",
        "x": 59.2,
        "y": 67.18,
        "r": 1.21
      },
      {
        "nome": "Biham",
        "x": 77.45,
        "y": 77.34,
        "r": 1.17
      },
      {
        "nome": "Enif",
        "x": 92.0,
        "y": 67.8,
        "r": 1.59
      },
      {
        "nome": "Matar",
        "x": 57.4,
        "y": 22.66,
        "r": 1.38
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        0
      ],
      [
        0,
        4
      ],
      [
        4,
        5
      ],
      [
        5,
        6
      ],
      [
        1,
        7
      ]
    ]
  },
  "/profilo": {
    "nome": "Gemelli",
    "latino": "Gemini",
    "stelle": [
      {
        "nome": "Castor",
        "x": 19.04,
        "y": 18.16,
        "r": 1.9
      },
      {
        "nome": "Pollux",
        "x": 8.36,
        "y": 33.29,
        "r": 2.07
      },
      {
        "nome": "Tau Geminorum",
        "x": 39.34,
        "y": 25.71,
        "r": 0.9
      },
      {
        "nome": "Mebsuta",
        "x": 64.16,
        "y": 46.33,
        "r": 1.36
      },
      {
        "nome": "Tejat",
        "x": 84.34,
        "y": 55.99,
        "r": 1.4
      },
      {
        "nome": "Propus",
        "x": 92.0,
        "y": 55.42,
        "r": 1.25
      },
      {
        "nome": "Wasat",
        "x": 30.35,
        "y": 59.27,
        "r": 1.17
      },
      {
        "nome": "Mekbuda",
        "x": 45.5,
        "y": 65.26,
        "r": 1.02
      },
      {
        "nome": "Alhena",
        "x": 71.45,
        "y": 81.84,
        "r": 1.78
      },
      {
        "nome": "Kappa Geminorum",
        "x": 8.0,
        "y": 48.22,
        "r": 1.13
      }
    ],
    "linee": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        2,
        3
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ],
      [
        1,
        9
      ],
      [
        1,
        6
      ],
      [
        6,
        7
      ],
      [
        7,
        8
      ],
      [
        2,
        6
      ]
    ]
  }
};
