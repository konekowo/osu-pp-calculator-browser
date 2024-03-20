/**
 * Options for beatmap parsing.
 */
export interface IBeatmapParsingOptions {
  fileBuffer?: Uint8Array

  /**
   * Hash of the target beatmap. Used to validate beatmap files.
   * If wasn't specified then file will not be validated.
   */
  hash?: string;
}
