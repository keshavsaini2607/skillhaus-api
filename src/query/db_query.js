// SQL queries for Node.js application

const GET_USER = "SELECT * FROM live.users WHERE username = $1";

const GET_FARMS_EMPLOYEES = `
    SELECT DISTINCT 
        u.user_id,
        c.company_name, 
        c.client_company_id,
        TRIM(CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name)) AS full_name,
        emp.employee_company_id
    FROM live.clients c
    JOIN live.workday_timesheet wt ON c.client_company_id = wt.client_id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id 
    JOIN live.users u ON c.user_id = u.user_id  -- Joining users table with clients
    WHERE u.user_id = $1`;

const GET_HOURS_SHIFTS = `
    SELECT 
    c.company_name,
    c.client_company_id,
    CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name) AS full_name,
    emp.employee_company_id,
    COALESCE(SUM(wb.hours_worked), 0) AS total_hours_worked,
    COALESCE(SUM(wb.no_of_bins), 0) AS total_bins_collected,
    COALESCE(SUM(wb.billed_amount), 0) AS total_billed_amount
FROM live.clients c
JOIN live.workday_timesheet wt ON c.client_company_id = wt.client_id
JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
JOIN live.users u ON c.user_id = u.user_id
LEFT JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
WHERE u.user_id = $1
AND c.client_company_id = $2
AND emp.employee_company_id = $3
GROUP BY c.company_name, c.client_company_id, emp.first_name, emp.middle_name, emp.last_name, emp.employee_company_id`;

const GET_WEEKLY_DATA = `
WITH Last_8_Weeks AS (
    SELECT 
        emp.employee_company_id,
        SUM(wb.hours_worked) AS total_hours_8_weeks,
        SUM(wb.billed_amount) AS total_billed_8_weeks
    FROM live.workday_timesheet wt
    JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
    WHERE wt.date >= CURRENT_DATE - INTERVAL '8 weeks'
    GROUP BY emp.employee_company_id
)
SELECT 
    c.company_name,
    c.client_company_id,
    CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name) AS full_name,
    emp.employee_company_id,
    COALESCE(lw.total_hours_8_weeks, 0) AS total_hours_8_weeks,
    ROUND(COALESCE(lw.total_hours_8_weeks, 0) / 8, 1) AS avg_weekly_hours,
    ROUND(COALESCE(lw.total_billed_8_weeks, 0) / 8, 1) AS avg_weekly_billed
FROM live.clients c
JOIN live.workday_timesheet wt ON c.client_company_id = wt.client_id
JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
JOIN live.users u ON c.user_id = u.user_id
LEFT JOIN Last_8_Weeks lw ON emp.employee_company_id = lw.employee_company_id
WHERE u.user_id = $1
AND c.client_company_id = $2
AND emp.employee_company_id = $3
GROUP BY c.company_name, c.client_company_id, emp.first_name, emp.middle_name, emp.last_name, emp.employee_company_id, lw.total_hours_8_weeks, lw.total_billed_8_weeks`;

