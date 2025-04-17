// SQL queries for Node.js application

const GET_USER = "SELECT * FROM live.users WHERE username = $1";
const GET_USER_BY_UID = "SELECT * FROM live.users WHERE user_id = $1";

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


const GET_EMPLOYEE_DETAILS = `SELECT 
	emp.id as emp_uuid,
    emp.employee_company_id, 
    CONCAT(emp.first_name, ' ', COALESCE(emp.middle_name, ''), ' ', emp.last_name) AS full_name, 
    emp.gender, 
    emp.dob, 
    emp.status, 
    emp.relationship_status,
    
    -- Latest record from employee_levels
    emp_level."levels",

    -- Latest record from employee_auschem
    auschem.id as auschem_uuid,
    auschem.company_name AS auschem_company_name,
    auschem.registration_numbers,
    auschem.expiry_date AS auschem_expiry_date,
    auschem.file AS auschem_file,
    auschem.verification_status AS auschem_verification_status,
    auschem.updated_on AS auschem_updated_on,

    -- Latest record from employee_auscup
    auscup.id as auscup_uuid,
    auscup.company_name AS auscup_company_name,
    auscup.permit_no,
    auscup.permit_type,
    auscup.permit_expiry,
    auscup.verification_status AS auscup_verification_status,
    auscup.updated_on AS auscup_updated_on,

    -- Latest record from employee_bankdetails
    bank.id as bank_uuid,
    bank.salary_bank_name,
    bank.salary_bank_account_no,
    bank.salary_bank_bsb_no,
    bank.status AS bank_account_status,
    bank.updated_on AS bank_updated_on,

    -- Latest record from employee_dl (Driver License)
    dl.id as dl_uuid,
    dl.licence_number,
    dl.licence_expiry,
    dl.verification_status AS dl_verification_status,
    dl.updated_on AS dl_updated_on,

    -- Latest record from employee_contact
    contact.id as contact_uuid,
    contact.street_no_and_name,
    contact.suburb,
    contact.state,
    contact.postcode,
    contact.home_phone,
    contact.mobile_phone,
    contact.primary_email,
    contact.secondary_email,
    contact.mobile_verification_status,
    contact.homephone_verification_status,
    contact.email_verification_status,
    contact.updated_on AS contact_updated_on,

    -- Latest record from employee_emergency
    emergency.id as emergency_uuid,
    emergency.name_of_person,
    emergency.relationship,
    emergency.street_no_and_name AS emergency_address,
    emergency.suburb AS emergency_suburb,
    emergency.state AS emergency_state,
    emergency.postal_code AS emergency_postal_code,
    emergency.home_phone_no AS emergency_home_phone,
    emergency.mobile_no AS emergency_mobile,
    emergency.work_no AS emergency_work_no,
    emergency.status as emergency_contact_status,
    emergency.updated_on AS emergency_updated_on,

    -- Latest record from employee_passport
    passport.id as passport_uuid,
    passport.nationality,
    passport.passport_no,
    passport.date_of_expiry,
    passport.verification_status AS passport_verification_status,
    passport.updated_on AS passport_updated_on,
    passport.country_of_passport,

    -- Latest record from employee_super
    super.id as super_uuid,
    super.fund_name,
    super.member_number,
    super.bsb AS super_bsb,
    super.account_number AS super_account_number,
    super.abn AS super_abn,
    super.spin AS super_spin,
    super.usm AS super_usm,
    super.employer_membership_number,
    super.rsa_member_number,
    super.fund_phone,
    super.status as super_status,
    super.updated_on AS super_updated_on,

    -- Latest record from employee_tfn (Tax File Number)
    tfn.id as tfn_uuid,
    tfn.is_authorised_payer,
    tfn.purpose_to_paid_id,
    tfn.is_australian,
    tfn.is_claiming_reduce_rate,
    tfn.is_claiming_special_taxis,
    tfn.hecs_debt,
    tfn.is_financial_supplement_debt,
    tfn.is_deductible_amount,
    tfn.status as tfn_status,
    tfn.updated_on AS tfn_updated_on,

    -- Latest record from employee_vivo (Visa Details)
    vivo.id as vivo_uuid,
    vivo.vivo_num,
    vivo.vivo_expiry_date,
    vivo.vivo_verification_status,
    vivo.visa_category,
    vivo.visa_class_subclass,
    vivo.visa_applicant,
    vivo.visa_grant_date,
    vivo.visa_location,
    vivo.visa_work_entitlement,
    vivo.vivo_queried_on,
    vivo.updated_on AS vivo_updated_on

FROM live.employee emp

-- Joining latest record from employee_auschem
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_auschem 
    ORDER BY employee_id, updated_on DESC
) auschem 
    ON emp.employee_company_id = auschem.employee_id

-- Joining latest record from employee_auscup
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_auscup 
    ORDER BY employee_id, updated_on DESC
) auscup 
    ON emp.employee_company_id = auscup.employee_id

-- Joining latest record from employee_bankdetails
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_bankdetails
    ORDER BY employee_id, updated_on DESC
) bank
    ON emp.employee_company_id = bank.employee_id

-- Joining latest record from employee_dl (Driver License)
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_dl
    ORDER BY employee_id, updated_on DESC
) dl
    ON emp.employee_company_id = dl.employee_id

-- Joining latest record from employee_contact
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_contact
    ORDER BY employee_id, updated_on DESC
) contact
    ON emp.employee_company_id = contact.employee_id

-- Joining latest record from employee_emergency
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_emergency
    ORDER BY employee_id, updated_on DESC
) emergency
    ON emp.employee_company_id = emergency.employee_id

-- Joining latest record from employee_passport
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_passport
    ORDER BY employee_id, updated_on DESC
) passport
    ON emp.employee_company_id = passport.employee_id

-- Joining latest record from employee_super
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_super
    ORDER BY employee_id, updated_on DESC
) super
    ON emp.employee_company_id = super.employee_id

-- Joining latest record from employee_tfn (Tax File Number)
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_tfn
    ORDER BY employee_id, updated_on DESC
) tfn
    ON emp.employee_company_id = tfn.employee_id

-- Joining latest record from employee_vivo (Visa Details)
JOIN (
    SELECT DISTINCT ON (employee_id) * 
    FROM live.employee_vivo
    ORDER BY employee_id, updated_on DESC
) vivo
    ON emp.employee_company_id = vivo.employee_id
    
-- Joining latest record from employee_level (Level Details)
JOIN (
    SELECT DISTINCT ON (employee_company_id) * 
    FROM live.employee_levels
    ORDER BY employee_company_id, updated_on DESC
) emp_level
    ON emp.employee_company_id = emp_level.employee_company_id

WHERE 
    emp.status = 'Active'
    AND emp_level."levels" <> 'Director'`;

export {
   GET_USER,
   GET_FARMS_EMPLOYEES,
   GET_HOURS_SHIFTS,
   GET_WEEKLY_DATA,
   GET_COMPARISON_DATA,
   GET_HOURS_BINS_GRAPH,
   GET_EMPLOYEE_DETAILS,
   GET_USER_BY_UID
};
