const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export function normalizeSeverity(value = "medium") {
  const s = String(value).toLowerCase();
  if (s.includes("crit")) return "critical";
  if (s.includes("high")) return "high";
  if (s.includes("med")) return "medium";
  if (s.includes("low")) return "low";
  if (s.includes("fix")) return "fixed";
  return s;
}

export function riskLevelFromScore(score = 0) {
  const n = Number(score) || 0;
  if (n >= 80) return "critical";
  if (n >= 60) return "high";
  if (n >= 40) return "medium";
  return "low";
}

/** Coerce API values to safe JSX strings — never pass raw objects to React children. */
export function resolveDisplayText(value, fallback = "—") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const nested =
      value.hostname ??
      value.host ??
      value.name ??
      value.ip ??
      value.label ??
      value.title ??
      value.type;
    if (nested != null && typeof nested !== "object") {
      return String(nested);
    }
    return fallback;
  }
  return fallback;
}

export function normalizeScanAsset(raw = {}) {
  return {
    ip: resolveDisplayText(raw.ip ?? raw.ipAddress ?? raw.ip_address),
    hostname: resolveDisplayText(raw.hostname ?? raw.host ?? raw.name, "Unknown"),
    osType: resolveDisplayText(raw.osType ?? raw.os_type ?? raw.os, "Unknown"),
    mac: resolveDisplayText(raw.mac ?? raw.macAddress ?? raw.mac_address),
    vendor: resolveDisplayText(raw.vendor),
  };
}

function riskScoreForPort(port) {
  const risky = {
    21: 75,
    23: 90,
    445: 70,
    3389: 65,
    5900: 60,
  };
  return risky[port] ?? 20;
}

function normalizeOpenPortEntry(entry, index, scanMode = "CONNECT") {
  if (typeof entry === "number") {
    return {
      id: `port-${index}`,
      port: entry,
      protocol: scanMode === "UDP" ? "UDP" : "TCP",
      service: "unknown",
      state: "open",
      riskScore: 0,
      riskLevel: "low",
    };
  }

  const serviceRaw = entry.service ?? entry.name ?? "unknown";
  const protocolRaw = entry.protocol ?? (scanMode === "UDP" ? "UDP" : "TCP");
  const port = Number(entry.port ?? entry.portNumber ?? entry.number ?? 0);
  const riskScore = Number(entry.riskScore ?? entry.risk_score ?? entry.risk ?? riskScoreForPort(port));

  return {
    id: entry.id ?? `port-${index}`,
    port,
    protocol: resolveDisplayText(protocolRaw, "TCP").toUpperCase(),
    service: resolveDisplayText(serviceRaw, "unknown"),
    state: resolveDisplayText(entry.state ?? entry.status ?? "open", "open").toLowerCase(),
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
  };
}

function normalizeServiceList(services) {
  if (!Array.isArray(services)) {
    return typeof services === "string"
      ? services.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  }

  return services
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") return String(entry);
      if (entry && typeof entry === "object") {
        const port = entry.port ?? entry.portNumber;
        const service = entry.service ?? entry.name;
        if (service && port) return `${service}:${port}`;
        if (service) return String(service);
        if (port) return String(port);
      }
      return "";
    })
    .filter(Boolean);
}

