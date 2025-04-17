const express = require("express");
const router = express.Router();
const employeeService = require("../services/employee.service");
const { getUserByUID } = require("../services/auth.service");

router.get("/:folder/:subFolder/:userId", async (req, res) => {
   try {
      const folder = req.params.folder;
      const subFolder = req.params.subFolder;
      const userId = req.params.userId;
      const user = await getUserByUID(userId);
      if (!user) {
         return res.status(404).send("User not found");
      }
      const uuid = user.id;

      const file = await employeeService.getWorkEligibilityDocFromS3(
         folder,
         subFolder,
         uuid
      );
      if (!file) {
         return res.status(404).send(`${folder} file for id ${uuid} not found`);
      }
      
      res.status(200).send(file); // Send the signed URL as a response to the client
   } catch (error) {
      res.status(500).send(error.message);
   }
});

module.exports = router;
