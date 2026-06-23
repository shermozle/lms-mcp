import { z } from 'zod';

// LMS JSONRPC Request/Response types
export const LMSRequestSchema = z.object({
  id: z.union([z.string(), z.number()]),
  method: z.literal('slim.request'),
  params: z.tuple([
    z.string(), // player ID or "0" for server-wide commands
    z.array(z.union([z.string(), z.number()])) // command parameters
  ])
});

export const LMSResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.array(z.any()),
  result: z.any()
});

export type LMSRequest = z.infer<typeof LMSRequestSchema>;
export type LMSResponse = z.infer<typeof LMSResponseSchema>;

// Player information
export const PlayerSchema = z.object({
  playerid: z.string(),
  name: z.string(),
  model: z.string().optional(),
  ip: z.string().optional(),
  isplayer: z.boolean().optional(),
  displaytype: z.string().optional(),
  canpoweroff: z.boolean().optional(),
  uuid: z.string().optional()
});

export type Player = z.infer<typeof PlayerSchema>;

// Track information
export const TrackSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  duration: z.union([z.string(), z.number()]).optional(),
  coverid: z.string().optional(),
  coverart: z.string().optional(),
  url: z.string().optional(),
  tracknum: z.string().optional(),
  'playlist index': z.number().optional(),
  isCurrentTrack: z.boolean().optional()
});

export type Track = z.infer<typeof TrackSchema>;

// Playlist information
export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number().optional(),
  tracks: z.array(TrackSchema).optional()
});

export type Playlist = z.infer<typeof PlaylistSchema>;

// Configuration
export interface LMSConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  timeout?: number;
}

// Online source types
export const AppSchema = z.object({
  cmd: z.string(),
  name: z.string(),
  type: z.string().optional(),
  icon: z.string().optional(),
  weight: z.number().optional()
});

export const FavoriteSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  url: z.string().optional(),
  image: z.string().optional(),
  isaudio: z.union([z.boolean(), z.number()]).optional(),
  hasitems: z.union([z.boolean(), z.number()]).optional()
});

export const RadioSchema = z.object({
  cmd: z.string(),
  name: z.string(),
  type: z.string().optional(),
  icon: z.string().optional(),
  weight: z.number().optional()
});

export type App = z.infer<typeof AppSchema>;
export type Favorite = z.infer<typeof FavoriteSchema>;
export type Radio = z.infer<typeof RadioSchema>;

// MCP Tool schemas
export const PlayPauseSchema = z.object({
  playerId: z.string().describe('Player ID to control (use "0" for all players)')
});

export const VolumeSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  volume: z.number().min(0).max(100).describe('Volume level (0-100)')
});

export const SeekSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  position: z.number().describe('Position in seconds to seek to')
});

export const PlayTrackSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  trackId: z.string().describe('Track ID to play')
});

export const PlaylistActionSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  action: z.enum(['play', 'pause', 'stop', 'next', 'previous', 'shuffle', 'repeat']).describe('Playlist action to perform')
});

export const SearchSchema = z.object({
  query: z.string().describe('Search query'),
  type: z.enum(['tracks', 'artists', 'albums', 'playlists']).optional().describe('Type of content to search for')
});

export type PlayPauseParams = z.infer<typeof PlayPauseSchema>;
export type VolumeParams = z.infer<typeof VolumeSchema>;
export type SeekParams = z.infer<typeof SeekSchema>;
export type PlayTrackParams = z.infer<typeof PlayTrackSchema>;
export type PlaylistActionParams = z.infer<typeof PlaylistActionSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;

export const PowerSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  state: z.enum(['on', 'off', 'toggle']).describe('Power state')
});

export const SleepTimerSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  seconds: z.number().min(0).describe('Sleep timer in seconds')
});

export const MixerLevelSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  level: z.number().min(-100).max(100).describe('Level (-100 to 100)')
});

export const MixerBooleanSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  enabled: z.boolean().describe('Enable or disable')
});

export const JumpToIndexSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  index: z.number().min(0).describe('Track index (0-based)')
});

export const MovePlaylistItemSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  fromIndex: z.number().min(0).describe('Source track index'),
  toIndex: z.number().min(0).describe('Destination track index')
});

export const SavePlaylistSchema = z.object({
  playerId: z.string().describe('Player ID whose current playlist to save'),
  name: z.string().describe('Name for the saved playlist')
});

export const PlaylistIdSchema = z.object({
  playlistId: z.string().describe('Saved playlist ID')
});

export const RenamePlaylistSchema = z.object({
  playlistId: z.string().describe('Saved playlist ID'),
  name: z.string().describe('New name for the playlist')
});

export const RescanLibrarySchema = z.object({
  mode: z.enum(['progressive', 'full']).optional().describe('Rescan mode')
});

export const RandomPlaySchema = z.object({
  mode: z.enum(['tracks', 'albums', 'artists', 'year']).describe('Random mix mode'),
  enabled: z.boolean().describe('Enable or disable the mix')
});

export const ShuffleRepeatSchema = z.object({
  playerId: z.string().describe('Player ID to control'),
  mode: z.enum(['off', 'song', 'album', 'all']).describe('Mode')
});

export type PowerParams = z.infer<typeof PowerSchema>;
export type SleepTimerParams = z.infer<typeof SleepTimerSchema>;
export type MixerLevelParams = z.infer<typeof MixerLevelSchema>;
export type MixerBooleanParams = z.infer<typeof MixerBooleanSchema>;
export type JumpToIndexParams = z.infer<typeof JumpToIndexSchema>;
export type MovePlaylistItemParams = z.infer<typeof MovePlaylistItemSchema>;
export type SavePlaylistParams = z.infer<typeof SavePlaylistSchema>;
export type PlaylistIdParams = z.infer<typeof PlaylistIdSchema>;
export type RenamePlaylistParams = z.infer<typeof RenamePlaylistSchema>;
export type RescanLibraryParams = z.infer<typeof RescanLibrarySchema>;
export type RandomPlayParams = z.infer<typeof RandomPlaySchema>;
export type ShuffleRepeatParams = z.infer<typeof ShuffleRepeatSchema>;

