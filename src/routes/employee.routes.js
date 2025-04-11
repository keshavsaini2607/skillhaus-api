const express = require("express");
const router = express.Router();
const employeeService = require("../services/employee.service");

router.get("/work-eligibility/:folder/:uuid", async (req, res) => {
   try {
      const folder = req.params.folder;
      const uuid = req.params.uuid;

      const file = await employeeService.getWorkEligibilityDocFromS3(
         folder,
         uuid
      );
      if (!file) {
         return res.status(404).send(`${folder} file for id ${uuid} not found`);
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
         "Content-Disposition",
         `attachment; filename=${folder}-${uuid}.pdf`
      );
      console.log(file);
      res.send(file);
   } catch (error) {
      res.status(500).send(error.message);
   }
});

module.exports = router;