export function normalizeAsset(raw = {}, index = 0) {
  const riskScore = Number(raw.riskScore ?? raw.risk_score ?? raw.score ?? 0);
  const servicesRaw = raw.services ?? raw.openPorts ?? raw.open_ports ?? [];
  const openPortCount = Array.isArray(servicesRaw)
    ? servicesRaw.length
    : Number(raw.openPorts ?? raw.open_ports ?? 0);
  const rawStatus = (raw.status ?? "unknown").toLowerCase();
  return {
    id: raw._id ?? raw.id ?? raw.mac ?? raw.ip ?? `asset-${index}`,
    ip: raw.ip ?? raw.ipAddress ?? raw.ip_address ?? "—",
    mac: raw.mac ?? raw.macAddress ?? raw.mac_address ?? "—",
    hostname: raw.hostname ?? raw.host ?? raw.name ?? "Unknown",
    osGuess:
      raw.osGuess ??
      raw.os_guess ??
      raw.osType ??
      raw.os_type ??
      raw.os ??
      raw.operatingSystem ??
      "Unknown",
    services: normalizeServiceList(servicesRaw),
    status: rawStatus,
    isOnline: rawStatus === "active" || rawStatus === "online",
    riskScore,
    riskLevel: normalizeSeverity(raw.riskLevel ?? raw.risk_level ?? riskLevelFromScore(riskScore)),
    category: raw.category ?? raw.type ?? "general",
    openPorts: openPortCount,
    lastSeen: raw.lastSeen ?? raw.last_seen ?? null,
    vendor: raw.vendor ?? null,
    raw,
  };
}

export function normalizeAssetList(payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.assets ?? payload?.inventory ?? payload?.data ?? payload?.items ?? [];
  return list.map(normalizeAsset);
}

export function normalizeAssetDetails(payload = {}) {
  const body = payload?.asset ? payload : { asset: payload };
  return {
    asset: normalizeAsset(body.asset ?? {}),
    misconfigurations: normalizeMisconfigurationList(body.misconfigurations ?? []),
  };
}

export function normalizeFlowMetricRow(raw = {}, index = 0) {
  return {
    id: raw._id ?? raw.id ?? `flow-${index}`,
    sourceIp: raw.sourceIp ?? raw.source_ip ?? "—",
    destinationIp: raw.destinationIp ?? raw.destination_ip ?? "—",
    protocol: raw.protocol ?? "—",
    packetsPerSecond: Number(raw.packetsPerSecond ?? raw.packets_per_second ?? 0),
    bandwidthKbps: Number(raw.bandwidthKbps ?? raw.bandwidth_kbps ?? 0),
    isAnomaly: Boolean(raw.isAnomaly ?? raw.is_anomaly),
    severity: normalizeSeverity(raw.severity ?? (raw.isAnomaly ? "high" : "low")),
    observedAt: raw.observedAt ?? raw.observed_at ?? raw.createdAt ?? null,
  };
}

export function normalizeAssetContext(payload = {}) {
  return {
    asset: normalizeAsset(payload.asset ?? {}),
    misconfigurations: normalizeMisconfigurationList(payload.misconfigurations ?? []),
    recentFlows: (payload.recentFlows ?? payload.recent_flows ?? []).map(normalizeFlowMetricRow),
  };
}

export function normalizeMisconfiguration(raw = {}, index = 0) {
  const assetRaw = raw.asset ?? raw.hostname ?? raw.host ?? raw.assetName;
  const assetIp =
    raw.assetIp ??
    raw.ip ??
    raw.ipAddress ??
    raw.ip_address ??
    (typeof raw.asset === "object" ? raw.asset?.ip : null);

  return {
    id: raw._id ?? raw.id ?? `mc-${index}`,
    asset: resolveDisplayText(assetRaw, "Unknown"),
    ip: resolveDisplayText(assetIp),
    type: resolveDisplayText(
      raw.type ?? raw.misconfigurationType ?? raw.category,
      "Misconfiguration"
    ),
    severity: normalizeSeverity(raw.severity ?? raw.risk ?? "medium"),
    description: resolveDisplayText(
      raw.description ?? raw.details ?? raw.finding,
      ""
    ),
    status: resolveDisplayText(raw.status ?? "open", "open").toLowerCase(),
    raw,
  };
}

export function normalizeMisconfigurationList(payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.misconfigurations ?? payload?.findings ?? payload?.data ?? payload?.items ?? [];
  return list.map(normalizeMisconfiguration);
}

