# LMS MCP Server

A Model Context Protocol (MCP) server that provides LLM tools with access to the Lyrion Music Server (LMS) via its JSONRPC API.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

This MCP server provides the following tools for interacting with your Lyrion Music Server:

### Player Management
- **get_players**: List all available players
- **get_player_status**: Get detailed status of a specific player
- **test_connection**: Test connection to the LMS server

### Playback Control
- **play_pause**: Toggle play/pause for a player
- **set_volume**: Set player volume (0-100)
- **seek**: Seek to a specific position in the current track
- **play_track**: Play a specific track by ID
- **set_power**: Turn a player on, off, or toggle power
- **set_sleep_timer**: Set a sleep timer on a player

### Mixer / Sound
- **set_bass**: Set bass level (-100 to 100)
- **set_treble**: Set treble level (-100 to 100)
- **set_balance**: Set left/right balance (-100 to 100)
- **set_loudness**: Enable or disable loudness compensation
- **set_mute**: Mute or unmute a player

### Playlist Management
- **playlist_action**: Perform playlist actions (play, pause, stop, next, previous, shuffle, repeat)
- **get_current_playlist**: Get the current playlist for a player
- **add_to_playlist**: Add a track to the current playlist
- **clear_playlist**: Clear the current playlist
- **jump_to_playlist_index**: Jump to a specific track index
- **delete_playlist_item**: Delete a track from the current playlist
- **move_playlist_item**: Move a track within the current playlist
- **save_playlist**: Save the current playlist with a name
- **delete_saved_playlist**: Delete a saved playlist
- **rename_saved_playlist**: Rename a saved playlist
- **set_shuffle**: Set shuffle mode (off, song, album)
- **set_repeat**: Set repeat mode (off, song, all)

### Server & Library
- **get_server_status**: Get LMS server status and library statistics
- **rescan_library**: Trigger a library rescan (progressive or full)
- **set_random_play**: Start or stop a random play mix (tracks, albums, artists, year)

### Discovery
- **get_years**: Get years available in the library
- **get_decades**: Get decades available in the library
- **get_new_music**: Get recently added albums
- **get_random_albums**: Get a random selection of albums

### Search and Discovery
- **search_tracks**: Search for tracks
- **search_artists**: Search for artists
- **search_albums**: Search for albums
- **get_playlists**: Get all available playlists
- **get_genres**: Get all genres available in the music database
- **search_tracks_by_genre**: Search for tracks by genre

### Online Music Sources
- **play_url**: Play a direct URL or stream (internet radio, podcast, etc.)
- **add_url_to_playlist**: Add a direct URL or stream to the current playlist
- **get_favorites**: Get all favorites (often includes radio stations and online streams)
- **add_favorite**: Add a URL or stream to favorites
- **play_favorite**: Play a favorite by item ID
- **get_radios**: Get radio directory categories and apps (TuneIn, etc.)
- **search_radio**: Search TuneIn radio stations and podcasts
- **play_radio_item**: Play a TuneIn radio search result by item ID
- **get_apps**: Get installed online music apps (TIDAL, Spotify, Qobuz, YouTube, etc.)
- **browse_app**: Browse an online music app menu
- **search_app**: Search within an online music app
- **play_app_item**: Play an item from an online music app by item ID

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd lms-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` with your LMS server settings:
```env
# Lyrion Music Server Configuration
LMS_HOST=localhost
LMS_PORT=9000
LMS_PROTOCOL=http
LMS_TIMEOUT=10000
```

### Configuration Options

- `LMS_HOST`: IP address or hostname of your LMS server (default: localhost)
- `LMS_PORT`: Port number of your LMS server (default: 9000)
- `LMS_PROTOCOL`: Protocol to use (http or https, default: http)
- `LMS_TIMEOUT`: Request timeout in milliseconds (default: 10000)

## Usage

### Running the MCP Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Watch mode for development
npm run watch
```

