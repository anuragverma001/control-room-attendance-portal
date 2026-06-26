import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { faceUpload } from "../middleware/face-upload.middleware";
import { FaceController } from "../controllers/face.controller";

const router = Router();

router.post(
  "/create",
  EmployeeController.createEmployee
);

router.get(
  "/list",
  EmployeeController.getAllEmployees
);

router.get(
  "/:id",
  EmployeeController.getEmployeeById
);
router.put(
  "/:id",
  EmployeeController.updateEmployee
);
router.delete(
  "/:id",
  EmployeeController.deleteEmployee
);
router.post(
  "/:id/upload-face",
  faceUpload.single("face"),
  FaceController.uploadFace
);

export default router;