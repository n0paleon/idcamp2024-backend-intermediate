/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

const mapAlbumToModel = ({
  id,
  name,
  year,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
});

const mapSongToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = {
  mapAlbumToModel,
  mapSongToModel,
};
