const axios = require('axios');

const BASE_URL = 'https://api.spotify.com/v1';

const getHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`
  };
};

const getUserPlaylists = async (token) => {
  const response = await axios.get(`${BASE_URL}/me/playlists`, {
    headers: getHeaders(token)
  });
  return response.data;
};

const getPlaylistTracks = async (playlistId, token) => {
  const response = await axios.get(`${BASE_URL}/playlists/${playlistId}/tracks`, {
    headers: getHeaders(token)
  });
  return response.data;
};

const getAudioFeatures = async (trackIds, token) => {
  const ids = trackIds.join(',');
  const response = await axios.get(`${BASE_URL}/audio-features?ids=${ids}`, {
    headers: getHeaders(token)
  });
  return response.data;
};

const createPlaylist = async (userId, name, token) => {
  const response = await axios.post(`${BASE_URL}/users/${userId}/playlists`, {
    name: name
  }, {
    headers: getHeaders(token)
  });
  return response.data;
};

const addTracksToPlaylist = async (playlistId, uris, token) => {
  const response = await axios.post(`${BASE_URL}/playlists/${playlistId}/tracks`, {
    uris: uris
  }, {
    headers: getHeaders(token)
  });
  return response.data;
};

module.exports = {
  getUserPlaylists,
  getPlaylistTracks,
  getAudioFeatures,
  createPlaylist,
  addTracksToPlaylist
};
