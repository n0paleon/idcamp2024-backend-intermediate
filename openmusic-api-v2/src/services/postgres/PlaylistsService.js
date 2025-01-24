const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(32);

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Failed to add playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1
      `,
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1 LIMIT 1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to get playlists. Playlist ID not found');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to delete playlist. Playlist ID not found');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this._songsService.verifySongId(songId);

    const id = nanoid(32);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to song to playlist. Playlist ID not found');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `
      SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      INNER JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    await this._songsService.verifySongId(songId);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to delete song from playlist. Playlist ID not found');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Playlist ID not found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError('You do not have permission to access this playlist');
    }
  }
}

module.exports = PlaylistsService;
