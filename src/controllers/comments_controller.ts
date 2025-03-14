// // src/controllers/comments_controller.ts
// import commentModel, { IComment } from '../models/comments_model';
// import { Request, Response } from 'express';
// import createController from './base_controller';

// const commentsController = new createController<IComment>(commentModel);

// export default commentsController;
// src/controllers/comments_controller.ts
import commentModel, { IComment } from '../models/comments_model';
import { Request, Response } from 'express';
import BaseController from './base_controller';

class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentModel);
  }
}

export default new CommentsController();
