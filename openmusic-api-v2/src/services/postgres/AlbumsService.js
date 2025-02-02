const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(21);

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumResult = await this._pool.query('SELECT id, name, year FROM albums WHERE id = $1 LIMIT 1', [id]);

    if (albumResult.rowCount === 0) {
      throw new NotFoundError('Failed to get album. Album not found');
    }

    const songResults = await this._pool.query('SELECT id, title, performer FROM songs WHERE album_id = $1', [albumResult.rows[0].id]);
    albumResult.rows[0].songs = songResults.rows;

    return albumResult.rows[0];
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to update album. Album not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Failed to delete album. Album not found');
    }
  }
}

module.exports = AlbumsService;