export function countBySeverity(items = []) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, fixed: 0 };
  items.forEach((item) => {
    const sev =
      ["fixed", "resolved", "accepted"].includes(item.status)
        ? "fixed"
        : normalizeSeverity(item.severity);
    if (counts[sev] !== undefined) counts[sev] += 1;
  });
  return counts;
}

export function normalizeFlowMetrics(payload = {}) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.metrics ?? payload?.flows ?? payload?.data ?? payload?.items ?? null;
  if (Array.isArray(rows)) {
    const latest = rows[0] ?? {};
    const anomalies = rows.filter((row) => row.isAnomaly || row.is_anomaly);
    const labels = rows.map((row) => {
      const observedAt = row.observedAt ?? row.observed_at ?? row.createdAt;
      return observedAt ? new Date(observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
    }).reverse();

    return {
      currentPps: Number(latest.packetsPerSecond ?? latest.packets_per_second ?? 0),
      avgPps: rows.length
        ? Math.round(rows.reduce((sum, row) => sum + Number(row.packetsPerSecond ?? row.packets_per_second ?? 0), 0) / rows.length)
        : 0,
      peakPps: rows.reduce((max, row) => Math.max(max, Number(row.packetsPerSecond ?? row.packets_per_second ?? 0)), 0),
      floodEvents: anomalies.length,
      bandwidth: {
        inboundMbps: Number(latest.bandwidthKbps ?? latest.bandwidth_kbps ?? 0) / 1024,
        outboundMbps: 0,
      },
      timeline: {
        labels,
        baseline: rows.map((row) => Number(row.baselinePacketsPerSecond ?? row.baseline_packets_per_second ?? 0)).reverse(),
        current: rows.map((row) => Number(row.packetsPerSecond ?? row.packets_per_second ?? 0)).reverse(),
        threshold: rows.map((row) => Number(row.thresholdPacketsPerSecond ?? row.threshold_packets_per_second ?? 0)).reverse(),
      },
      anomalies: anomalies.map((a, i) => ({
        id: a._id ?? a.id ?? `anomaly-${i}`,
        type: "Flow anomaly",
        severity: normalizeSeverity(a.severity ?? "high"),
        pps: Number(a.packetsPerSecond ?? a.packets_per_second ?? 0),
        source: a.sourceIp ?? a.source_ip ?? "—",
        timestamp: a.observedAt ?? a.observed_at ?? "—",
        isSpike: true,
      })),
      exfiltration: [],
      activitySeries: null,
      raw: rows,
    };
  }

  const data = payload.data ?? payload;
  const timeline = data.timeline ?? data.traffic ?? {};
  return {
    currentPps: Number(data.currentPps ?? data.current_pps ?? data.pps ?? 0),
    avgPps: Number(data.avgPps ?? data.avg_pps ?? data.averagePps ?? 0),
    peakPps: Number(data.peakPps ?? data.peak_pps ?? data.maxPps ?? 0),
    floodEvents: Number(data.floodEvents ?? data.flood_events ?? data.floods ?? 0),
    bandwidth: {
      inboundMbps: Number(data.bandwidth?.inboundMbps ?? data.inbound_mbps ?? data.inbound ?? 0),
      outboundMbps: Number(data.bandwidth?.outboundMbps ?? data.outbound_mbps ?? data.outbound ?? 0),
    },
    timeline: {
      labels: timeline.labels ?? timeline.timestamps ?? [],
      baseline: timeline.baseline ?? timeline.baselineValues ?? [],
      current: timeline.current ?? timeline.currentValues ?? timeline.values ?? [],
      threshold: timeline.threshold ?? timeline.sigmaThreshold ?? [],
    },
    anomalies: (data.anomalies ?? data.alerts ?? []).map((a, i) => ({
      id: a.id ?? `anomaly-${i}`,
      type: a.type ?? a.name ?? "Anomaly",
      severity: normalizeSeverity(a.severity ?? "high"),
      pps: Number(a.pps ?? a.rate ?? 0),
      source: a.source ?? a.src ?? a.ip ?? "—",
      timestamp: a.timestamp ?? a.time ?? "—",
      isSpike: Boolean(a.isSpike ?? a.spike ?? a.pps > (data.avgPps ?? 0) * 2),
    })),
    exfiltration: (data.exfiltration ?? data.exfiltrationIndicators ?? []).map((e, i) => ({
      id: e.id ?? `exfil-${i}`,
      label: e.label ?? e.type ?? "Exfiltration indicator",
      host: e.host ?? e.asset ?? e.ip ?? "—",
      score: Number(e.score ?? e.risk ?? 0),
    })),
    activitySeries: data.activitySeries ?? data.networkActivity ?? null,
    raw: data,
  };
}

