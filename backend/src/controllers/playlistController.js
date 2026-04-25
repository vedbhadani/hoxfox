const spotifyService = require('../services/spotifyService');

const extractToken = (req) => {
  let token = req.headers.authorization;
  if (!token) {
    throw new Error('Missing authorization header');
  }
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }
  return token;
};

const getUserPlaylists = async (req, res) => {
  try {
    const token = extractToken(req);
    const data = await spotifyService.getUserPlaylists(token);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user playlists' });
  }
};

const getPlaylistTracks = async (req, res) => {
  try {
    const token = extractToken(req);
    const { id } = req.params;
    const data = await spotifyService.getPlaylistTracks(id, token);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
};

const getAudioFeatures = async (req, res) => {
  try {
    const token = extractToken(req);
    const { trackIds } = req.body;
    
    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({ error: 'trackIds array is required' });
    }

    const data = await spotifyService.getAudioFeatures(trackIds, token);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audio features' });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const token = extractToken(req);
    const { userId, name } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    const data = await spotifyService.createPlaylist(userId, name, token);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

const addTracksToPlaylist = async (req, res) => {
  try {
    const token = extractToken(req);
    const { playlistId, uris } = req.body;
    
    if (!playlistId || !uris || !Array.isArray(uris)) {
      return res.status(400).json({ error: 'playlistId and uris array are required' });
    }

    const data = await spotifyService.addTracksToPlaylist(playlistId, uris, token);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add tracks to playlist' });
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistTracks,
  getAudioFeatures,
  createPlaylist,
  addTracksToPlaylist
};
