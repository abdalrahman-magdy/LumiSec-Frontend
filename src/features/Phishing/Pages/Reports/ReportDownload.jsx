import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PhishingAlert from "../../Components/Shared/PhishingAlert";
import RoleGate from "../../Components/Shared/RoleGate";
import { canViewReports } from "../../utils/roles";
import { downloadReport } from "../../services/phishingApi";
import "../../Components/Shared/PhishingShared.css";

export default function ReportDownload() {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        await downloadReport(id);
        setDone(true);
      } catch (err) {
        setError(err.message);
      }
    };
    if (id) run();
  }, [id]);

  return (
    <RoleGate allow={canViewReports} fallback={<p className="text-danger p-3">Access denied.</p>}>
      <div className="phishing-soc-page text-center p-5">
        <PhishingAlert type="danger" message={error} />
        {done ? (
          <>
            <i className="fa-solid fa-circle-check text-success fs-1 mb-3" />
            <h5 className="text-white">Report download started</h5>
            <Link to="/Phishing/Reports" className="btn add-btn text-white border-0 mt-3">Back to Reports</Link>
          </>
        ) : (
          <p className="text-secondary">Preparing PDF export...</p>
        )}
      </div>
    </RoleGate>
  );
}