### Using with Claude Desktop

Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "lms": {
      "command": "node",
      "args": ["/path/to/lms-mcp/dist/index.js"],
      "env": {
        "LMS_HOST": "your-lms-server-ip",
        "LMS_PORT": "9000"
      }
    }
  }
}
```

### Using with Other MCP Clients

The server communicates via stdio using the Model Context Protocol. Any MCP-compatible client can connect to it.

## API Reference

### Player Management Tools

#### get_players
Returns a list of all available players.

**Parameters**: None

**Returns**: Array of player objects with properties like `playerid`, `name`, `model`, `ip`, etc.

#### get_player_status
Get detailed status of a specific player.

**Parameters**:
- `playerId` (string): The ID of the player to get status for

**Returns**: Player status object with current track, volume, playback state, etc.

#### test_connection
Test the connection to the LMS server.

**Parameters**: None

**Returns**: Connection status message

### Playback Control Tools

#### play_pause
Toggle play/pause for a player.

**Parameters**:
- `playerId` (string): The ID of the player to control

#### set_volume
Set the volume of a player.

**Parameters**:
- `playerId` (string): The ID of the player to control
- `volume` (number): Volume level (0-100)

#### seek
Seek to a specific position in the current track.

**Parameters**:
- `playerId` (string): The ID of the player to control
- `position` (number): Position in seconds to seek to

#### play_track
Play a specific track by ID.

**Parameters**:
- `playerId` (string): The ID of the player to control
- `trackId` (string): The ID of the track to play

### Playlist Management Tools

#### playlist_action
Perform various playlist actions.

**Parameters**:
- `playerId` (string): The ID of the player to control
- `action` (string): Action to perform (`play`, `pause`, `stop`, `next`, `previous`, `shuffle`, `repeat`)

#### get_current_playlist
Get the current playlist for a player with complete track information.

**Parameters**:
- `playerId` (string): The ID of the player to get playlist for

**Returns**: Object containing:
- `tracks`: Array of track objects with complete metadata (artist, title, album, duration, etc.)
- `currentTrack`: Index of the currently playing track
- `totalTracks`: Total number of tracks in the playlist
- `visibleTracks`: Number of tracks visible in the current view

#### add_to_playlist
Add a track to the current playlist.

**Parameters**:
- `playerId` (string): The ID of the player to add track to
- `trackId` (string): The ID of the track to add

#### clear_playlist
Clear the current playlist.

**Parameters**:
- `playerId` (string): The ID of the player to clear playlist for

### Search and Discovery Tools

#### search_tracks
Search for tracks in your music library.

**Parameters**:
- `query` (string): Search query
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of track objects matching the search query

#### search_artists
Search for artists in your music library.

**Parameters**:
- `query` (string): Search query
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of artist objects matching the search query

#### search_albums
Search for albums in your music library.

**Parameters**:
- `query` (string): Search query
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of album objects matching the search query

#### get_playlists
Get all available playlists.

**Parameters**: None

**Returns**: Array of playlist objects

#### get_genres
Get all genres available in the music database.

**Parameters**: None

**Returns**: Array of genre objects with genre name, ID, and favorites URL

#### search_tracks_by_genre
Search for tracks by genre.

**Parameters**:
- `genre` (string): Genre name to search for
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of track objects with complete metadata (artist, title, album, duration, etc.)

### Online Music Source Tools

#### play_url
Play a direct URL or stream on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `url` (string): URL or stream to play

#### add_url_to_playlist
Add a direct URL or stream to the current playlist.

**Parameters**:
- `playerId` (string): Player ID to add URL to
- `url` (string): URL or stream to add

#### get_favorites
Get all favorites. Favorites often include radio stations, online streams, and playlists.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns**: Array of favorite item objects with `id`, `name`, `type`, `url`, `image`, etc.

#### add_favorite
Add a URL or stream to favorites.

**Parameters**:
- `url` (string): URL or stream to add
- `title` (string): Title for the favorite

#### play_favorite
Play a favorite by item ID on a player.

**Parameters**:
- `playerId` (string): Player ID to play favorite on
- `itemId` (string): Favorite item ID (the `id` field from `get_favorites`)

#### get_radios
Get radio directory categories and apps (TuneIn, etc.).

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns**: Array of radio category/app objects with `cmd`, `name`, `type`, `icon`, etc.

#### search_radio
Search TuneIn radio stations and podcasts.

**Parameters**:
- `playerId` (string): Player ID to use for searching (TuneIn search requires a real player)
- `query` (string): Search query
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of radio search result objects

#### play_radio_item
Play a TuneIn radio search result by item ID on a player.

**Parameters**:
- `playerId` (string): Player ID to play radio on
- `itemId` (string): Radio item ID (the `id` field from `search_radio`)

#### get_apps
Get installed online music apps such as TIDAL, Spotify (Spotty), Qobuz, YouTube, SoundCloud, Mixcloud, and Podcasts.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns**: Array of app objects with `cmd`, `name`, `type`, `icon`, etc. Use the `cmd` value with `browse_app` and `search_app`.

#### browse_app
Browse an online music app menu.

**Parameters**:
- `playerId` (string): Player ID to use for browsing
- `appCmd` (string): App command name (the `cmd` field from `get_apps`, e.g. `tidal`, `spotty`, `qobuz`)
- `itemId` (string, optional): Menu item ID to browse into (omit for top-level menu)
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Object with `title`, `count`, and `items` array. Items have `id`, `name`, `type`, `image`, `isaudio`, and `hasitems`.

#### search_app
Search within an online music app.

**Parameters**:
- `playerId` (string): Player ID to use for searching
- `appCmd` (string): App command name (e.g. `tidal`, `spotty`, `qobuz`)
- `query` (string): Search query
- `searchItemId` (string): Search category item ID (e.g. after browsing the TIDAL Search menu, albums might be item `7.3`)
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Object with `title`, `count`, and `items` array.

#### play_app_item
Play an item from an online music app by item ID.

**Parameters**:
- `playerId` (string): Player ID to play on
- `appCmd` (string): App command name (e.g. `tidal`, `spotty`, `qobuz`)
- `itemId` (string): Item ID to play (the `id` field from `browse_app` or `search_app`)

### Player Control Tools

#### set_power
Turn a player on, off, or toggle power.

**Parameters**:
- `playerId` (string): Player ID to control
- `state` (string): `on`, `off`, or `toggle`

#### set_sleep_timer
Set a sleep timer on a player in seconds.

**Parameters**:
- `playerId` (string): Player ID to control
- `seconds` (number): Sleep timer in seconds (`0` to cancel)

### Mixer / Sound Tools

#### set_bass
Set bass level on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `level` (number): Bass level from `-100` to `100`

#### set_treble
Set treble level on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `level` (number): Treble level from `-100` to `100`

#### set_balance
Set left/right balance on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `level` (number): Balance from `-100` (left) to `100` (right)

#### set_loudness
Enable or disable loudness compensation.

**Parameters**:
- `playerId` (string): Player ID to control
- `enabled` (boolean): `true` to enable, `false` to disable

#### set_mute
Mute or unmute a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `muted` (boolean): `true` to mute, `false` to unmute

### Playlist Editing Tools

#### jump_to_playlist_index
Jump to a specific track index in the current playlist.

**Parameters**:
- `playerId` (string): Player ID to control
- `index` (number): Track index to jump to (0-based)

#### delete_playlist_item
Delete a track from the current playlist by index.

**Parameters**:
- `playerId` (string): Player ID to control
- `index` (number): Track index to delete (0-based)

#### move_playlist_item
Move a track within the current playlist.

**Parameters**:
- `playerId` (string): Player ID to control
- `fromIndex` (number): Source track index
- `toIndex` (number): Destination track index

#### save_playlist
Save the current player playlist as a named playlist.

**Parameters**:
- `playerId` (string): Player ID whose current playlist to save
- `name` (string): Name for the saved playlist

#### delete_saved_playlist
Delete a saved playlist.

**Parameters**:
- `playlistId` (string): Saved playlist ID (the `id` field from `get_playlists`)

#### rename_saved_playlist
Rename a saved playlist.

**Parameters**:
- `playlistId` (string): Saved playlist ID
- `name` (string): New name for the playlist

### Playback Mode Tools

#### set_shuffle
Set shuffle mode on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `mode` (string): `off`, `song`, or `album`

#### set_repeat
Set repeat mode on a player.

**Parameters**:
- `playerId` (string): Player ID to control
- `mode` (string): `off`, `song`, or `all`

#### set_random_play
Start or stop a random play mix.

**Parameters**:
- `mode` (string): `tracks`, `albums`, `artists`, or `year`
- `enabled` (boolean): `true` to start, `false` to stop

### Server & Library Tools

#### get_server_status
Get LMS server status and library statistics (version, total albums/artists/songs, last scan, etc.).

**Parameters**: None

**Returns**: Server status object

#### rescan_library
Trigger a library rescan.

**Parameters**:
- `mode` (string, optional): `progressive` (scan for changes) or `full` (wipe cache and rescan), default `progressive`

### Discovery Tools

#### get_years
Get years available in the music library.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns**: Array of year objects

#### get_decades
Get decades available in the music library.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 100)

**Returns**: Array of decade objects

#### get_new_music
Get recently added albums.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of album objects

#### get_random_albums
Get a random selection of albums.

**Parameters**:
- `limit` (number, optional): Maximum number of results (default: 50)

**Returns**: Array of album objects

## Development

### Project Structure

```
src/
├── index.ts          # Main entry point
├── mcp-server.ts     # MCP server implementation
├── lms-client.ts     # LMS JSONRPC client
├── types.ts          # TypeScript type definitions
└── config.ts         # Configuration management
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Watch Mode

```bash
npm run watch
```

## Troubleshooting

### Connection Issues

1. Verify your LMS server is running and accessible
2. Check the `LMS_HOST` and `LMS_PORT` configuration
3. Test the connection using the `test_connection` tool
4. Ensure your LMS server allows JSONRPC requests

### Common Issues

- **"LMS request failed"**: Check network connectivity and LMS server status
- **"Invalid player ID"**: Use `get_players` to see available player IDs
- **"Unknown tool"**: Ensure you're using the correct tool names from the API reference

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