const GET_COMPARISON_DATA = `
WITH Current_7_Days AS (
    SELECT 
        emp.employee_company_id,
        SUM(wb.hours_worked) AS total_hours_7_days
    FROM live.workday_timesheet wt
    JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
    WHERE wt.date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
    GROUP BY emp.employee_company_id
),
Previous_7_Days AS (
    SELECT 
        emp.employee_company_id,
        SUM(wb.hours_worked) AS total_hours_prev_7_days
    FROM live.workday_timesheet wt
    JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
    WHERE wt.date BETWEEN CURRENT_DATE - INTERVAL '14 days' AND CURRENT_DATE - INTERVAL '8 days'
    GROUP BY emp.employee_company_id
),
Current_30_Days AS (
    SELECT 
        emp.employee_company_id,
        SUM(wb.hours_worked) AS total_hours_30_days
    FROM live.workday_timesheet wt
    JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
    WHERE wt.date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
    GROUP BY emp.employee_company_id
),
Previous_30_Days AS (
    SELECT 
        emp.employee_company_id,
        SUM(wb.hours_worked) AS total_hours_prev_30_days
    FROM live.workday_timesheet wt
    JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
    JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
    WHERE wt.date BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '31 days'
    GROUP BY emp.employee_company_id
)
SELECT 
    c.company_name,
    c.client_company_id,
    CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name) AS full_name,
    emp.employee_company_id,
    SUM(wb.hours_worked) AS total_hours_worked,
    SUM(wb.no_of_bins) AS total_bins_collected,
    SUM(wb.billed_amount) AS total_billed_amount,
    COALESCE(c7.total_hours_7_days, 0) AS total_hours_7_days,
    COALESCE(p7.total_hours_prev_7_days, 0) AS total_hours_prev_7_days,
    ROUND(
        (COALESCE(c7.total_hours_7_days, 0) - COALESCE(p7.total_hours_prev_7_days, 0)) 
        / NULLIF(COALESCE(p7.total_hours_prev_7_days, 0), 0) * 100, 2
    ) AS percentage_change_7_days,
    COALESCE(c30.total_hours_30_days, 0) AS total_hours_30_days,
    COALESCE(p30.total_hours_prev_30_days, 0) AS total_hours_prev_30_days,
    ROUND(
        (COALESCE(c30.total_hours_30_days, 0) - COALESCE(p30.total_hours_prev_30_days, 0)) 
        / NULLIF(COALESCE(p30.total_hours_prev_30_days, 0), 0) * 100, 2
    ) AS percentage_change_30_days
FROM live.clients c
JOIN live.workday_timesheet wt ON c.client_company_id = wt.client_id
JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
JOIN live.users u ON c.user_id = u.user_id
JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
LEFT JOIN Current_7_Days c7 ON emp.employee_company_id = c7.employee_company_id
LEFT JOIN Previous_7_Days p7 ON emp.employee_company_id = p7.employee_company_id
LEFT JOIN Current_30_Days c30 ON emp.employee_company_id = c30.employee_company_id
LEFT JOIN Previous_30_Days p30 ON emp.employee_company_id = p30.employee_company_id
WHERE u.user_id = $1
AND c.client_company_id = $2
AND emp.employee_company_id = $3
GROUP BY c.company_name, c.client_company_id, emp.first_name, emp.middle_name, emp.last_name, emp.employee_company_id,
         c7.total_hours_7_days, p7.total_hours_prev_7_days, c30.total_hours_30_days, p30.total_hours_prev_30_days
ORDER BY emp.employee_company_id`;

const GET_HOURS_BINS_GRAPH = `
SELECT 
    c.company_name,
    c.client_company_id,
    CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name) AS full_name,
    emp.employee_company_id,
    wt.date,
    wt.start_time,
    wt.end_time,
    wb.shift_name,
    SUM(wb.hours_worked) AS total_hours_worked,
    SUM(wb.no_of_bins) AS total_bins_collected,
    SUM(wb.billed_amount) AS total_billed_amount
FROM live.clients c
JOIN live.workday_timesheet wt ON c.client_company_id = wt.client_id
JOIN live.employee emp ON wt.employee_id = emp.employee_company_id
JOIN live.users u ON c.user_id = u.user_id
JOIN live.workday_billing wb ON wb.timesheet_id = wt.id
WHERE u.user_id = $1
AND c.client_company_id = $2
AND emp.employee_company_id = $3
GROUP BY c.company_name, c.client_company_id, emp.first_name, emp.middle_name, emp.last_name, emp.employee_company_id, wt.date, wt.start_time, wt.end_time, wb.shift_name
ORDER BY wt.date, wb.shift_name`;

export {
    GET_USER,
    GET_FARMS_EMPLOYEES,
    GET_HOURS_SHIFTS,
    GET_WEEKLY_DATA,
    GET_COMPARISON_DATA,
    GET_HOURS_BINS_GRAPH
};
