const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { userId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner: userId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { userId } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { userId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, userId);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist deleted successfully',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'An error occurred',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { id } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(id, userId);
    await this._service.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Song added to playlist successfully',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request) {
    const { id } = request.params;
    const { userId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, userId);
    const playlist = await this._service.getPlaylistById(id);
    playlist.songs = await this._service.getSongsFromPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);
    const { id } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner(id, userId);
    await this._service.deleteSongFromPlaylist(id, songId);

    return {
      status: 'success',
      message: 'Song deleted successfully',
    };
  }
}

module.exports = PlaylistsHandler;
