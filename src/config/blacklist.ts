/**
 * A lot of servers uses ddns.net etc.
 * Do not save those wildcards as not needed in DB.
 * Otherwise, causes issues.
 */
export const wildcardBlackList = ['*.ddns.net', '*.minehut.gg', '*.minecraft.best', '*.mcserver.us', '*.apexmc.co'];
