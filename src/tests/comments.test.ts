import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import commentsModel, { IComment } from "../models/comments_model";

import testCommentsData from "./test_comments.json";
import { Express } from "express";

let app: Express;

const testComments: IComment[] = testCommentsData;
const baseUrl = "/comments";

beforeAll(async () => {
  console.log("Before all tests");
  app = await appInit();
  await commentsModel.deleteMany();
});

afterAll(() => {
  console.log("After all tests");
  mongoose.connection.close();
});

describe("Comments Test", () => {
  test("Test get all comments empty", async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test create new comment", async () => {
    for (let comment of testComments) {
      const response = await request(app).post(baseUrl).send(comment);
      expect(response.statusCode).toBe(201);
      expect(response.body.comment).toBe(comment.comment);
      expect(response.body.postId).toBe(comment.postId);
      expect(response.body.owner).toBe(comment.owner);
      comment._id = response.body._id;
    }
  });

  test("Test get all post", async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testComments.length);
  });

  test("Test get comment by id", async () => {
    const response = await request(app).get(baseUrl + "/" + testComments[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testComments[0]._id);
  });

  test("Test filter post by owner", async () => {
    const response = await request(app).get(baseUrl + "?owner=" + testComments[0].owner
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Test Delete post", async () => {
    const response = await request(app).delete(baseUrl + "/" + testComments[0]._id);
    expect(response.statusCode).toBe(200);

    const responseGet = await request(app).get(baseUrl + "/" + testComments[0]._id);
    expect(responseGet.statusCode).toBe(404);
  });

  test("Test create new post fail", async () => {
    const response = await request(app).post(baseUrl).send({
      title: "Test Post 1",
      content: "Test Content 1",
    });
    expect(response.statusCode).toBe(400);
  });
});
