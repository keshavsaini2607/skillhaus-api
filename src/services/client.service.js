const { pool } = require('../config/database');
const queries = require("../query/db_query.js");

const getUserFarmsEmployees = async (userId) => {
    try {
        const result = await pool.query(queries.GET_FARMS_EMPLOYEES, [userId]);
        if (!result.rows.length) {
            const error = new Error('No farms and employees found for this user');
            error.status = 404;
            throw error;
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const getHoursBinsData = async (userId, clientCompanyId, empCompanyId) => {
    if (!userId || !clientCompanyId || !empCompanyId) {
        const error = new Error('Missing required parameters: user_id, client_company_id, emp_company_id');
        error.status = 400;
        throw error;
    }

    try {
        const result = await pool.query(queries.GET_HOURS_SHIFTS, [userId, clientCompanyId, empCompanyId]);
        if (!result.rows.length) {
            const error = new Error('No data found for the given parameters');
            error.status = 404;
            throw error;
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const getWeeklyData = async (userId, clientCompanyId, empCompanyId) => {
    if (!userId || !clientCompanyId || !empCompanyId) {
        const error = new Error('Missing required parameters: user_id, client_company_id, emp_company_id');
        error.status = 400;
        throw error;
    }

    try {
        const result = await pool.query(queries.GET_WEEKLY_DATA, [userId, clientCompanyId, empCompanyId]);
        if (!result.rows.length) {
            const error = new Error('No data found for the given parameters');
            error.status = 404;
            throw error;
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const getComparisonData = async (userId, clientCompanyId, empCompanyId) => {
    if (!userId || !clientCompanyId || !empCompanyId) {
        const error = new Error('Missing required parameters: user_id, client_company_id, emp_company_id');
        error.status = 400;
        throw error;
    }

    try {
        const result = await pool.query(queries.GET_COMPARISON_DATA, [userId, clientCompanyId, empCompanyId]);
        if (!result.rows.length) {
            const error = new Error('No data found for the given parameters');
            error.status = 404;
            throw error;
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
};

const getHoursBinsGraphData = async (userId, clientCompanyId, empCompanyId) => {
    if (!userId || !clientCompanyId || !empCompanyId) {
        const error = new Error('Missing required parameters: user_id, client_company_id, emp_company_id');
        error.status = 400;
        throw error;
    }

    try {
        const result = await pool.query(queries.GET_HOURS_BINS_GRAPH, [userId, clientCompanyId, empCompanyId]);
        if (!result.rows.length) {
            const error = new Error('No data found for the given parameters');
            error.status = 404;
            throw error;
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getUserFarmsEmployees,
    getHoursBinsData,
    getWeeklyData,
    getComparisonData,
    getHoursBinsGraphData
};