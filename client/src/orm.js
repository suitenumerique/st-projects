import { ORM } from 'redux-orm';

import {
  Activity,
  Attachment,
  Board,
  BoardMembership,
  Card,
  Folder,
  Label,
  List,
  Notification,
  Project,
  ProjectManager,
  Task,
  User,
  UserBoardPreference,
} from './models';

const orm = new ORM({
  stateSelector: (state) => state.orm,
});

orm.register(
  User,
  Project,
  ProjectManager,
  Board,
  BoardMembership,
  Folder,
  Label,
  List,
  Card,
  Task,
  Attachment,
  Activity,
  Notification,
  UserBoardPreference,
);

export default orm;
