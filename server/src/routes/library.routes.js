import express from "express";
import * as libraryController from "../controllers/library.controller.js";

const router = express.Router();

router.get("/", libraryController.getArticles);
router.get("/tags", libraryController.getTags);
router.get("/:slug", libraryController.getArticle);

export default router;