export function normalizeDiscoveryResult(payload = {}, subnetCidr) {
  const data = payload.data ?? payload;
  const hosts = normalizeAssetList(data.hosts ?? data.discoveredHosts ?? data.assets ?? []).map(
    (host) => ({
      ...host,
      subnet: host.subnet ?? subnetCidr ?? "—",
    })
  );
  const subnetsRaw = data.subnets ?? data.subnetOverview ?? [];
  const discoveredCount = Number(data.discovered_count ?? data.discoveredCount ?? hosts.length);
  const subnets = subnetsRaw.length
    ? subnetsRaw.map((s) => ({
        cidr: s.cidr ?? s.subnet ?? s.network ?? "—",
        active: Number(s.active ?? s.activeHosts ?? s.up ?? 0),
        total: Number(s.total ?? s.totalHosts ?? s.hosts ?? 0),
        range: s.range ?? s.addressRange ?? "1-254",
      }))
    : subnetCidr
      ? [{
          cidr: subnetCidr,
          active: hosts.filter((host) => host.isOnline).length || discoveredCount,
          total: discoveredCount,
          range: `${discoveredCount} host(s) discovered`,
        }]
      : [];

  return {
    progress: Number(data.progress ?? data.percentage ?? 100),
    status: data.status ?? "completed",
    hosts,
    subnets,
    misconfigurations: normalizeMisconfigurationList(
      data.misconfigurations ?? data.warnings ?? []
    ),
    raw: data,
  };
}

export function normalizePortScanResult(payload = {}) {
  const data = payload.data ?? payload;
  const asset = normalizeScanAsset(data.asset ?? {});
  const scanMode = data.scanMode ?? data.scan_mode ?? "CONNECT";
  const resultsRaw = data.open_ports ?? data.openPorts ?? data.results ?? data.ports ?? [];
  const results = (Array.isArray(resultsRaw) ? resultsRaw : []).map((entry, index) =>
    normalizeOpenPortEntry(entry, index, scanMode)
  );

  const target =
    resolveDisplayText(data.target, "") ||
    asset.ip ||
    asset.hostname ||
    "—";

  const misconfigurations = normalizeMisconfigurationList(data.misconfigurations ?? []);

  const serviceMap = {};
  results.forEach((row) => {
    const key = row.service || "Other";
    serviceMap[key] = (serviceMap[key] ?? 0) + 1;
  });

  return {
    taskId: data.task_id ?? data.taskId ?? null,
    status: resolveDisplayText(data.status, "completed"),
    target,
    asset,
    results,
    misconfigurations,
    summary: {
      open: results.filter((row) => row.state === "open").length,
      closed: Number(data.summary?.closed ?? data.closedCount ?? 0),
      filtered: Number(data.summary?.filtered ?? data.filteredCount ?? 0),
    },
    services: Object.keys(serviceMap).length ? serviceMap : null,
    raw: data,
  };
}

