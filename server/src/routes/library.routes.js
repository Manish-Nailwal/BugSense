import express from "express";
import * as libraryController from "../controllers/library.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", libraryController.getArticles);
router.get("/tags", libraryController.getTags);
router.get("/:slug", libraryController.getArticle);
router.patch("/:id", protect, libraryController.updateArticle);
router.delete("/:id", protect, libraryController.deleteArticle);

export default router;
