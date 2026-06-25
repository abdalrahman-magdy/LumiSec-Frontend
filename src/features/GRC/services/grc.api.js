import { request } from "../../../services/apiClient";

const GRC_BASE = "/api/grc";

export function getGrcDashboardOverview() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/overview` });
}

export function getGrcDashboardCompliance() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/compliance` });
}

export function getGrcDashboardTasks() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/tasks` });
}

export function getGrcDashboardRisks() {
  return request({ method: "GET", url: `${GRC_BASE}/dashboard/risks` });
}

export function getGrcTasks(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/tasks`,
    params,
  });
}

export function createGrcTask(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/tasks`,
    data: payload,
  });
}

export function updateGrcTask(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/tasks/${id}`,
    data: payload,
  });
}

export function getGrcFindings(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/findings`,
    params,
  });
}

export function getGrcControls(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/compliance/controls`,
    params,
  });
}

export function createGrcControl(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/compliance/controls`,
    data: payload,
  });
}

export function updateGrcControl(id, payload) {
  return request({
    method: "PATCH",
    url: `${GRC_BASE}/compliance/controls/${id}`,
    data: payload,
  });
}

export function getGrcReports(params = {}) {
  return request({
    method: "GET",
    url: `${GRC_BASE}/reports`,
    params,
  });
}

export function createGrcReport(payload) {
  return request({
    method: "POST",
    url: `${GRC_BASE}/reports`,
    data: payload,
  });
}
