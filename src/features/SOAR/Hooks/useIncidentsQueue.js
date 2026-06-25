import { useCallback, useEffect, useState } from "react";

import {
    getIncidents,
    getSoarDashboardOverview,
} from "../Services/IncidentsQueue.js";

export default function useIncidentsQueue({ severity = "all", page = 1, limit = 10 } = {}) {

    const [dashboard, setDashboard] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


        const loadData =  useCallback(async()=>{
            setLoading(true)
            setError(null)
                try {
                    const params = { page, limit, sort: "-createdAt" };
                    if (severity && severity !== "all") {
                        params.severity = severity;
                    }

                    const [dashboardResult, incidentsResult] = await Promise.all([
                        getSoarDashboardOverview(),
                        getIncidents(params),
                    ]);

                    setDashboard(dashboardResult.data ?? null);
                    setIncidents(Array.isArray(incidentsResult.data) ? incidentsResult.data : []);
                    setPagination(incidentsResult.pagination ?? null);
                } catch (error) {
                    setError(error)
                }finally{
                    setLoading(false)
                }
        } , [severity, page, limit])


    useEffect(()=>{
        loadData()
    }, [loadData])


    return {
        dashboard,
        incidents,
        pagination,
        loading,
        error,
        reload: loadData,
    };
}
