import axios, { AxiosInstance } from 'axios';
import { LMSRequest, LMSResponse, LMSConfig, Player, Track, Playlist } from './types.js';

export class LMSClient {
  private client: AxiosInstance;
  private config: LMSConfig;

  constructor(config: LMSConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.protocol}://${config.host}:${config.port}`,
      timeout: config.timeout || 15000, // Increased timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send a JSONRPC request to the LMS server
   */
  public async sendRequest(request: LMSRequest): Promise<LMSResponse> {
    try {
      const response = await this.client.post('/jsonrpc.js', request, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`LMS request failed: ${error.message} - ${error.response?.data || ''}`);
      }
      throw error;
    }
  }

  /**
   * Get all players
   */
  async getPlayers(): Promise<Player[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['players', '0', '100']]
    });
    return response.result.players_loop || [];
  }

  /**
   * Get player status
   */
  async getPlayerStatus(playerId: string): Promise<any> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['status', '-', '1', 'tags:u']]
    });
    return response.result;
  }

  /**
   * Play or pause a player
   */
  async playPause(playerId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['pause']]
    });
  }

  /**
   * Set player volume
   */
  async setVolume(playerId: string, volume: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'volume', volume.toString()]]
    });
  }

  /**
   * Seek to position in current track
   */
  async seek(playerId: string, position: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['time', position.toString()]]
    });
  }

  /**
   * Play a specific track
   */
  async playTrack(playerId: string, trackId: string): Promise<void> {
    // Get the track URL from the track ID (URLs work better across players)
    const track = await this.getTrackById(trackId);
    if (!track || !track.url) {
      throw new Error(`Track with ID ${trackId} not found or has no URL`);
    }
    
    // Add the track to the playlist using its URL
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'add', track.url]]
    });
    
    // Then play the playlist
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['play']]
    });
  }

  /**
   * Control playlist actions
   */
  async playlistAction(playerId: string, action: string): Promise<void> {
    const commands: Record<string, string[]> = {
      play: ['play'],
      pause: ['pause'],
      stop: ['stop'],
      next: ['playlist', 'index', '+1'],
      previous: ['playlist', 'index', '-1'],
      shuffle: ['playlist', 'shuffle', '1'],
      repeat: ['playlist', 'repeat', '1']
    };

    const command = commands[action];
    if (!command) {
      throw new Error(`Unknown playlist action: ${action}`);
    }

    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, command]
    });
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 50): Promise<Track[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['titles', '0', limit.toString(), 'search:' + query, 'tags:u,a,d,l,t,g']]
    });
    return response.result.titles_loop || [];
  }

  /**
   * Search for artists
   */
  async searchArtists(query: string, limit: number = 50): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['artists', '0', limit.toString(), 'search:' + query]]
    });
    return response.result.artists_loop || [];
  }

  /**
   * Search for albums
   */
  async searchAlbums(query: string, limit: number = 50): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['albums', '0', limit.toString(), 'search:' + query]]
    });
    return response.result.albums_loop || [];
  }

  /**
   * Get playlists
   */
  async getPlaylists(): Promise<Playlist[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['playlists', '0', '100']]
    });
    return response.result.playlists_loop || [];
  }

  /**
   * Get all genres from the music database
   */
  async getGenres(): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['genres', '0', '1000']]
    });
    return response.result.genres_loop || [];
  }

  /**
   * Search for tracks by genre
   */
  async searchTracksByGenre(genre: string, limit: number = 50): Promise<Track[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['titles', '0', limit.toString(), 'genre:' + genre, 'tags:u,a,d,l,t,g']]
    });
    return response.result.titles_loop || [];
  }

  /**
   * Get current playlist for a player
   */
  async getCurrentPlaylist(playerId: string): Promise<{ tracks: Track[], currentIndex: number, totalTracks: number }> {
    // Try multiple methods to get the playlist
    const methods = [
      // Method 1: Playlist tracks command
      () => this.sendRequest({
        id: 1,
        method: 'slim.request',
        params: [playerId, ['playlist', 'tracks', '0', '100', 'tags:u,a,d,l,t,g']]
      }),
      // Method 2: Status with playlist info
      () => this.sendRequest({
        id: 1,
        method: 'slim.request',
        params: [playerId, ['status', '-', '100', 'tags:u,a,d,l,t,g']]
      }),
      // Method 3: Playlist info command
      () => this.sendRequest({
        id: 1,
        method: 'slim.request',
        params: [playerId, ['playlist', 'info', '0', '100', 'tags:u,a,d,l,t,g']]
      })
    ];
    
    for (const method of methods) {
      try {
        const response = await method();
        
        // Check for tracks_loop first (playlist command)
        if (response.result.tracks_loop && response.result.tracks_loop.length > 0) {
          const tracks = response.result.tracks_loop.map((track: any) => ({
            ...track,
            isCurrentTrack: track['playlist index'] === parseInt(response.result.current_track || '0'),
            duration: track.duration ? parseInt(track.duration) : undefined
          }));
          
          return {
            tracks,
            currentIndex: parseInt(response.result.current_track || '0'),
            totalTracks: parseInt(response.result.count || '0')
          };
        }
        
        // Check for playlist_loop (status command)
        if (response.result.playlist_loop && response.result.playlist_loop.length > 0) {
          const playlistLoop = response.result.playlist_loop;
          const currentIndex = parseInt(response.result.playlist_cur_index || '0');
          const totalTracks = parseInt(response.result.playlist_tracks || '0');
          
          const actualTotalTracks = totalTracks > 0 ? totalTracks : playlistLoop.length;
          
          const tracks = playlistLoop.map((track: any) => ({
            ...track,
            isCurrentTrack: track['playlist index'] === currentIndex,
            duration: track.duration ? parseInt(track.duration) : undefined
          }));
          
          return {
            tracks,
            currentIndex,
            totalTracks: actualTotalTracks
          };
        }
      } catch (error) {
        // Continue to next method
        continue;
      }
    }
    
    // If all methods fail, return empty playlist
    return {
      tracks: [],
      currentIndex: 0,
      totalTracks: 0
    };
  }

  /**
   * Get a track by its ID
   */
  async getTrackById(trackId: string): Promise<Track | null> {
    try {
      const response = await this.sendRequest({
        id: 1,
        method: 'slim.request',
        params: ['0', ['titles', '0', '1', 'track_id:' + trackId, 'tags:u,a,d,l,t,g']]
      });
      const tracks = response.result.titles_loop || [];
      return tracks.length > 0 ? tracks[0] : null;
    } catch (error) {
      console.error('Error getting track by ID:', error);
      return null;
    }
  }

  /**
   * Add track to playlist
   */
  async addToPlaylist(playerId: string, trackId: string): Promise<void> {
    // Get the track URL from the track ID (URLs work better across players)
    const track = await this.getTrackById(trackId);
    if (!track || !track.url) {
      throw new Error(`Track with ID ${trackId} not found or has no URL`);
    }
    
    // Add the track to the playlist using its URL
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'add', track.url]]
    });
    
    // Wait a moment for the playlist to update
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Clear playlist
   */
  async clearPlaylist(playerId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'clear']]
    });
  }

  /**
   * Synchronize two players (master controls slave)
   */
  async syncPlayers(masterPlayerId: string, slavePlayerId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [masterPlayerId, ['sync', slavePlayerId]]
    });
  }

  /**
   * Unsynchronize a player (remove from sync group)
   */
  async unsyncPlayer(playerId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['sync', '-']]
    });
  }

  /**
   * Get synchronization status for a player
   */
  async getSyncStatus(playerId: string): Promise<any> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['status', '-', '1', 'tags:u']]
    });
    
    return {
      playerId,
      isMaster: response.result.sync_master || false,
      syncGroup: response.result.sync_group || [],
      syncSlaves: response.result.sync_slaves || []
    };
  }

  /**
   * Get all synchronization groups
   */
  async getSyncGroups(): Promise<any[]> {
    const players = await this.getPlayers();
    const syncGroups: any[] = [];
    const processedPlayers = new Set<string>();

    for (const player of players) {
      if (processedPlayers.has(player.playerid)) continue;
      
      try {
        const syncStatus = await this.getSyncStatus(player.playerid);
        
        if (syncStatus.syncGroup && syncStatus.syncGroup.length > 0) {
          // This player is part of a sync group
          const group = {
            master: syncStatus.isMaster ? player : null,
            slaves: [],
            allPlayers: [player, ...syncStatus.syncGroup.map((id: string) => 
              players.find(p => p.playerid === id)
            ).filter(Boolean)]
          };
          
          // Find the master if this isn't it
          if (!syncStatus.isMaster) {
            const masterPlayer = players.find(p => p.playerid === syncStatus.syncGroup[0]);
            if (masterPlayer) {
              group.master = masterPlayer;
            }
          }
          
          // Add slaves
          group.slaves = syncStatus.syncGroup.filter((id: string) => id !== player.playerid)
            .map((id: string) => players.find(p => p.playerid === id))
            .filter(Boolean);
          
          syncGroups.push(group);
          
          // Mark all players in this group as processed
          syncStatus.syncGroup.forEach((id: string) => processedPlayers.add(id));
        }
      } catch (error) {
        // Skip players that can't be queried
        continue;
      }
    }

    return syncGroups;
  }

  /**
   * Play a URL or stream directly on a player
   */
  async playUrl(playerId: string, url: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'play', url]]
    });
  }

  /**
   * Add a URL or stream to a player's playlist
   */
  async addUrlToPlaylist(playerId: string, url: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'add', url]]
    });
  }

  /**
   * Get all favorites
   */
  async getFavorites(limit: number = 100): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['favorites', 'items', '0', limit.toString()]]
    });
    return response.result.loop_loop || [];
  }

  /**
   * Add a favorite
   */
  async addFavorite(url: string, title: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['favorites', 'add', url, title]]
    });
  }

  /**
   * Play a favorite by item ID on a player
   */
  async playFavorite(playerId: string, itemId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['favorites', 'playlist', 'play', 'item_id:' + itemId]]
    });
  }

  /**
   * Get radio directory / apps
   */
  async getRadios(limit: number = 100): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['radios', '0', limit.toString()]]
    });
    return response.result.radioss_loop || [];
  }

  /**
   * Search TuneIn radio stations
   */
  async searchRadio(playerId: string, query: string, limit: number = 50): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['search', 'items', '0', limit.toString(), 'search:' + query]]
    });
    return response.result.loop_loop || [];
  }

  /**
   * Play a radio search result by item ID on a player
   */
  async playRadioItem(playerId: string, itemId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['search', 'playlist', 'play', 'item_id:' + itemId]]
    });
  }

  /**
   * Get installed online music apps (TIDAL, Spotify, Qobuz, etc.)
   */
  async getApps(limit: number = 100): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['apps', '0', limit.toString()]]
    });
    return response.result.appss_loop || [];
  }

  /**
   * Browse an online music app menu
   */
  async browseApp(playerId: string, appCmd: string, itemId?: string, limit: number = 50): Promise<any> {
    const params: (string | number)[] = [appCmd, 'items', '0', limit.toString()];
    if (itemId) {
      params.push('item_id:' + itemId);
    }

    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, params]
    });
    return {
      title: response.result.title,
      count: response.result.count,
      items: response.result.loop_loop || []
    };
  }

  /**
   * Search within an online music app
   */
  async searchApp(playerId: string, appCmd: string, query: string, searchItemId: string, limit: number = 50): Promise<any> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, [appCmd, 'items', '0', limit.toString(), 'item_id:' + searchItemId, 'search:' + query]]
    });
    return {
      title: response.result.title,
      count: response.result.count,
      items: response.result.loop_loop || []
    };
  }

  /**
   * Play an item from an online music app
   */
  async playAppItem(playerId: string, appCmd: string, itemId: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, [appCmd, 'playlist', 'play', 'item_id:' + itemId]]
    });
  }

  /**
   * Set player power state
   */
  async setPower(playerId: string, state: 'on' | 'off' | 'toggle'): Promise<void> {
    const stateMap = { on: '1', off: '0', toggle: '' };
    const params: (string | number)[] = ['power'];
    if (stateMap[state]) {
      params.push(stateMap[state]);
    }
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, params]
    });
  }

  /**
   * Set sleep timer on a player (in seconds)
   */
  async setSleepTimer(playerId: string, seconds: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['sleep', seconds.toString()]]
    });
  }

  /**
   * Set bass level on a player (-100 to 100)
   */
  async setBass(playerId: string, level: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'bass', level.toString()]]
    });
  }

  /**
   * Set treble level on a player (-100 to 100)
   */
  async setTreble(playerId: string, level: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'treble', level.toString()]]
    });
  }

  /**
   * Set balance on a player (-100 to 100)
   */
  async setBalance(playerId: string, level: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'balance', level.toString()]]
    });
  }

  /**
   * Set loudness on/off
   */
  async setLoudness(playerId: string, enabled: boolean): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'loudness', enabled ? '1' : '0']]
    });
  }

  /**
   * Mute or unmute a player
   */
  async setMute(playerId: string, muted: boolean): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['mixer', 'muting', muted ? '1' : '0']]
    });
  }

  /**
   * Jump to a specific track index in the current playlist
   */
  async jumpToPlaylistIndex(playerId: string, index: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'index', index.toString()]]
    });
  }

  /**
   * Delete a track from the current playlist by index
   */
  async deletePlaylistItem(playerId: string, index: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'delete', index.toString()]]
    });
  }

  /**
   * Move a track in the current playlist
   */
  async movePlaylistItem(playerId: string, fromIndex: number, toIndex: number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'move', fromIndex.toString(), toIndex.toString()]]
    });
  }

  /**
   * Save the current playlist with a name
   */
  async savePlaylist(playerId: string, name: string): Promise<any> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'save', name]]
    });
    return response.result;
  }

  /**
   * Delete a saved playlist
   */
  async deleteSavedPlaylist(playlistId: string | number): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['playlists', 'delete', 'playlist_id:' + playlistId]]
    });
  }

  /**
   * Rename a saved playlist
   */
  async renameSavedPlaylist(playlistId: string | number, name: string): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['playlists', 'rename', 'playlist_id:' + playlistId, name]]
    });
  }

  /**
   * Get LMS server status and library info
   */
  async getServerStatus(): Promise<any> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['serverstatus', '0', '1']]
    });
    return response.result;
  }

  /**
   * Trigger a library rescan
   */
  async rescanLibrary(mode: 'progressive' | 'full' = 'progressive'): Promise<void> {
    const command = mode === 'full' ? 'wipecache' : 'rescan';
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', [command]]
    });
  }

  /**
   * Start or stop random play mix
   */
  async setRandomPlay(mode: 'tracks' | 'albums' | 'artists' | 'year', enabled: boolean): Promise<void> {
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['randomplay', mode, enabled ? '1' : '0']]
    });
  }

  /**
   * Set shuffle mode
   */
  async setShuffle(playerId: string, mode: 'off' | 'song' | 'album'): Promise<void> {
    const modeMap = { off: '0', song: '1', album: '2' };
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'shuffle', modeMap[mode]]]
    });
  }

  /**
   * Set repeat mode
   */
  async setRepeat(playerId: string, mode: 'off' | 'song' | 'all'): Promise<void> {
    const modeMap = { off: '0', song: '1', all: '2' };
    await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: [playerId, ['playlist', 'repeat', modeMap[mode]]]
    });
  }

  /**
   * Get years in the music library
   */
  async getYears(limit: number = 100): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['years', '0', limit.toString()]]
    });
    return response.result.years_loop || [];
  }

  /**
   * Get decades in the music library
   */
  async getDecades(limit: number = 100): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['decades', '0', limit.toString()]]
    });
    return response.result.decades_loop || [];
  }

  /**
   * Get recently added albums
   */
  async getNewMusic(limit: number = 50): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['albums', '0', limit.toString(), 'sort:new']]
    });
    return response.result.albums_loop || [];
  }

  /**
   * Get random albums
   */
  async getRandomAlbums(limit: number = 50): Promise<any[]> {
    const response = await this.sendRequest({
      id: 1,
      method: 'slim.request',
      params: ['0', ['albums', '0', limit.toString(), 'sort:random']]
    });
    return response.result.albums_loop || [];
  }

  /**
   * Test connection to LMS server
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to get players list instead of version, as version might not work with player ID "0"
      await this.sendRequest({
        id: 1,
        method: 'slim.request',
        params: ['0', ['players', '0', '1']]
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

