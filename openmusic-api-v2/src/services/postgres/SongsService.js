const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongToSongDetailsModel } = require('../../utils/dbToModelMapper');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);
    // eslint-disable-next-line no-param-reassign
    albumId = albumId || null;

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song', 500);
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let rawQuery = 'SELECT id, title, performer FROM songs WHERE 1=1';
    const values = [];

    if (title) {
      rawQuery += ` AND title ILIKE $${values.length + 1}`;
      values.push(`%${title}%`);
    }
    if (performer) {
      rawQuery += ` AND performer ILIKE $${values.length + 1}`;
      values.push(`%${performer}%`);
    }

    const results = await this._pool.query(rawQuery, values);

    return results.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1 LIMIT 1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Song not found');
    }

    return result.rows.map(mapSongToSongDetailsModel)[0];
  }

  async updateSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to update song details. Song not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to delete song. Song not found');
    }
  }

  async verifySongId(id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Song not found');
    }
  }
}

module.exports = SongsService;
