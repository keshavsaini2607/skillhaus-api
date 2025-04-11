const express = require("express");
const router = express.Router();
const clientService = require("../services/client.service");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/get-user-farms-employees", verifyToken, async (req, res) => {
   try {
      const farms_employees = await clientService.getUserFarmsEmployees(
         req.userId
      );
      res.json({ user_id: req.userId, farms_employees });
   } catch (error) {
      res.status(error.status || 500).json({ detail: error.message });
   }
});

router.get(
   "/get-total-data/:user_id/:client_company_id/:emp_company_id",
   async (req, res) => {
      try {
         const { user_id, client_company_id, emp_company_id } = req.params;
         const data = await clientService.getHoursBinsData(
            user_id,
            client_company_id,
            emp_company_id
         );
         res.json(data);
      } catch (error) {
         res.status(error.status || 500).json({ detail: error.message });
      }
   }
);

router.get(
   "/get-weekly-data/:user_id/:client_company_id/:emp_company_id",
   async (req, res) => {
      try {
         const { user_id, client_company_id, emp_company_id } = req.params;
         const data = await clientService.getWeeklyData(
            user_id,
            client_company_id,
            emp_company_id
         );
         res.json(data);
      } catch (error) {
         res.status(error.status || 500).json({ detail: error.message });
      }
   }
);

router.get(
   "/get-comparison-data/:user_id/:client_company_id/:emp_company_id",
   async (req, res) => {
      try {
         const { user_id, client_company_id, emp_company_id } = req.params;
         const data = await clientService.getComparisonData(
            user_id,
            client_company_id,
            emp_company_id
         );
         res.json(data);
      } catch (error) {
         res.status(error.status || 500).json({ detail: error.message });
      }
   }
);

router.get(
   "/get-hours-bins-graph-data/:user_id/:client_company_id/:emp_company_id",
   async (req, res) => {
      try {
         const { user_id, client_company_id, emp_company_id } = req.params;
         const data = await clientService.getHoursBinsGraphData(
            user_id,
            client_company_id,
            emp_company_id
         );
         res.json(data);
      } catch (error) {
         res.status(error.status || 500).json({ detail: error.message });
      }
   }
);

router.get("/get-employee-details/", async (req, res) => {
   try {
      const { user_id, emp_company_id } = req.params;
      console.log({ user_id, emp_company_id });
      const data = await clientService.getEmployeeDetails(
         user_id,
         emp_company_id
      );
      res.json(data);
   } catch (error) {
      console.log({ error });
      res.status(error.status || 500).json({ detail: error.message });
   }
});

module.exports = router;
