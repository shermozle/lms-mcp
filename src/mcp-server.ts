import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import { LMSClient } from './lms-client.js';
import { LMSConfig } from './types.js';

export class LMSServer {
  private server: Server;
  private lmsClient: LMSClient;

  constructor(config: LMSConfig) {
    this.server = new Server(
      {
        name: 'lms-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.lmsClient = new LMSClient(config);
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      return {
        tools: [
          {
            name: 'get_players',
            description: 'Get all available players from the LMS server',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_player_status',
            description: 'Get the current status of a specific player',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to get status for',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'play_pause',
            description: 'Play or pause a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control (use "0" for all players)',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'set_volume',
            description: 'Set the volume of a player (0-100)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                volume: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  description: 'Volume level (0-100)',
                },
              },
              required: ['playerId', 'volume'],
            },
          },
          {
            name: 'seek',
            description: 'Seek to a specific position in the current track',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                position: {
                  type: 'number',
                  description: 'Position in seconds to seek to',
                },
              },
              required: ['playerId', 'position'],
            },
          },
          {
            name: 'play_track',
            description: 'Play a specific track by ID',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                trackId: {
                  type: 'string',
                  description: 'Track ID to play',
                },
              },
              required: ['playerId', 'trackId'],
            },
          },
          {
            name: 'playlist_action',
            description: 'Perform playlist actions (play, pause, stop, next, previous, shuffle, repeat)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                action: {
                  type: 'string',
                  enum: ['play', 'pause', 'stop', 'next', 'previous', 'shuffle', 'repeat'],
                  description: 'Playlist action to perform',
                },
              },
              required: ['playerId', 'action'],
            },
          },
          {
            name: 'search_tracks',
            description: 'Search for tracks',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'search_artists',
            description: 'Search for artists',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'search_albums',
            description: 'Search for albums',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_playlists',
            description: 'Get all available playlists',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_genres',
            description: 'Get all genres available in the music database',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_tracks_by_genre',
            description: 'Search for tracks by genre',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                genre: {
                  type: 'string',
                  description: 'Genre name to search for',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['genre'],
            },
          },
          {
            name: 'get_current_playlist',
            description: 'Get the current playlist for a player',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to get playlist for',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'add_to_playlist',
            description: 'Add a track to the current playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to add track to',
                },
                trackId: {
                  type: 'string',
                  description: 'Track ID to add',
                },
              },
              required: ['playerId', 'trackId'],
            },
          },
          {
            name: 'clear_playlist',
            description: 'Clear the current playlist',
            annotations: {
              destructiveHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to clear playlist for',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'sync_players',
            description: 'Synchronize two players (master controls slave)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                masterPlayerId: {
                  type: 'string',
                  description: 'Player ID that will be the master (controls the slave)',
                },
                slavePlayerId: {
                  type: 'string',
                  description: 'Player ID that will be the slave (controlled by master)',
                },
              },
              required: ['masterPlayerId', 'slavePlayerId'],
            },
          },
          {
            name: 'unsync_player',
            description: 'Remove a player from synchronization (unsync)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to unsynchronize',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'get_sync_status',
            description: 'Get synchronization status for a specific player',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to get sync status for',
                },
              },
              required: ['playerId'],
            },
          },
          {
            name: 'get_sync_groups',
            description: 'Get all synchronization groups',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'test_connection',
            description: 'Test connection to the LMS server',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'play_url',
            description: 'Play a direct URL or stream on a player (internet radio, podcast, etc.)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                url: {
                  type: 'string',
                  description: 'URL or stream to play',
                },
              },
              required: ['playerId', 'url'],
            },
          },
          {
            name: 'add_url_to_playlist',
            description: 'Add a direct URL or stream to the current playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to add URL to',
                },
                url: {
                  type: 'string',
                  description: 'URL or stream to add',
                },
              },
              required: ['playerId', 'url'],
            },
          },
          {
            name: 'get_favorites',
            description: 'Get all favorites (often includes radio stations and online streams)',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                  default: 100,
                },
              },
            },
          },
          {
            name: 'add_favorite',
            description: 'Add a URL or stream to favorites',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL or stream to add to favorites',
                },
                title: {
                  type: 'string',
                  description: 'Title for the favorite',
                },
              },
              required: ['url', 'title'],
            },
          },
          {
            name: 'play_favorite',
            description: 'Play a favorite by item ID on a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to play favorite on',
                },
                itemId: {
                  type: 'string',
                  description: 'Favorite item ID (the "id" field from get_favorites)',
                },
              },
              required: ['playerId', 'itemId'],
            },
          },
          {
            name: 'get_radios',
            description: 'Get radio directory categories and apps (TuneIn, etc.)',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                  default: 100,
                },
              },
            },
          },
          {
            name: 'search_radio',
            description: 'Search TuneIn radio stations and podcasts',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to use for searching (TuneIn search requires a real player)',
                },
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['playerId', 'query'],
            },
          },
          {
            name: 'play_radio_item',
            description: 'Play a TuneIn radio search result by item ID on a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to play radio on',
                },
                itemId: {
                  type: 'string',
                  description: 'Radio item ID (the "id" field from search_radio)',
                },
              },
              required: ['playerId', 'itemId'],
            },
          },
          {
            name: 'get_apps',
            description: 'Get installed online music apps (TIDAL, Spotify, Qobuz, YouTube, etc.)',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                  default: 100,
                },
              },
            },
          },
          {
            name: 'browse_app',
            description: 'Browse an online music app menu (TIDAL, Spotify, etc.)',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to use for browsing',
                },
                appCmd: {
                  type: 'string',
                  description: 'App command name (the "cmd" field from get_apps, e.g. "tidal", "spotty", "qobuz")',
                },
                itemId: {
                  type: 'string',
                  description: 'Optional menu item ID to browse into (omit for top-level menu)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['playerId', 'appCmd'],
            },
          },
          {
            name: 'search_app',
            description: 'Search within an online music app (TIDAL, Spotify, etc.)',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to use for searching',
                },
                appCmd: {
                  type: 'string',
                  description: 'App command name (e.g. "tidal", "spotty", "qobuz")',
                },
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                searchItemId: {
                  type: 'string',
                  description: 'Search category item ID (e.g. TIDAL search albums might be "7.3" after browsing the Search menu)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
              required: ['playerId', 'appCmd', 'query', 'searchItemId'],
            },
          },
          {
            name: 'play_app_item',
            description: 'Play an item from an online music app by item ID',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to play on',
                },
                appCmd: {
                  type: 'string',
                  description: 'App command name (e.g. "tidal", "spotty", "qobuz")',
                },
                itemId: {
                  type: 'string',
                  description: 'Item ID to play (the "id" field from browse_app or search_app)',
                },
              },
              required: ['playerId', 'appCmd', 'itemId'],
            },
          },
          {
            name: 'set_power',
            description: 'Turn a player on, off, or toggle power',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                state: {
                  type: 'string',
                  enum: ['on', 'off', 'toggle'],
                  description: 'Power state',
                },
              },
              required: ['playerId', 'state'],
            },
          },
          {
            name: 'set_sleep_timer',
            description: 'Set a sleep timer on a player in seconds',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                seconds: {
                  type: 'number',
                  minimum: 0,
                  description: 'Sleep timer in seconds (0 to cancel)',
                },
              },
              required: ['playerId', 'seconds'],
            },
          },
          {
            name: 'set_bass',
            description: 'Set bass level on a player (-100 to 100)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                level: {
                  type: 'number',
                  minimum: -100,
                  maximum: 100,
                  description: 'Bass level (-100 to 100)',
                },
              },
              required: ['playerId', 'level'],
            },
          },
          {
            name: 'set_treble',
            description: 'Set treble level on a player (-100 to 100)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                level: {
                  type: 'number',
                  minimum: -100,
                  maximum: 100,
                  description: 'Treble level (-100 to 100)',
                },
              },
              required: ['playerId', 'level'],
            },
          },
          {
            name: 'set_balance',
            description: 'Set left/right balance on a player (-100 to 100)',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                level: {
                  type: 'number',
                  minimum: -100,
                  maximum: 100,
                  description: 'Balance level (-100 = left, 100 = right)',
                },
              },
              required: ['playerId', 'level'],
            },
          },
          {
            name: 'set_loudness',
            description: 'Enable or disable loudness compensation on a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                enabled: {
                  type: 'boolean',
                  description: 'Enable loudness',
                },
              },
              required: ['playerId', 'enabled'],
            },
          },
          {
            name: 'set_mute',
            description: 'Mute or unmute a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                muted: {
                  type: 'boolean',
                  description: 'Mute state',
                },
              },
              required: ['playerId', 'muted'],
            },
          },
          {
            name: 'jump_to_playlist_index',
            description: 'Jump to a specific track index in the current playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                index: {
                  type: 'number',
                  minimum: 0,
                  description: 'Track index to jump to (0-based)',
                },
              },
              required: ['playerId', 'index'],
            },
          },
          {
            name: 'delete_playlist_item',
            description: 'Delete a track from the current playlist by index',
            annotations: {
              destructiveHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                index: {
                  type: 'number',
                  minimum: 0,
                  description: 'Track index to delete (0-based)',
                },
              },
              required: ['playerId', 'index'],
            },
          },
          {
            name: 'move_playlist_item',
            description: 'Move a track within the current playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                fromIndex: {
                  type: 'number',
                  minimum: 0,
                  description: 'Source track index',
                },
                toIndex: {
                  type: 'number',
                  minimum: 0,
                  description: 'Destination track index',
                },
              },
              required: ['playerId', 'fromIndex', 'toIndex'],
            },
          },
          {
            name: 'save_playlist',
            description: 'Save the current player playlist as a named playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID whose current playlist to save',
                },
                name: {
                  type: 'string',
                  description: 'Name for the saved playlist',
                },
              },
              required: ['playerId', 'name'],
            },
          },
          {
            name: 'delete_saved_playlist',
            description: 'Delete a saved playlist',
            annotations: {
              destructiveHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playlistId: {
                  type: 'string',
                  description: 'Saved playlist ID (the "id" field from get_playlists)',
                },
              },
              required: ['playlistId'],
            },
          },
          {
            name: 'rename_saved_playlist',
            description: 'Rename a saved playlist',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playlistId: {
                  type: 'string',
                  description: 'Saved playlist ID',
                },
                name: {
                  type: 'string',
                  description: 'New name for the playlist',
                },
              },
              required: ['playlistId', 'name'],
            },
          },
          {
            name: 'get_server_status',
            description: 'Get LMS server status and library statistics',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'rescan_library',
            description: 'Trigger a library rescan',
            annotations: {
              destructiveHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['progressive', 'full'],
                  description: 'Rescan mode (progressive = scan for changes, full = wipe cache and rescan)',
                  default: 'progressive',
                },
              },
            },
          },
          {
            name: 'set_random_play',
            description: 'Start or stop a random play mix',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                mode: {
                  type: 'string',
                  enum: ['tracks', 'albums', 'artists', 'year'],
                  description: 'Random mix mode',
                },
                enabled: {
                  type: 'boolean',
                  description: 'Enable or disable the mix',
                },
              },
              required: ['mode', 'enabled'],
            },
          },
          {
            name: 'set_shuffle',
            description: 'Set shuffle mode on a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                mode: {
                  type: 'string',
                  enum: ['off', 'song', 'album'],
                  description: 'Shuffle mode',
                },
              },
              required: ['playerId', 'mode'],
            },
          },
          {
            name: 'set_repeat',
            description: 'Set repeat mode on a player',
            annotations: {
              readOnlyHint: false,
            },
            inputSchema: {
              type: 'object',
              properties: {
                playerId: {
                  type: 'string',
                  description: 'Player ID to control',
                },
                mode: {
                  type: 'string',
                  enum: ['off', 'song', 'all'],
                  description: 'Repeat mode',
                },
              },
              required: ['playerId', 'mode'],
            },
          },
          {
            name: 'get_years',
            description: 'Get years available in the music library',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                  default: 100,
                },
              },
            },
          },
          {
            name: 'get_decades',
            description: 'Get decades available in the music library',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                  default: 100,
                },
              },
            },
          },
          {
            name: 'get_new_music',
            description: 'Get recently added albums',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
            },
          },
          {
            name: 'get_random_albums',
            description: 'Get a random selection of albums',
            annotations: {
              readOnlyHint: true,
            },
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)',
                  default: 50,
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_players': {
            const players = await this.lmsClient.getPlayers();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(players, null, 2),
                },
              ],
            };
          }

          case 'get_player_status': {
            const { playerId } = args as { playerId: string };
            const status = await this.lmsClient.getPlayerStatus(playerId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(status, null, 2),
                },
              ],
            };
          }

          case 'play_pause': {
            const { playerId } = args as { playerId: string };
            await this.lmsClient.playPause(playerId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} play/pause toggled`,
                },
              ],
            };
          }

          case 'set_volume': {
            const { playerId, volume } = args as { playerId: string; volume: number };
            await this.lmsClient.setVolume(playerId, volume);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} volume set to ${volume}%`,
                },
              ],
            };
          }

          case 'seek': {
            const { playerId, position } = args as { playerId: string; position: number };
            await this.lmsClient.seek(playerId, position);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} seeked to ${position} seconds`,
                },
              ],
            };
          }

          case 'play_track': {
            const { playerId, trackId } = args as { playerId: string; trackId: string };
            await this.lmsClient.playTrack(playerId, trackId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playing track ${trackId} on player ${playerId}`,
                },
              ],
            };
          }

          case 'playlist_action': {
            const { playerId, action } = args as { playerId: string; action: string };
            await this.lmsClient.playlistAction(playerId, action);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} playlist action: ${action}`,
                },
              ],
            };
          }

          case 'search_tracks': {
            const { query, limit = 50 } = args as { query: string; limit?: number };
            const tracks = await this.lmsClient.searchTracks(query, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(tracks, null, 2),
                },
              ],
            };
          }

          case 'search_artists': {
            const { query, limit = 50 } = args as { query: string; limit?: number };
            const artists = await this.lmsClient.searchArtists(query, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(artists, null, 2),
                },
              ],
            };
          }

          case 'search_albums': {
            const { query, limit = 50 } = args as { query: string; limit?: number };
            const albums = await this.lmsClient.searchAlbums(query, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(albums, null, 2),
                },
              ],
            };
          }

          case 'get_playlists': {
            const playlists = await this.lmsClient.getPlaylists();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(playlists, null, 2),
                },
              ],
            };
          }

          case 'get_genres': {
            const genres = await this.lmsClient.getGenres();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(genres, null, 2),
                },
              ],
            };
          }

          case 'search_tracks_by_genre': {
            const { genre, limit = 50 } = args as { genre: string; limit?: number };
            const tracks = await this.lmsClient.searchTracksByGenre(genre, limit);
            
            // Format tracks with duration
            const formattedTracks = tracks.map(track => {
              const duration = typeof track.duration === 'number' ? track.duration : 
                             typeof track.duration === 'string' ? parseFloat(track.duration) : 0;
              return {
                ...track,
                duration: duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : undefined
              };
            });
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(formattedTracks, null, 2),
                },
              ],
            };
          }

          case 'get_current_playlist': {
            const { playerId } = args as { playerId: string };
            const playlistData = await this.lmsClient.getCurrentPlaylist(playerId);
            
            // Format the response with current track indication
            const formattedTracks = playlistData.tracks.map(track => {
              const duration = typeof track.duration === 'number' ? track.duration : 
                             typeof track.duration === 'string' ? parseFloat(track.duration) : 0;
              return {
                ...track,
                position: track['playlist index'],
                duration: duration > 0 ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : undefined,
                isCurrent: track.isCurrentTrack
              };
            });
            
            const response = {
              currentTrack: playlistData.currentIndex,
              totalTracks: playlistData.totalTracks,
              visibleTracks: playlistData.tracks.length,
              tracks: formattedTracks
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response, null, 2),
                },
              ],
            };
          }

          case 'add_to_playlist': {
            const { playerId, trackId } = args as { playerId: string; trackId: string };
            await this.lmsClient.addToPlaylist(playerId, trackId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Track ${trackId} added to player ${playerId} playlist`,
                },
              ],
            };
          }

          case 'clear_playlist': {
            const { playerId } = args as { playerId: string };
            await this.lmsClient.clearPlaylist(playerId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} playlist cleared`,
                },
              ],
            };
          }

          case 'sync_players': {
            const { masterPlayerId, slavePlayerId } = args as { masterPlayerId: string; slavePlayerId: string };
            await this.lmsClient.syncPlayers(masterPlayerId, slavePlayerId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${slavePlayerId} synchronized to master ${masterPlayerId}`,
                },
              ],
            };
          }

          case 'unsync_player': {
            const { playerId } = args as { playerId: string };
            await this.lmsClient.unsyncPlayer(playerId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} unsynchronized`,
                },
              ],
            };
          }

          case 'get_sync_status': {
            const { playerId } = args as { playerId: string };
            const syncStatus = await this.lmsClient.getSyncStatus(playerId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(syncStatus, null, 2),
                },
              ],
            };
          }

          case 'get_sync_groups': {
            const syncGroups = await this.lmsClient.getSyncGroups();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(syncGroups, null, 2),
                },
              ],
            };
          }

          case 'test_connection': {
            const connected = await this.lmsClient.testConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: connected ? 'Connected to LMS server' : 'Failed to connect to LMS server',
                },
              ],
            };
          }

          case 'play_url': {
            const { playerId, url } = args as { playerId: string; url: string };
            await this.lmsClient.playUrl(playerId, url);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playing URL ${url} on player ${playerId}`,
                },
              ],
            };
          }

          case 'add_url_to_playlist': {
            const { playerId, url } = args as { playerId: string; url: string };
            await this.lmsClient.addUrlToPlaylist(playerId, url);
            return {
              content: [
                {
                  type: 'text',
                  text: `Added URL ${url} to player ${playerId} playlist`,
                },
              ],
            };
          }

          case 'get_favorites': {
            const { limit = 100 } = args as { limit?: number };
            const favorites = await this.lmsClient.getFavorites(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(favorites, null, 2),
                },
              ],
            };
          }

          case 'add_favorite': {
            const { url, title } = args as { url: string; title: string };
            await this.lmsClient.addFavorite(url, title);
            return {
              content: [
                {
                  type: 'text',
                  text: `Added favorite: ${title}`,
                },
              ],
            };
          }

          case 'play_favorite': {
            const { playerId, itemId } = args as { playerId: string; itemId: string };
            await this.lmsClient.playFavorite(playerId, itemId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playing favorite ${itemId} on player ${playerId}`,
                },
              ],
            };
          }

          case 'get_radios': {
            const { limit = 100 } = args as { limit?: number };
            const radios = await this.lmsClient.getRadios(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(radios, null, 2),
                },
              ],
            };
          }

          case 'search_radio': {
            const { playerId, query, limit = 50 } = args as { playerId: string; query: string; limit?: number };
            const results = await this.lmsClient.searchRadio(playerId, query, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          case 'play_radio_item': {
            const { playerId, itemId } = args as { playerId: string; itemId: string };
            await this.lmsClient.playRadioItem(playerId, itemId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playing radio item ${itemId} on player ${playerId}`,
                },
              ],
            };
          }

          case 'get_apps': {
            const { limit = 100 } = args as { limit?: number };
            const apps = await this.lmsClient.getApps(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(apps, null, 2),
                },
              ],
            };
          }

          case 'browse_app': {
            const { playerId, appCmd, itemId, limit = 50 } = args as {
              playerId: string;
              appCmd: string;
              itemId?: string;
              limit?: number;
            };
            const result = await this.lmsClient.browseApp(playerId, appCmd, itemId, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'search_app': {
            const { playerId, appCmd, query, searchItemId, limit = 50 } = args as {
              playerId: string;
              appCmd: string;
              query: string;
              searchItemId: string;
              limit?: number;
            };
            const result = await this.lmsClient.searchApp(playerId, appCmd, query, searchItemId, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'play_app_item': {
            const { playerId, appCmd, itemId } = args as { playerId: string; appCmd: string; itemId: string };
            await this.lmsClient.playAppItem(playerId, appCmd, itemId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playing ${appCmd} item ${itemId} on player ${playerId}`,
                },
              ],
            };
          }

          case 'set_power': {
            const { playerId, state } = args as { playerId: string; state: 'on' | 'off' | 'toggle' };
            await this.lmsClient.setPower(playerId, state);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} power set to ${state}`,
                },
              ],
            };
          }

          case 'set_sleep_timer': {
            const { playerId, seconds } = args as { playerId: string; seconds: number };
            await this.lmsClient.setSleepTimer(playerId, seconds);
            return {
              content: [
                {
                  type: 'text',
                  text: `Sleep timer set to ${seconds} seconds on player ${playerId}`,
                },
              ],
            };
          }

          case 'set_bass': {
            const { playerId, level } = args as { playerId: string; level: number };
            await this.lmsClient.setBass(playerId, level);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} bass set to ${level}`,
                },
              ],
            };
          }

          case 'set_treble': {
            const { playerId, level } = args as { playerId: string; level: number };
            await this.lmsClient.setTreble(playerId, level);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} treble set to ${level}`,
                },
              ],
            };
          }

          case 'set_balance': {
            const { playerId, level } = args as { playerId: string; level: number };
            await this.lmsClient.setBalance(playerId, level);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} balance set to ${level}`,
                },
              ],
            };
          }

          case 'set_loudness': {
            const { playerId, enabled } = args as { playerId: string; enabled: boolean };
            await this.lmsClient.setLoudness(playerId, enabled);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} loudness ${enabled ? 'enabled' : 'disabled'}`,
                },
              ],
            };
          }

          case 'set_mute': {
            const { playerId, muted } = args as { playerId: string; muted: boolean };
            await this.lmsClient.setMute(playerId, muted);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} ${muted ? 'muted' : 'unmuted'}`,
                },
              ],
            };
          }

          case 'jump_to_playlist_index': {
            const { playerId, index } = args as { playerId: string; index: number };
            await this.lmsClient.jumpToPlaylistIndex(playerId, index);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} jumped to playlist index ${index}`,
                },
              ],
            };
          }

          case 'delete_playlist_item': {
            const { playerId, index } = args as { playerId: string; index: number };
            await this.lmsClient.deletePlaylistItem(playerId, index);
            return {
              content: [
                {
                  type: 'text',
                  text: `Deleted track at index ${index} from player ${playerId} playlist`,
                },
              ],
            };
          }

          case 'move_playlist_item': {
            const { playerId, fromIndex, toIndex } = args as { playerId: string; fromIndex: number; toIndex: number };
            await this.lmsClient.movePlaylistItem(playerId, fromIndex, toIndex);
            return {
              content: [
                {
                  type: 'text',
                  text: `Moved track from index ${fromIndex} to ${toIndex} on player ${playerId}`,
                },
              ],
            };
          }

          case 'save_playlist': {
            const { playerId, name } = args as { playerId: string; name: string };
            const result = await this.lmsClient.savePlaylist(playerId, name);
            return {
              content: [
                {
                  type: 'text',
                  text: `Playlist saved as "${name}"` + (result?.__playlist_id ? ` (ID: ${result.__playlist_id})` : ''),
                },
              ],
            };
          }

          case 'delete_saved_playlist': {
            const { playlistId } = args as { playlistId: string };
            await this.lmsClient.deleteSavedPlaylist(playlistId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Deleted saved playlist ${playlistId}`,
                },
              ],
            };
          }

          case 'rename_saved_playlist': {
            const { playlistId, name } = args as { playlistId: string; name: string };
            await this.lmsClient.renameSavedPlaylist(playlistId, name);
            return {
              content: [
                {
                  type: 'text',
                  text: `Renamed saved playlist ${playlistId} to "${name}"`,
                },
              ],
            };
          }

          case 'get_server_status': {
            const status = await this.lmsClient.getServerStatus();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(status, null, 2),
                },
              ],
            };
          }

          case 'rescan_library': {
            const { mode = 'progressive' } = args as { mode?: 'progressive' | 'full' };
            await this.lmsClient.rescanLibrary(mode);
            return {
              content: [
                {
                  type: 'text',
                  text: `Library ${mode} rescan started`,
                },
              ],
            };
          }

          case 'set_random_play': {
            const { mode, enabled } = args as { mode: 'tracks' | 'albums' | 'artists' | 'year'; enabled: boolean };
            await this.lmsClient.setRandomPlay(mode, enabled);
            return {
              content: [
                {
                  type: 'text',
                  text: `Random ${mode} mix ${enabled ? 'started' : 'stopped'}`,
                },
              ],
            };
          }

          case 'set_shuffle': {
            const { playerId, mode } = args as { playerId: string; mode: 'off' | 'song' | 'album' };
            await this.lmsClient.setShuffle(playerId, mode);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} shuffle set to ${mode}`,
                },
              ],
            };
          }

          case 'set_repeat': {
            const { playerId, mode } = args as { playerId: string; mode: 'off' | 'song' | 'all' };
            await this.lmsClient.setRepeat(playerId, mode);
            return {
              content: [
                {
                  type: 'text',
                  text: `Player ${playerId} repeat set to ${mode}`,
                },
              ],
            };
          }

          case 'get_years': {
            const { limit = 100 } = args as { limit?: number };
            const years = await this.lmsClient.getYears(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(years, null, 2),
                },
              ],
            };
          }

          case 'get_decades': {
            const { limit = 100 } = args as { limit?: number };
            const decades = await this.lmsClient.getDecades(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(decades, null, 2),
                },
              ],
            };
          }

          case 'get_new_music': {
            const { limit = 50 } = args as { limit?: number };
            const albums = await this.lmsClient.getNewMusic(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(albums, null, 2),
                },
              ],
            };
          }

          case 'get_random_albums': {
            const { limit = 50 } = args as { limit?: number };
            const albums = await this.lmsClient.getRandomAlbums(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(albums, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LMS MCP Server running on stdio');
  }
}

