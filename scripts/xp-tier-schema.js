export class XPTierScheme {
  levels = [];
  constructor(levels) {
    this.levels = levels;
  }

  getLevel(xp) {
    return this.levels.findIndex((level) => xp < level);
  }

  getNextLevelXp(xp) {
    const nextLevelIndex = this.getLevel(xp);
    return this.levels[nextLevelIndex];
  }

  getStartingXpForLevel(level) {
    return this.levels[level - 1];
  }
}

export const XP_TIER_SCHEMES = {
  DND5E: new XPTierScheme([
    0,
    300,
    900,
    2700,
    6500,
    14000,
    23000,
    34000,
    48000,
    64000,
    85000,
    100000,
    120000,
    140000,
    165000,
    195000,
    225000,
    265000,
    305000,
    355000,
    Number.POSITIVE_INFINITY,
  ]),

  PF2E: new XPTierScheme([
    0,
    1000,
    3000,
    6000,
    10000,
    15000,
    21000,
    28000,
    36000,
    45000,
    55000,
    66000,
    78000,
    91000,
    105000,
    120000,
    136000,
    153000,
    171000,
    190000,
    Number.POSITIVE_INFINITY,
  ]),

  PF1E_SLOW: new XPTierScheme([
    0,
    3000,
    7500,
    14000,
    23000,
    35000,
    53000,
    77000,
    115000,
    160000,
    235000,
    330000,
    475000,
    665000,
    955000,
    1350000,
    1900000,
    2700000,
    3850000,
    5350000,
    Number.POSITIVE_INFINITY,
  ]),

  PF1E: new XPTierScheme([
    0,
    2000,
    5000,
    9000,
    15000,
    23000,
    35000,
    51000,
    75000,
    105000,
    155000,
    220000,
    315000,
    445000,
    635000,
    890000,
    1300000,
    1800000,
    2550000,
    3600000,
    Number.POSITIVE_INFINITY,
  ]),

  PF1E_FAST: new XPTierScheme([
    0,
    1300,
    3300,
    6000,
    10000,
    15000,
    23000,
    34000,
    50000,
    71000,
    105000,
    145000,
    210000,
    295000,
    425000,
    600000,
    850000,
    1200000,
    1700000,
    2400000,
    Number.POSITIVE_INFINITY,
  ]),
};
