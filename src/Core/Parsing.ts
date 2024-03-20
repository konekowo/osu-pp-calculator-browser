import { BeatmapDecoder, ScoreDecoder } from 'osu-parsers';
import type { IBeatmap, IScore } from 'osu-classes';
import type { IBeatmapParsingOptions, IScoreParsingOptions } from './Interfaces';
import md5 from 'md5';

type BeatmapParsingResult = {
  data: IBeatmap;
  hash: string;
};

type ScoreParsingResult = {
  data: IScore;
  hash: string;
};

/**
 * Tries to parse beatmap by beatmap ID or custom file URL.
 * @param options Beatmap parsing options.
 * @returns Parsed beatmap.
 */
export async function parseBeatmap(options: IBeatmapParsingOptions): Promise<BeatmapParsingResult> {
  const { fileBuffer, hash } = options;

  if (fileBuffer) {
    return parseBeatmapByFileBuffer(fileBuffer, hash);
  }

  throw new Error('No beatmap file buffer was passed in!');
}

/**
 * Takes in a buffer of the .osu file, then tries to parse it
 * @param fileBuffer Uint8Array buffer of the .osu file.
 * @param hash Original hash to validate downloaded file.
 * @returns Parsed beatmap.
 */
async function parseBeatmapByFileBuffer(
  fileBuffer: Uint8Array,
  hash?: string,
): Promise<BeatmapParsingResult> {
  const fileMd5 = md5(fileBuffer);

  if (hash && hash !== fileMd5) {
    throw new Error('Beatmap MD5 checksum missmatch!');
  }

  const data = fileBuffer;

  const parsed = parseBeatmapData(data);

  return {
    hash: fileMd5,
    data: parsed,
  };
}

/**
 * Tries to parse beatmap file data.
 * @param data Beatmap file data.
 * @returns Parsed beatmap.
 */
function parseBeatmapData(data: Uint8Array): IBeatmap {
  return new BeatmapDecoder().decodeFromBuffer(data, {
    parseColours: false,
    parseEditor: false,
    parseEvents: false,
    parseStoryboard: false,
  });
}

/**
 * Downloads replay file and tries to parse a score from it.
 * Returns null if parsing was not successful.
 * @param options Score parsing options.
 * @returns Parsed score.
 */
export async function parseScore(options: IScoreParsingOptions): Promise<ScoreParsingResult> {
  const { replayBuffer, hash, lifeBar } = options;

  if (replayBuffer) {
    return parseCustomScore(replayBuffer, hash, lifeBar);
  }

  throw new Error('No replay URL was specified!');
}

/**
 * Downloads custom replay file and tries to parse it.
 * @param url Custom replay file URL.
 * @param hash Original hash to validate downloaded file.
 * @param parseReplay Should replay be parsed or not?
 * @returns Parsed score.
 */
async function parseCustomScore(replayFileBuf: Uint8Array, hash?: string, parseReplay = false): Promise<ScoreParsingResult> {

  const replayMd5 = md5(replayFileBuf);

  if (hash && hash !== replayMd5) {
    throw new Error('Replay MD5 checksum missmatch!');
  }

  return {
    data: await parseScoreData(replayFileBuf, parseReplay),
    hash: replayMd5,
  };
}

/**
 * Tries to parse score file data.
 * @param data Score file data.
 * @param parseReplay Should replay be parsed or not?
 * @returns Parsed score.
 */
async function parseScoreData(data: Uint8Array, parseReplay = false): Promise<IScore> {
  return await new ScoreDecoder().decodeFromBuffer(data, parseReplay);
}