export function normalizeLiveStream(payload = {}) {
  const data = payload.data ?? payload;
  const packetsRaw = data.packets ?? data.sample_packets ?? data.samplePackets ?? data.stream ?? data.logs ?? [];

  const formatTimestamp = (value) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString(undefined, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const packets = packetsRaw.map((p, i) => {
    const protocol = (p.protocol ?? p.proto ?? "UNKNOWN").toUpperCase();
    const suspicious = Boolean(p.suspicious);
    return {
      id: p.id ?? i + 1,
      timestamp: formatTimestamp(p.timestamp ?? p.time ?? p.ts),
      protocol,
      src: p.src ?? p.source ?? `${p.srcIp ?? p.src_ip ?? "?"}:${p.srcPort ?? p.src_port ?? "?"}`,
      dst: p.dst ?? p.destination ?? `${p.dstIp ?? p.dst_ip ?? "?"}:${p.dstPort ?? p.dst_port ?? "?"}`,
      length: Number(p.length ?? p.len ?? p.size ?? 0),
      summary: p.summary ?? p.info ?? p.details ?? (suspicious ? "Suspicious traffic" : `${protocol} flow`),
      suspicious,
    };
  });

  const protocolCounts = packets.reduce((counts, packet) => {
    const key = packet.protocol || "UNKNOWN";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  const protocols = Object.keys(data.protocols ?? data.protocolBreakdown ?? {}).length
    ? (data.protocols ?? data.protocolBreakdown ?? {})
    : protocolCounts;

  const suspiciousCount = Number(
    data.stats?.suspicious
    ?? data.suspiciousPackets
    ?? packets.filter((packet) => packet.suspicious || packet.summary?.toLowerCase().includes("suspicious")).length
  );

  const totalPackets = Number(
    data.stats?.totalPackets ?? data.totalPackets ?? data.packet_count ?? packets.length
  );
  const durationSec = Number(data.duration_sec ?? data.durationSec ?? 5);
  const avgPps = totalPackets > 0
    ? Math.round(totalPackets / Math.max(durationSec, 1))
    : 0;

  return {
    packets,
    protocols,
    status: data.status ?? null,
    sessionId: data.session_id ?? data.sessionId ?? null,
    stats: {
      totalPackets,
      suspicious: suspiciousCount,
      protocols: Number(
        data.stats?.protocols ?? Object.keys(protocols).length
      ),
      avgPps: Number(data.stats?.avgPps ?? data.avgPps ?? avgPps),
    },
    raw: data,
  };
}

export function buildDashboardSummary(assets = [], misconfigs = [], flow = {}) {
  const online = assets.filter((a) => a.isOnline || a.status === "online" || a.status === "active").length;
  const openPorts = assets.reduce((sum, a) => sum + Number(a.openPorts || 0), 0);
  const openMisconfigs = misconfigs.filter(
    (m) => !["fixed", "resolved", "accepted"].includes(m.status)
  );
  const criticalThreats = openMisconfigs.filter((m) => m.severity === "critical").length;

  const severityRisk = { critical: 90, high: 70, medium: 50, low: 30 };

  const assetsWithRisk = assets.map((asset) => {
    if (asset.riskScore > 0) return asset;

    const related = openMisconfigs.filter(
      (m) => m.ip === asset.ip || m.asset === asset.ip || m.assetIp === asset.ip
    );
    const misconfigRisk = related.reduce(
      (max, item) => Math.max(max, severityRisk[item.severity] ?? 40),
      0
    );
    const portRisk = Math.min(60, Number(asset.openPorts || 0) * 12);

    return {
      ...asset,
      riskScore: Math.max(misconfigRisk, portRisk),
    };
  });

  return {
    totalAssets: assets.length,
    activeHosts: online,
    openPorts,
    alerts: openMisconfigs.length,
    threats: criticalThreats,
    topVulnerable: [...assetsWithRisk]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5),
    flow,
  };
}

export function sortBySeverity(items = []) {
  return [...items].sort((a, b) => {
    const sa = SEVERITY_ORDER[normalizeSeverity(a.severity)] ?? 99;
    const sb = SEVERITY_ORDER[normalizeSeverity(b.severity)] ?? 99;
    return sa - sb;
  });
}

export function formatNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "—";
  return n.toLocaleString();
}
