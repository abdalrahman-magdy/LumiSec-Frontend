import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './features/auth/pages/Login';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute, { PublicOnlyRoute } from './features/auth/components/ProtectedRoute';
import GRC from './features/GRC/pages/GRC';
import GRCDashboard from './features/GRC/pages/GRCDashboard';
import GRCAudits from './features/GRC/pages/GRCAudits';
import GRCStandards from './features/GRC/pages/GRCStandards';
import GRCRemediation from './features/GRC/pages/GRCRemediation';
import GRCSettings from './features/GRC/pages/GRCSettings';
import IncidentQueue from './features/SOAR/Pages/IncidentQueue';
import Soar from './features/SOAR/Pages/Soar';
import SoarAnalytics from './features/SOAR/Pages/SoarAnalytics';
import IncidentManagement from './features/SOAR/Pages/IncidentManagement';
import Network from './features/Network/Pages/Network';
import Dashboard from './features/Network/Pages/Dashboard';
import NetworkDiscovery from './features/Network/Pages/NetworkDiscovery';
import PortScanning from './features/Network/Pages/PortScanning';
import PacketCapture from './features/Network/Pages/PacketCapture';
import AssetInventory from './features/Network/Pages/AssetInventory';
import Misconfigurations from './features/Network/Pages/Misconfigurations';
import FlowMonitoring from './features/Network/Pages/FlowMonitoring';
import Phishing from './features/Phishing/Pages/Phishing';
import PhishingSettings from './features/Phishing/Pages/PhishingSettings';
import Overview from './features/Phishing/Pages/Dashboard/Overview';
import Risks from './features/Phishing/Pages/Dashboard/Risks';
import Departments from './features/Phishing/Pages/Dashboard/Departments';
import Trends from './features/Phishing/Pages/Dashboard/Trends';
import CampaignList from './features/Phishing/Pages/Campaigns/CampaignList';
import CampaignDetails from './features/Phishing/Pages/Campaigns/CampaignDetails';
import CampaignCreate from './features/Phishing/Pages/Campaigns/CampaignCreate';
import CampaignLaunchConsole from './features/Phishing/Pages/Campaigns/CampaignLaunchConsole';
import TemplatesList from './features/Phishing/Pages/Templates/TemplatesList';
import TemplateEditor from './features/Phishing/Pages/Templates/TemplateEditor';
import LandingPagesList from './features/Phishing/Pages/LandingPages/LandingPagesList';
import LandingPageEditor from './features/Phishing/Pages/LandingPages/LandingPageEditor';
import RecipientsList from './features/Phishing/Pages/Recipients/RecipientsList';
import ImportRecipients from './features/Phishing/Pages/Recipients/ImportRecipients';
import TrackingLogs from './features/Phishing/Pages/Tracking/TrackingLogs';
import EventTimeline from './features/Phishing/Pages/Tracking/EventTimeline';
import ReportViewer from './features/Phishing/Pages/Reports/ReportViewer';
import ReportDownload from './features/Phishing/Pages/Reports/ReportDownload';
import SIEMIntegration from './features/SIEMIntegration/pages/SIEMIntegration';

const myRouter = createBrowserRouter([
    { path: "/", element: <PublicOnlyRoute><Login /></PublicOnlyRoute> },
    { path: "/SIEMIntegration", element: <ProtectedRoute><SIEMIntegration /></ProtectedRoute> },
    { path: "/GRC", element: <ProtectedRoute><GRC/></ProtectedRoute>,
        children:[
            { path: "", element:  <GRCDashboard/>},
            { path: "/GRC/Audits", element:  <GRCAudits/>},
            { path: "/GRC/Standards", element:  <GRCStandards/>},
            { path: "/GRC/Remediation", element:  <GRCRemediation/>},
            { path: "/GRC/Settings", element:  <GRCSettings/>},
        ]
    },
    { path: "/SOAR", element: <ProtectedRoute><Soar/></ProtectedRoute>,
        children:[
            { path: "", element:  <SoarAnalytics/>},
            { path: "/SOAR/Analytics", element:  <SoarAnalytics/>},
            { path: "/SOAR/IncidentsQueue", element:  <IncidentQueue/>},
            { path: "/SOAR/IncidentManagement", element:  <IncidentManagement/>},
        ]
    },

    { path: "/Network", element: <ProtectedRoute><Network/></ProtectedRoute>,
        children:[
            { path: "", element:  <Dashboard/>},
            { path: "/Network/NetworkDiscovery", element:  <NetworkDiscovery/>},
            { path: "/Network/PortScanning", element:  <PortScanning/>},
            { path: "/Network/PacketCapture", element:  <PacketCapture />},
            { path: "/Network/packetCapture", element:  <PacketCapture />},
            { path: "/Network/AssetInventory", element:  <AssetInventory />},
            { path: "/Network/Misconfigurations", element:  <Misconfigurations />},
            { path: "/Network/FlowMonitoring", element:  <FlowMonitoring />},
        ]
    },

    { path: "/Phishing", element: <ProtectedRoute><Phishing/></ProtectedRoute>,
        children:[
            { path: "", element:  <Overview />},
            { path: "/Phishing/Dashboard/Risks", element:  <Risks />},
            { path: "/Phishing/Dashboard/Departments", element:  <Departments />},
            { path: "/Phishing/Dashboard/Trends", element:  <Trends />},
            { path: "/Phishing/Campaigns", element:  <CampaignList />},
            { path: "/Phishing/Campaigns/create", element:  <CampaignCreate />},
            { path: "/Phishing/Campaigns/:id/launch", element:  <CampaignLaunchConsole />},
            { path: "/Phishing/Campaigns/:id", element:  <CampaignDetails />},
            { path: "/Phishing/Templates", element:  <TemplatesList />},
            { path: "/Phishing/Templates/:id/edit", element:  <TemplateEditor />},
            { path: "/Phishing/LandingPages", element:  <LandingPagesList />},
            { path: "/Phishing/LandingPages/:id/edit", element:  <LandingPageEditor />},
            { path: "/Phishing/Recipients", element:  <RecipientsList />},
            { path: "/Phishing/Recipients/import", element:  <ImportRecipients />},
            { path: "/Phishing/Tracking/Logs", element:  <TrackingLogs />},
            { path: "/Phishing/Tracking/Timeline", element:  <EventTimeline />},
            { path: "/Phishing/Reports", element:  <ReportViewer />},
            { path: "/Phishing/Reports/download/:id", element:  <ReportDownload />},
            { path: "/Phishing/Settings", element:  <PhishingSettings />},
            { path: "/Phishing/EmailTemplates", element:  <TemplatesList />},
        ]
    },

])

function App() {
return <>
    <AuthProvider>
      <RouterProvider router={myRouter} />
    </AuthProvider>
    </>
}

export default App;
