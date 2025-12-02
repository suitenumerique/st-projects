import socket from './socket';

/* Actions */

const createFolder = (data, headers) => socket.post('/folders', data, headers);

const updateFolder = (id, data, headers) => socket.patch(`/folders/${id}`, data, headers);

const deleteFolder = (id, headers) => socket.delete(`/folders/${id}`, undefined, headers);

export default {
  createFolder,
  updateFolder,
  deleteFolder,
};
