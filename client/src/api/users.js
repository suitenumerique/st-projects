import http from './http';
import socket from './socket';

/* Transformers */

export const transformUser = (user) => ({
  ...user,
  createdAt: new Date(user.createdAt),
});

/* Actions */

const searchUsers = (query, excludeUserIds, headers) => {
  const params = new URLSearchParams();
  params.append('query', query);

  if (excludeUserIds && excludeUserIds.length > 0) {
    excludeUserIds.forEach((id) => params.append('excludeUserIds', id));
  }

  return socket.get(`/users/search?${params.toString()}`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformUser),
  }));
};

const createUser = (data, headers) =>
  socket.post('/users', data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const getUser = (id, headers) =>
  socket.get(`/users/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const getCurrentUser = (subscribe, headers) =>
  socket.get(`/users/me${subscribe ? '?subscribe=true' : ''}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUser = (id, data, headers) =>
  socket.patch(`/users/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserEmail = (id, data, headers) =>
  socket.patch(`/users/${id}/email`, data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserPassword = (id, data, headers) =>
  socket.patch(`/users/${id}/password`, data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserUsername = (id, data, headers) =>
  socket.patch(`/users/${id}/username`, data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserAvatar = (id, data, headers) =>
  http.post(`/users/${id}/avatar`, data, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const deleteUser = (id, headers) =>
  socket.delete(`/users/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

/* Event handlers */

const makeHandleUserCreate = (next) => (body) => {
  next({
    ...body,
    item: transformUser(body.item),
  });
};

const makeHandleUserUpdate = makeHandleUserCreate;

const makeHandleUserDelete = makeHandleUserCreate;

export default {
  searchUsers,
  createUser,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
  updateUserAvatar,
  deleteUser,
  makeHandleUserCreate,
  makeHandleUserUpdate,
  makeHandleUserDelete,
};
