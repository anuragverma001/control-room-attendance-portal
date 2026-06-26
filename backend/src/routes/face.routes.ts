import { Router } from "express";
import { FaceController } from "../controllers/face.controller";
import { faceUpload } from "../middleware/face-upload.middleware";

const router = Router();

router.post(
  "/upload-face/:id",
  faceUpload.single("face"),
  FaceController.uploadFace
);

export default router;
