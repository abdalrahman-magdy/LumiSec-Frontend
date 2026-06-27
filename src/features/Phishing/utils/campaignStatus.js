/** Matches backend `campaignStatus` enum */
export const CAMPAIGN_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  RUNNING: "running",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export function normalizeCampaignStatus(status) {
  const s = (status ?? CAMPAIGN_STATUS.DRAFT).toLowerCase();
  if (s === "active") return CAMPAIGN_STATUS.RUNNING;
  return s;
}

export function campaignStatusClass(status) {
  const s = normalizeCampaignStatus(status);
  const known = Object.values(CAMPAIGN_STATUS);
  if (known.includes(s)) {
    return `campaign-status-${s}`;
  }
  return "campaign-status-draft";
}

export function canPauseCampaign(status) {
  return normalizeCampaignStatus(status) === CAMPAIGN_STATUS.RUNNING;
}

export function canResumeCampaign(status) {
  return normalizeCampaignStatus(status) === CAMPAIGN_STATUS.PAUSED;
}

export function canStopCampaign(status) {
  const s = normalizeCampaignStatus(status);
  return [CAMPAIGN_STATUS.RUNNING, CAMPAIGN_STATUS.PAUSED, CAMPAIGN_STATUS.SCHEDULED].includes(s);
}

export function canLaunchCampaign(status) {
  const s = normalizeCampaignStatus(status);
  return [CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.SCHEDULED].includes(s);
}

export function canViewLaunchConsole(status) {
  const s = normalizeCampaignStatus(status);
  return ![CAMPAIGN_STATUS.COMPLETED, CAMPAIGN_STATUS.CANCELLED].includes(s);
}

export function canEditCampaignMetadata(status) {
  const s = normalizeCampaignStatus(status);
  return ![CAMPAIGN_STATUS.RUNNING, CAMPAIGN_STATUS.COMPLETED].includes(s);
}

export function canDeleteCampaign(status) {
  const s = normalizeCampaignStatus(status);
  return [
    CAMPAIGN_STATUS.DRAFT,
    CAMPAIGN_STATUS.SCHEDULED,
    CAMPAIGN_STATUS.CANCELLED,
    CAMPAIGN_STATUS.COMPLETED,
  ].includes(s);
}

export function extractCampaignId(data) {
  if (!data) return null;
  return data.id ?? data._id ?? data.raw?._id ?? null;
}
